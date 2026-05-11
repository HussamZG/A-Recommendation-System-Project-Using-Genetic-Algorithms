import "server-only"; // يضمن تنفيذ هذا الملف فقط على الخادم (Server-Side) لحماية منطق التوصية

import {
  getCatalogSnapshot,
  getRelatedProductsFromProducts,
  type CatalogSnapshot,
  type InteractionRecord,
} from "@/lib/server/catalog";
import type { Product, User } from "@/lib/data";


// ملف تعريف المستخدم: يخزّن تفاعلاته المُحلّلة لاستخلاص تفضيلاته (الفئة المفضلة، السعر المفضل)
interface UserProfile {
  interactions: InteractionRecord[];
  interactionByProduct: Map<number, InteractionRecord>;
  seenProductIds: Set<number>;
  purchasedProductIds: Set<number>;
  categoryWeights: Map<string, number>;
  preferredPrice: number;
  maxCategoryWeight: number;
  favoriteCategories: Set<string>;
}

// إحصائيات عامة لجميع المنتجات: تُستخدم لتطبيع (Normalize) الدرجات عند مقارنة المنتجات ببعضها
interface ProductStats {
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  maxPurchases: number;
  maxClicks: number;
  maxViews: number;
}

// عنصر توصية واحد: يجمع بين بيانات المنتج ودرجة ملاءمته المحسوبة للمستخدم
export interface RecommendationItem {
  product: Product;
  behavior: {
    viewed: number;
    clicked: number;
    purchased: number;
    rating: number;
    fitness: number;
  };
  fitness: number;
}

// عنصر من سجل تاريخ المستخدم: يُظهر تفاعلاته السابقة مع منتج معين
export interface UserHistoryItem {
  product: Product;
  viewed: number;
  clicked: number;
  purchased: number;
  rating: number;
  fitness: number;
}

// الاستجابة النهائية لطلب التوصية: تحتوي على القائمة المُحسّنة + إحصائيات الأجيال
export interface RecommendationResponse {
  user: User;
  recommendations: RecommendationItem[];
  otherProducts: Product[];
  history: UserHistoryItem[];
  scoreHistory: number[];
  stats: {
    bestScore: number;
    initialScore: number;
    finalScore: number;
    improvement: number;
    viewedCount: number;
    clickedCount: number;
    purchasedCount: number;
    interactionsCount: number;
    generations: number;
    dataSource: "local" | "supabase";
  };
}

// مولد أرقام شبه عشوائية (PRNG) مُعتمَد على بذرة (Seed): يضمن تكرارية النتائج لنفس المستخدم
function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// توليد عدد صحيح عشوائي بين حدين (شامل): min و max
function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

// اختيار عينة عشوائية فريدة (بدون تكرار) باستخدام خوارزمية خلط Fisher-Yates
function sampleUnique(values: number[], count: number, random: () => number) {
  const pool = [...values];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, count);
}

// بناء إحصائيات المنتجات: يُحسب أدنى/أعلى/متوسط السعر + أقصى عدد مشتريات/نقرات/مشاهدات لتطبيع الشعبية
function buildProductStats(products: Product[]): ProductStats {
  return {
    priceMin: Math.min(...products.map((product) => product.price)),
    priceMax: Math.max(...products.map((product) => product.price)),
    priceAvg: products.reduce((sum, product) => sum + product.price, 0) / products.length,
    maxPurchases: Math.max(...products.map((product) => product.purchases), 1),
    maxClicks: Math.max(...products.map((product) => product.clicks), 1),
    maxViews: Math.max(...products.map((product) => product.views), 1),
  };
}

// بناء ملف تعريف المستخدم: يحلّل سجل تفاعلاته لاستخراج الفئات المفضلة (بأوزانها) والسعر المفضل المُرجّح
function buildUserProfile(userId: number, catalog: CatalogSnapshot, productStats: ProductStats): UserProfile {
  const interactions = catalog.interactionsByUser.get(userId) ?? [];
  const interactionByProduct = new Map<number, InteractionRecord>();
  const seenProductIds = new Set<number>();
  const purchasedProductIds = new Set<number>();
  const categoryWeights = new Map<string, number>();

  let weightedPriceSum = 0;
  let totalWeight = 0;

  for (const interaction of interactions) {
    interactionByProduct.set(interaction.product_id, interaction);
    seenProductIds.add(interaction.product_id);

    if (interaction.purchased) {
      purchasedProductIds.add(interaction.product_id);
    }

    const product = catalog.productsById.get(interaction.product_id);
    if (!product) {
      continue;
    }

    const signalWeight =
      Math.max(1, interaction.fitness) +
      (interaction.clicked * 2) +
      (interaction.purchased * 4);

    categoryWeights.set(
      product.category.id,
      (categoryWeights.get(product.category.id) ?? 0) + signalWeight,
    );

    weightedPriceSum += product.price * signalWeight;
    totalWeight += signalWeight;
  }

  const sortedCategories = [...categoryWeights.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([categoryId]) => categoryId);

  return {
    interactions,
    interactionByProduct,
    seenProductIds,
    purchasedProductIds,
    categoryWeights,
    preferredPrice: totalWeight > 0 ? weightedPriceSum / totalWeight : productStats.priceAvg,
    maxCategoryWeight: Math.max(1, ...categoryWeights.values()),
    favoriteCategories: new Set(sortedCategories),
  };
}

