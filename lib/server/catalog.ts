import "server-only";

import {
  hydrateProduct,
  paginateProducts,
  type Product,
  type ProductFilterOptions,
  type User,
} from "@/lib/data";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";


export interface InteractionRecord {
  user_id: number;
  product_id: number;
  viewed: number;
  clicked: number;
  purchased: number;
  rating: number;
  fitness: number;
}

export interface SummaryData {
  totalUsers: number;
  totalProducts: number;
  totalRatings: number;
  totalBehaviorRows: number;
  maxFitnessScore: number;
  pricing: {
    min: number;
    max: number;
    avg: number;
  };
  funnel: {
    views: number;
    clicks: number;
    purchases: number;
    clickRate: number;
    purchaseRate: number;
    purchaseFromClicksRate: number;
  };
  categoryDistribution: Array<{
    id: string;
    name: string;
    color: string;
    count: number;
    percentage: number;
  }>;
  ratingDistribution: Array<{
    score: number;
    count: number;
    percentage: number;
  }>;
  topProducts: Array<{
    product_id: number;
    name: string;
    category: string;
    price: number;
    rating: number;
    rating_count: number;
    views: number;
    clicks: number;
    purchases: number;
  }>;
}

export interface CatalogSnapshot {
  users: User[];
  usersById: Map<number, User>;
  products: Product[];
  productsById: Map<number, Product>;
  interactions: InteractionRecord[];
  interactionsByUser: Map<number, InteractionRecord[]>;
  summary: SummaryData;
  source: "local" | "supabase";
}

interface UserRow {
  user_id: number;
  age: number;
  country: string;
}

interface ProductRow {
  product_id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  rating_count: number;
  views: number;
  clicks: number;
  purchases: number;
}

const COUNTRY_LABELS: Record<string, string> = {
  Jordan: "الأردن",
  UAE: "الإمارات",
  Egypt: "مصر",
  Morocco: "المغرب",
  "Saudi Arabia": "السعودية",
  Qatar: "قطر",
  Kuwait: "الكويت",
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

function hydrateUser(record: UserRow): User {
  return {
    ...record,
    country: COUNTRY_LABELS[record.country] ?? record.country,
  };
}

function normalizeInteractionRecord(record: Partial<InteractionRecord>) {
  return {
    user_id: Number(record.user_id ?? 0),
    product_id: Number(record.product_id ?? 0),
    viewed: Number(record.viewed ?? 0),
    clicked: Number(record.clicked ?? 0),
    purchased: Number(record.purchased ?? 0),
    rating: Number(record.rating ?? 0),
    fitness: Number(record.fitness ?? 0),
  };
}

function matchesQuery(product: Product, query: string) {
  const normalizedQuery = query.trim().toLowerCase().replace(/#/g, '');
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    product.name,
    product.category.name,
    product.category.id,
    String(product.product_id),
  ]
    .join(" ")
    .toLowerCase();

  const tokens = normalizedQuery.split(/\s+/);
  return tokens.every((token) => haystack.includes(token));
}

function buildSummary(
  users: User[],
  products: Product[],
  interactions: InteractionRecord[],
): SummaryData {
  const prices = products.map((product) => product.price);
  const totalViews = interactions.reduce((sum, row) => sum + row.viewed, 0);
  const totalClicks = interactions.reduce((sum, row) => sum + row.clicked, 0);
  const totalPurchases = interactions.reduce((sum, row) => sum + row.purchased, 0);
  const ratingCounts = new Map<number, number>();

  for (const interaction of interactions) {
    if (interaction.rating > 0) {
      ratingCounts.set(
        interaction.rating,
        (ratingCounts.get(interaction.rating) ?? 0) + 1,
      );
    }
  }

  const totalRatings = [...ratingCounts.values()].reduce((sum, count) => sum + count, 0);

  const categoryCounts = new Map<string, { name: string; color: string; count: number }>();
  for (const product of products) {
    const current = categoryCounts.get(product.category.id);
    if (current) {
      current.count += 1;
      continue;
    }

    categoryCounts.set(product.category.id, {
      name: product.category.name,
      color: product.category.color,
      count: 1,
    });
  }

  const categoryDistribution = [...categoryCounts.entries()]
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
    .map(([categoryId, meta]) => ({
      id: categoryId,
      name: meta.name,
      color: meta.color,
      count: meta.count,
      percentage: products.length
        ? Number(((meta.count / products.length) * 100).toFixed(1))
        : 0,
    }));

  const ratingDistribution = Array.from({ length: 5 }, (_, index) => {
    const score = index + 1;
    const count = ratingCounts.get(score) ?? 0;

    return {
      score,
      count,
      percentage: totalRatings ? Number(((count / totalRatings) * 100).toFixed(1)) : 0,
    };
  });

  const topProducts = getTopProductsFromProducts(products, 5).map((product) => ({
    product_id: product.product_id,
    name: product.name,
    category: product.category.id,
    price: product.price,
    rating: product.rating,
    rating_count: product.rating_count,
    views: product.views,
    clicks: product.clicks,
    purchases: product.purchases,
  }));

  return {
    totalUsers: users.length,
    totalProducts: products.length,
    totalRatings,
    totalBehaviorRows: interactions.length,
    maxFitnessScore: 23,
    pricing: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      avg: prices.length
        ? Number((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2))
        : 0,
    },
    funnel: {
      views: totalViews,
      clicks: totalClicks,
      purchases: totalPurchases,
      clickRate: totalViews ? Number(((totalClicks / totalViews) * 100).toFixed(1)) : 0,
      purchaseRate: totalViews
        ? Number(((totalPurchases / totalViews) * 100).toFixed(1))
        : 0,
      purchaseFromClicksRate: totalClicks
        ? Number(((totalPurchases / totalClicks) * 100).toFixed(1))
        : 0,
    },
    categoryDistribution,
    ratingDistribution,
    topProducts,
  };
}

