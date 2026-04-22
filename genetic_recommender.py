import pandas as pd
import numpy as np
import random


# ============================================================
# 1. تحميل البيانات
# ============================================================

def load_data():

    users    = pd.read_excel('data/users.xlsx')
    products = pd.read_excel('data/products.xlsx')
    ratings  = pd.read_excel('data/ratings.xlsx')
    behavior = pd.read_excel('data/behavior_15500.xlsx')

    # دمج السلوك مع التقييمات — left join للحفاظ على كل السجلات
    merged = pd.merge(behavior, ratings, on=['user_id', 'product_id'], how='left')

    # المنتجات بدون تقييم تأخذ 0
    merged['rating'] = merged['rating'].fillna(0)

    return merged, products, users


# ============================================================
# 2. دالة اللياقة (Fitness Function)
# ============================================================

def fitness_score(viewed, clicked, purchased, rating):
    """
    تحسب درجة لياقة منتج واحد بناءً على سلوك المستخدم.

    المعادلة:
        fitness = (purchased × 5) + (clicked × 2) + (viewed × 1) + (rating × 3)

    الأوزان مبنية على قوة كل إشارة:
        purchased × 5  → دفع فعلاً = أقوى دليل على الرضا
        rating    × 3  → رأي صريح ومقصود من المستخدم
        clicked   × 2  → فتح تفاصيل المنتج = اهتمام واضح
        viewed    × 1  → مجرد مرور، قد يكون صدفة

    النطاق: 0 (لا تفاعل) → 23 (شاهد + نقر + اشترى + قيّم بـ5)
    """
    return (purchased * 5) + (clicked * 2) + (viewed * 1) + (rating * 3)


def build_user_fitness_dict(merged, user_id):
    """
    يبني قاموس {product_id: fitness} لمستخدم معين.
    المنتجات غير الموجودة في سجله تأخذ 0 تلقائياً عبر .get()
    """
    user_data = merged[merged['user_id'] == user_id].copy()
    user_data['fitness'] = user_data.apply(
        lambda r: fitness_score(r.viewed, r.clicked, r.purchased, r.rating),
        axis=1
    )
    return user_data.set_index('product_id')['fitness'].to_dict()


# ============================================================
# 3. الخوارزمية الجينية
# ============================================================

def create_individual(all_products, top_n):
    """حل عشوائي واحد = قائمة top_n منتجاً مختلفاً (كروموسوم)"""
    return random.sample(all_products, top_n)


def evaluate(individual, user_fitness):
    """جودة الحل = مجموع fitness كل منتج في القائمة"""
    return sum(user_fitness.get(pid, 0) for pid in individual)


def selection(population, scores, keep_ratio=0.5):
    """
    الانتقاء: نحتفظ بأفضل نصف الحلول ونحذف الباقي.
    الحد الأدنى 2 للسماح بالتهجين.
    """
    keep = max(2, int(len(population) * keep_ratio))
    paired = sorted(zip(scores, population), reverse=True)
    return [ind for _, ind in paired[:keep]]


def crossover(parent1, parent2, top_n):
    """
    التهجين: أول [point] منتجات من الأب + الباقي من الأم.
    نتحقق من عدم التكرار لأن كل منتج يظهر مرة واحدة فقط.
    """
    point = random.randint(1, top_n - 1)
    child = parent1[:point]
    for pid in parent2:
        if pid not in child:
            child.append(pid)
        if len(child) == top_n:
            break
    return child


def mutate(individual, all_products, mutation_rate=0.1):
    """
    الطفرة: بنسبة 10% نستبدل منتجاً عشوائياً بآخر.
    الهدف: منع التعلق بـ Local Optimum والحفاظ على التنوع.
    """
    if random.random() < mutation_rate:
        idx = random.randint(0, len(individual) - 1)
        new_product = random.choice(all_products)
        while new_product in individual:
            new_product = random.choice(all_products)
        individual[idx] = new_product
    return individual


def genetic_recommendation(
    user_id,
    merged,
    products_df,
    top_n=5,
    pop_size=20,
    generations=50,
    mutation_rate=0.1,
    seed=None
):
    """
    الدالة الرئيسية للخوارزمية الجينية.

    المعاملات:
        user_id       - رقم المستخدم
        merged        - البيانات المدموجة
        products_df   - جدول المنتجات
        top_n         - عدد التوصيات (افتراضي 5)
        pop_size      - حجم المجتمع في كل جيل (افتراضي 20)
        generations   - عدد الأجيال (افتراضي 50)
        mutation_rate - نسبة الطفرة (افتراضي 10%)
        seed          - لإنتاج نتائج ثابتة عند الاختبار

    العوائد:
        best_products - أفضل top_n منتجاً موصى بها
        best_score    - مجموع درجة اللياقة
        score_history - تاريخ أفضل درجة في كل جيل
    """
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)

    all_products = products_df['product_id'].tolist()
    user_fitness = build_user_fitness_dict(merged, user_id)

    # الجيل الأول: حلول عشوائية
    population    = [create_individual(all_products, top_n) for _ in range(pop_size)]
    score_history = []

    for gen in range(generations):
        scores = [evaluate(ind, user_fitness) for ind in population]
        score_history.append(max(scores))

        parents = selection(population, scores)

        new_population = parents.copy()
        while len(new_population) < pop_size:
            p1, p2 = random.sample(parents, 2)
            child  = crossover(p1, p2, top_n)
            child  = mutate(child, all_products, mutation_rate)
            new_population.append(child)

        population = new_population

    final_scores  = [evaluate(ind, user_fitness) for ind in population]
    best_idx      = final_scores.index(max(final_scores))
    best_products = population[best_idx]
    best_score    = final_scores[best_idx]

    return best_products, best_score, score_history


# ============================================================
# 4. عرض النتائج
# ============================================================

def display_recommendations(user_id, best_products, best_score, score_history,
                            merged, products_df, users_df):
    user_info    = users_df[users_df['user_id'] == user_id].iloc[0]
    user_fitness = build_user_fitness_dict(merged, user_id)

    print("=" * 58)
    print(f"  توصيات المستخدم رقم {user_id}")
    print(f"  العمر: {user_info['age']} | الدولة: {user_info['country']}")
    print("=" * 58)
    for rank, pid in enumerate(best_products, 1):
        prod = products_df[products_df['product_id'] == pid].iloc[0]
        fit  = user_fitness.get(pid, 0)
        print(f"  {rank}. منتج #{pid:<4} | {prod['category']:<18} | "
              f"سعر {prod['price']:>5} | fitness={fit}")
    print(f"\n  مجموع اللياقة: {best_score} | "
          f"تحسّن: {score_history[0]} → {score_history[-1]}")
    print("=" * 58)


# ============================================================
# 5. نقطة التشغيل
# ============================================================

if __name__ == '__main__':
    print("جاري تحميل البيانات...")
    merged, products_df, users_df = load_data()
    print(f"تم التحميل: {len(users_df)} مستخدم | {len(products_df)} منتج\n")

    for uid in [1, 5, 10]:
        best_products, best_score, history = genetic_recommendation(
            user_id=uid, merged=merged, products_df=products_df,
            top_n=5, pop_size=20, generations=50,
            mutation_rate=0.1, seed=42
        )
        display_recommendations(uid, best_products, best_score, history,
                                merged, products_df, users_df)
        print()