// حساب درجة ملاءمة منتج واحد للمستخدم: مجموع مرجّح لملاءمة الفئة (8) + السعر (4) + الشعبية (4) + التقييم (3) + مكافآت
function getCandidateScore(product: Product, profile: UserProfile, productStats: ProductStats) {
  const hasHistory = profile.categoryWeights.size > 0;
  const categoryAffinity = hasHistory
    ? (profile.categoryWeights.get(product.category.id) ?? 0) / profile.maxCategoryWeight
    : 0.45;

  const priceRange = Math.max(1, productStats.priceMax - productStats.priceMin);
  const priceAffinity = Math.max(
    0,
    1 - Math.abs(product.price - profile.preferredPrice) / priceRange,
  );

  const popularityScore =
    (product.purchases / productStats.maxPurchases) * 0.45 +
    (product.clicks / productStats.maxClicks) * 0.35 +
    (product.views / productStats.maxViews) * 0.2;

  const ratingScore = product.rating > 0 ? product.rating / 5 : 0.45;
  const favoriteCategoryBonus = profile.favoriteCategories.has(product.category.id) ? 1 : 0;
  const explorationBonus = profile.seenProductIds.has(product.product_id) ? 0 : 1;

  const rawScore =
    2 +
    Math.round(categoryAffinity * 8) +
    Math.round(priceAffinity * 4) +
    Math.round(popularityScore * 4) +
    Math.round(ratingScore * 3) +
    favoriteCategoryBonus +
    explorationBonus;

  return Math.max(1, Math.min(23, rawScore));
}

// دالة اللياقة (Fitness Function): تقيّم مجموعة كاملة (فرد) بناءً على مجموع درجات منتجاتها + تنوع الفئات (+2) - تكرار الفئات (-3)
function evaluate(
  individual: number[],
  candidateScores: Map<number, number>,
  catalog: CatalogSnapshot,
) {
  const categoryCounts = new Map<string, number>();
  let score = 0;

  for (const productId of individual) {
    const product = catalog.productsById.get(productId);
    score += candidateScores.get(productId) ?? 0;

    if (product) {
      categoryCounts.set(
        product.category.id,
        (categoryCounts.get(product.category.id) ?? 0) + 1,
      );
    }
  }

  const uniqueCategories = categoryCounts.size;
  const duplicateCategoryCount = [...categoryCounts.values()].reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0,
  );

  return score + (uniqueCategories * 2) - (duplicateCategoryCount * 3);
}

// عملية الانتقاء (Selection): الاحتفاظ بأفضل نسبة (افتراضياً 50%) من المجتمع الحالي بناءً على درجات اللياقة
function selection(population: number[][], scores: number[], keepRatio: number = 0.5) {
  const keepCount = Math.max(2, Math.floor(population.length * keepRatio));

  return population
    .map((individual, index) => ({ individual, score: scores[index] }))
    .sort((left, right) => right.score - left.score)
    .slice(0, keepCount)
    .map((item) => item.individual);
}

// عملية التهجين (Crossover): دمج جزء من الأب الأول مع باقي الأم الثانية لإنتاج ابن جديد بدون تكرار منتجات
function crossover(parent1: number[], parent2: number[], topN: number, random: () => number) {
  const point = randomInt(random, 1, topN - 1);
  const child = parent1.slice(0, point);

  for (const productId of parent2) {
    if (!child.includes(productId)) {
      child.push(productId);
    }

    if (child.length === topN) {
      break;
    }
  }

  return child;
}

// عملية الطفرة (Mutation): استبدال منتج عشوائي داخل المجموعة بآخر جديد بنسبة معينة لتجنب الوقوع في الحلول المحلية (Local Optima)
function mutate(
  individual: number[],
  allProducts: number[],
  mutationRate: number,
  random: () => number,
) {
  if (random() >= mutationRate) {
    return individual;
  }

  const mutated = [...individual];
  const targetIndex = randomInt(random, 0, mutated.length - 1);
  let replacement = allProducts[randomInt(random, 0, allProducts.length - 1)];

  while (mutated.includes(replacement)) {
    replacement = allProducts[randomInt(random, 0, allProducts.length - 1)];
  }

  mutated[targetIndex] = replacement;
  return mutated;
}