function buildSnapshot(
  users: User[],
  products: Product[],
  interactions: InteractionRecord[],
  source: "local" | "supabase",
  summaryOverride?: SummaryData,
): CatalogSnapshot {
  const usersById = new Map(users.map((user) => [user.user_id, user]));
  const productsById = new Map(products.map((product) => [product.product_id, product]));
  const interactionsByUser = new Map<number, InteractionRecord[]>();

  for (const interaction of interactions) {
    const list = interactionsByUser.get(interaction.user_id) ?? [];
    list.push(interaction);
    interactionsByUser.set(interaction.user_id, list);
  }

  return {
    users,
    usersById,
    products,
    productsById,
    interactions,
    interactionsByUser,
    summary: summaryOverride ?? buildSummary(users, products, interactions),
    source,
  };
}

async function fetchTableRows<T extends object>(
  table: string,
  selectQuery: string,
  orderColumns: string[],
) {
  const supabase = await createSupabaseClient();
  const pageSize = 1000;
  const rows: T[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(table)
      .select(selectQuery)
      .range(from, from + pageSize - 1);

    for (const column of orderColumns) {
      query = query.order(column, { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...(data as unknown as T[]));

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return { data: rows, error: null };
}

async function fetchSupabaseSnapshot() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const [usersResult, productsResult, interactionsResult] = await Promise.all([
      fetchTableRows<UserRow>("users", "user_id, age, country", ["user_id"]),
      fetchTableRows<ProductRow>(
        "products",
        "product_id, name, category, price, rating, rating_count, views, clicks, purchases",
        ["product_id"],
      ),
      fetchTableRows<InteractionRecord>(
        "interactions",
        "user_id, product_id, viewed, clicked, purchased, rating, fitness",
        ["user_id", "product_id"],
      ),
    ]);

    if (usersResult.error || productsResult.error || interactionsResult.error) {
      console.warn("Supabase tables are not ready yet, using local fallback instead.");
      return null;
    }

    const users = (usersResult.data ?? []).map(hydrateUser);
    const products = (productsResult.data ?? []).map(hydrateProduct);
    const interactions = (interactionsResult.data ?? []).map(normalizeInteractionRecord);

    return buildSnapshot(users, products, interactions, "supabase");
  } catch (error) {
    console.warn("Supabase request failed, using local fallback instead.", error);
    return null;
  }
}

export async function getCatalogSnapshot() {
  noStore();

  const supabaseSnapshot = await fetchSupabaseSnapshot();
  if (!supabaseSnapshot) {
    throw new Error("Failed to fetch catalog from Supabase. Check your connection and credentials.");
  }

  return supabaseSnapshot;
}

export function calculateAverageRating(summary: SummaryData) {
  const totalRatings = summary.ratingDistribution.reduce(
    (sum, bucket) => sum + bucket.count,
    0,
  );

  if (totalRatings === 0) {
    return 0;
  }

  const weightedTotal = summary.ratingDistribution.reduce(
    (sum, bucket) => sum + (bucket.score * bucket.count),
    0,
  );

  return Number((weightedTotal / totalRatings).toFixed(1));
}

export function filterProductsList(
  products: Product[],
  options: ProductFilterOptions = {},
) {
  const {
    query = "",
    categories = [],
    minPrice = 0,
    maxPrice = Number.POSITIVE_INFINITY,
    minRating = 0,
    sortBy = "default",
    excludeProductIds = [],
  } = options;

  const excludedIds = new Set(excludeProductIds);

  let result = products.filter((product) => {
    const matchesCategory =
      categories.length === 0 || categories.includes(product.category.id);
    const matchesMinPrice = product.price >= minPrice;
    const matchesMaxPrice = product.price <= maxPrice;
    const matchesRating = product.rating >= minRating;
    const matchesSearch = matchesQuery(product, query);
    const notExcluded = !excludedIds.has(product.product_id);

    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating && matchesSearch && notExcluded;
  });

  if (sortBy === "price-asc") {
    result = [...result].sort((left, right) => left.price - right.price);
  } else if (sortBy === "price-desc") {
    result = [...result].sort((left, right) => right.price - left.price);
  } else if (sortBy === "rating-desc") {
    result = [...result].sort((left, right) => {
      const ratingDelta = right.rating - left.rating;
      if (ratingDelta !== 0) {
        return ratingDelta;
      }

      return right.rating_count - left.rating_count;
    });
  } else if (sortBy === "popular") {
    result = [...result].sort((left, right) => {
      const purchaseDelta = right.purchases - left.purchases;
      if (purchaseDelta !== 0) {
        return purchaseDelta;
      }

      return right.clicks - left.clicks;
    });
  }

  return result;
}

export function getTopProductsFromProducts(products: Product[], count: number = 5) {
  return [...products]
    .sort((left, right) => {
      const purchaseDelta = right.purchases - left.purchases;
      if (purchaseDelta !== 0) {
        return purchaseDelta;
      }

      const clickDelta = right.clicks - left.clicks;
      if (clickDelta !== 0) {
        return clickDelta;
      }

      const ratingDelta = right.rating - left.rating;
      if (ratingDelta !== 0) {
        return ratingDelta;
      }

      return left.product_id - right.product_id;
    })
    .slice(0, count);
}

export function getRelatedProductsFromProducts(
  products: Product[],
  productId: number,
  count: number = 4,
) {
  const current = products.find((product) => product.product_id === productId);
  if (!current) {
    return products.slice(0, count);
  }

  return products
    .filter((product) => product.product_id !== productId)
    .sort((left, right) => {
      const sameCategoryDelta =
        Number(right.category.id === current.category.id) -
        Number(left.category.id === current.category.id);
      if (sameCategoryDelta !== 0) {
        return sameCategoryDelta;
      }

      const purchaseDelta = right.purchases - left.purchases;
      if (purchaseDelta !== 0) {
        return purchaseDelta;
      }

      const priceDelta =
        Math.abs(left.price - current.price) - Math.abs(right.price - current.price);
      if (priceDelta !== 0) {
        return priceDelta;
      }

      return right.rating - left.rating;
    })
    .slice(0, count);
}

export { paginateProducts };