// بناء مجموعة المرشحين (Candidate Pool): تصفية المنتجات غير المشتراة/غير المشاهدة ثم ترتيبها تنازلياً حسب الدرجة
function buildCandidatePool(
  profile: UserProfile,
  catalog: CatalogSnapshot,
  productStats: ProductStats,
  topN: number,
) {
  let eligibleProducts = catalog.products.filter(
    (product) =>
      !profile.purchasedProductIds.has(product.product_id) &&
      !profile.seenProductIds.has(product.product_id),
  );

  if (eligibleProducts.length < topN) {
    eligibleProducts = catalog.products.filter(
      (product) => !profile.purchasedProductIds.has(product.product_id),
    );
  }

  const candidateScores = new Map<number, number>();
  for (const product of eligibleProducts) {
    candidateScores.set(
      product.product_id,
      getCandidateScore(product, profile, productStats),
    );
  }

  const rankedProductIds = [...eligibleProducts]
    .sort((left, right) => {
      const scoreDelta =
        (candidateScores.get(right.product_id) ?? 0) -
        (candidateScores.get(left.product_id) ?? 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return right.purchases - left.purchases;
    })
    .map((product) => product.product_id);

  return {
    candidateScores,
    eligibleProductIds: rankedProductIds,
  };
}

// المحرك الرئيسي للخوارزمية الجينية: يُنفّذ دورات التطور (أجيال) لاكتشاف أفضل تشكيلة من المنتجات للمستخدم
function geneticRecommendation(
  userId: number,
  catalog: CatalogSnapshot,
  options?: {
    topN?: number;          // عدد التوصيات النهائية
    populationSize?: number; // حجم المجتمع (عدد المجموعات في كل جيل)
    generations?: number;   // عدد الأجيال (دورات التطور)
    mutationRate?: number;  // نسبة حدوث الطفرة (0.12 = 12%)
    seed?: number;          // البذرة لتكرارية المولد العشوائي
  },
) {
  const topN = options?.topN ?? 5;            // عدد المنتجات المُوصى بها (5 افتراضياً)
  const populationSize = options?.populationSize ?? 24; // حجم المجتمع: 24 مجموعة مختلفة في كل جيل
  const generations = options?.generations ?? 45;  // عدد الأجيال: 45 جيلاً من التطور والتحسين
  const mutationRate = options?.mutationRate ?? 0.12; // نسبة الطفرة: 12% لكل ابن جديد
  const random = createRandom(options?.seed ?? userId); // مولد مُبذور بمعرّف المستخدم لتكرارية النتائج
  const productStats = buildProductStats(catalog.products); // إحصائيات المنتجات للتطبيع

  const profile = buildUserProfile(userId, catalog, productStats); // تحليل تفضيلات المستخدم
  const { candidateScores, eligibleProductIds } = buildCandidatePool( // بناء مجموعة المرشحين المؤهلين
    profile,
    catalog,
    productStats,
    topN,
  );

  // إذا كان عدد المرشحين قليلاً جداً (أقل أو يساوي topN)، نُرجع أفضلهم مباشرة دون الحاجة لخوارزمية جينية
  if (eligibleProductIds.length <= topN) {
    const bestProducts = eligibleProductIds.slice(0, topN);
    const bestScore = evaluate(bestProducts, candidateScores, catalog);
    return {
      bestProducts,
      bestScore,
      scoreHistory: [bestScore],
      candidateScores,
      profile,
    };
  }

  // تهيئة المجتمع الأولي: توليد مجموعات عشوائية فريدة من المرشحين (كل مجموعة = فرد)
  let population = Array.from({ length: populationSize }, () =>
    sampleUnique(eligibleProductIds, topN, random),
  );

  const scoreHistory: number[] = []; // سجل أعلى درجة لياقة في كل جيل (للتتبع والرسوم البيانية)

  // حلقة الأجيال الرئيسية: كل جيل يُقيّم المجتمع، يُنتقي الأفضل، يُهجنهم، ويطبّق الطفرات
  for (let generation = 0; generation < generations; generation += 1) {
    const scores = population.map((individual) => evaluate(individual, candidateScores, catalog)); // تقييم كل مجموعة
    scoreHistory.push(Math.max(...scores)); // تسجيل أفضل درجة في هذا الجيل

    const parents = selection(population, scores); // انتقاء الأباء الأقوياء (أفضل 50%)
    const newPopulation = [...parents]; // بدء جيل جديد بالأباء

    // إعادة ملء المجتمع بالأبناء (Crossover + Mutation) حتى يصل لحجمه الأصلي
    while (newPopulation.length < populationSize) {
      const firstParent = parents[randomInt(random, 0, parents.length - 1)]; // اختيار أب عشوائي
      let secondParent = parents[randomInt(random, 0, parents.length - 1)]; // اختيار أم عشوائية

      while (secondParent === firstParent && parents.length > 1) {
        secondParent = parents[randomInt(random, 0, parents.length - 1)]; // تجنب اختيار نفس الأب
      }

      const child = mutate(
        crossover(firstParent, secondParent, topN, random), // تهجين الأبين لإنتاج ابن
        eligibleProductIds,
        mutationRate,
        random,
      );
      newPopulation.push(child);
    }

    population = newPopulation; // الانتقال للجيل التالي
  }

  // بعد انتهاء الأجيال: تقييم المجتمع النهائي واختيار الفرد ذي أعلى درجة لياقة
  const finalScores = population.map((individual) => evaluate(individual, candidateScores, catalog));
  const bestScore = Math.max(...finalScores);
  const bestIndex = finalScores.indexOf(bestScore);

  return {
    bestProducts: population[bestIndex],
    bestScore,
    scoreHistory,
    candidateScores,
    profile,
  };
}

// تجميع بيانات منتج مقترح في كائن RecommendationItem: يجمع المنتج + سلوك المستخدم + درجة الملاءمة
function buildRecommendationItem(
  productId: number,
  profile: UserProfile,
  candidateScores: Map<number, number>,
  catalog: CatalogSnapshot,
): RecommendationItem | null {
  const product = catalog.productsById.get(productId);
  if (!product) {
    return null;
  }

  const interaction = profile.interactionByProduct.get(productId);

  return {
    product,
    behavior: {
      viewed: interaction?.viewed ?? 0,
      clicked: interaction?.clicked ?? 0,
      purchased: interaction?.purchased ?? 0,
      rating: interaction?.rating ?? 0,
      fitness: interaction?.fitness ?? 0,
    },
    fitness: candidateScores.get(productId) ?? 0,
  };
}

// نقطة الدخول الرئيسية (API): تجلب لقطة الكتالوج وتُشغل GA ثم تُجهز الاستجابة النهائية مع المنتجات ذات الصلة
export async function getRecommendationPayload(userId: number): Promise<RecommendationResponse | null> {
  const catalog = await getCatalogSnapshot();
  const user = catalog.usersById.get(userId) ?? null;
  if (!user) {
    return null;
  }

  const {
    bestProducts,
    bestScore,
    scoreHistory,
    candidateScores,
    profile,
  } = geneticRecommendation(userId, catalog, {
    topN: 5,
    populationSize: 24,
    generations: 45,
    mutationRate: 0.12,
    seed: userId,
  });

  const recommendations = bestProducts
    .map((productId) => buildRecommendationItem(productId, profile, candidateScores, catalog))
    .filter((item): item is RecommendationItem => item !== null);

  const recommendationIds = new Set(recommendations.map((item) => item.product.product_id));
  const anchorProductId = recommendations[0]?.product.product_id ?? catalog.products[0]?.product_id ?? 1;
  const otherProducts = getRelatedProductsFromProducts(catalog.products, anchorProductId, 12)
    .filter((product) => !recommendationIds.has(product.product_id))
    .slice(0, 4);

  const history = profile.interactions
    .map((interaction) => {
      const product = catalog.productsById.get(interaction.product_id);
      if (!product) {
        return null;
      }

      return {
        product,
        viewed: interaction.viewed,
        clicked: interaction.clicked,
        purchased: interaction.purchased,
        rating: interaction.rating,
        fitness: interaction.fitness,
      };
    })
    .filter((item): item is UserHistoryItem => item !== null)
    .sort((left, right) => {
      const fitnessDelta = right.fitness - left.fitness;
      if (fitnessDelta !== 0) {
        return fitnessDelta;
      }

      return right.product.product_id - left.product.product_id;
    })
    .slice(0, 10);

  const viewedCount = profile.interactions.reduce((sum, item) => sum + item.viewed, 0);
  const clickedCount = profile.interactions.reduce((sum, item) => sum + item.clicked, 0);
  const purchasedCount = profile.interactions.reduce((sum, item) => sum + item.purchased, 0);
  const initialScore = scoreHistory[0] ?? bestScore;
  const finalScore = scoreHistory.at(-1) ?? bestScore;

  return {
    user,
    recommendations,
    otherProducts,
    history,
    scoreHistory,
    stats: {
      bestScore,
      initialScore,
      finalScore,
      improvement: finalScore - initialScore,
      viewedCount,
      clickedCount,
      purchasedCount,
      interactionsCount: profile.interactions.length,
      generations: scoreHistory.length,
      dataSource: catalog.source,
    },
  };
}
