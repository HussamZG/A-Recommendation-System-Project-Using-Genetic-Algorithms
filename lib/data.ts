import productsRaw from "@/data/products.json";
import usersRaw from "@/data/users.json";
import summaryRaw from "@/data/summary.json";


export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface User {
  user_id: number;
  age: number;
  country: string;
}

export interface Product {
  product_id: number;
  name: string;
  category: Category;
  price: number;
  rating: number;
  rating_count: number;
  views: number;
  clicks: number;
  purchases: number;
}

export type ProductSort = "default" | "price-asc" | "price-desc" | "rating-desc" | "popular";

export interface ProductFilterOptions {
  query?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: ProductSort;
  excludeProductIds?: number[];
}

interface ProductRecord {
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

interface UserRecord {
  user_id: number;
  age: number;
  country: string;
}

interface SummaryRecord {
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
  topProducts: ProductRecord[];
}

const CATEGORY_META: Record<string, Omit<Category, "id">> = {
  Electronics: { name: "إلكترونيات", color: "#4361EE" },
  Sports: { name: "رياضة", color: "#1D9E75" },
  Books: { name: "كتب", color: "#BA7517" },
  Clothes: { name: "ملابس", color: "#993556" },
  Toys: { name: "ألعاب", color: "#993C1D" },
  Perfumes: { name: "عطور", color: "#0F6E56" },
  "Home Appliances": { name: "أجهزة منزلية", color: "#185FA5" },
};

const COUNTRY_LABELS: Record<string, string> = {
  Jordan: "الأردن",
  UAE: "الإمارات",
  Egypt: "مصر",
  Morocco: "المغرب",
  "Saudi Arabia": "السعودية",
  Qatar: "قطر",
  Kuwait: "الكويت",
};

const productsData = productsRaw as ProductRecord[];
const usersData = usersRaw as UserRecord[];
const summaryData = summaryRaw as SummaryRecord;

export const MIN_USER_ID = 1;
export const MAX_USER_ID = summaryData.totalUsers;

export function getCategoryInfo(categoryId: string): Category {
  const meta = CATEGORY_META[categoryId];

  return {
    id: categoryId,
    name: meta?.name ?? categoryId,
    color: meta?.color ?? "#64748B",
  };
}

export const CATEGORIES = Object.keys(CATEGORY_META).map((categoryId) =>
  getCategoryInfo(categoryId),
);

function hydrateUser(record: UserRecord): User {
  return {
    ...record,
    country: COUNTRY_LABELS[record.country] ?? record.country,
  };
}

export function hydrateProduct(record: ProductRecord): Product {
  return {
    ...record,
    category: getCategoryInfo(record.category),
  };
}

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(product: Product, query: string) {
  const normalizedQuery = normalizeSearchTerm(query);
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

  return haystack.includes(normalizedQuery);
}

const PRODUCTS = productsData.map(hydrateProduct);
const USERS = usersData.map(hydrateUser);
const PRODUCTS_BY_ID = new Map(PRODUCTS.map((product) => [product.product_id, product]));
const USERS_BY_ID = new Map(USERS.map((user) => [user.user_id, user]));

export function getUsersList() {
  return USERS;
}

export function getAllProductsList() {
  return PRODUCTS;
}

export function getUser(id: number): User | null {
  return USERS_BY_ID.get(id) ?? null;
}

export function getProduct(id: number): Product | null {
  return PRODUCTS_BY_ID.get(id) ?? null;
}

export function filterProducts(options: ProductFilterOptions = {}) {
  const {
    query = "",
    categories = [],
    maxPrice = summaryData.pricing.max,
    minRating = 0,
    sortBy = "default",
    excludeProductIds = [],
  } = options;

  const excludedIds = new Set(excludeProductIds);

  let result = PRODUCTS.filter((product) => {
    const matchesCategory =
      categories.length === 0 || categories.includes(product.category.id);
    const matchesPrice = product.price <= maxPrice;
    const matchesRating = product.rating >= minRating;
    const matchesSearch = matchesQuery(product, query);
    const notExcluded = !excludedIds.has(product.product_id);

    return matchesCategory && matchesPrice && matchesRating && matchesSearch && notExcluded;
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

export function paginateProducts(products: Product[], page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(products.length / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * limit;

  return {
    data: products.slice(startIndex, startIndex + limit),
    currentPage,
    totalPages,
    total: products.length,
  };
}

export function getAllProducts(page: number = 1, limit: number = 12) {
  return paginateProducts(PRODUCTS, page, limit);
}

export function getRelatedProducts(productId: number, count: number = 4): Product[] {
  const current = getProduct(productId);
  if (!current) {
    return PRODUCTS.slice(0, count);
  }

  return PRODUCTS.filter((product) => product.product_id !== productId)
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

export function getSummary() {
  return summaryData;
}

export function getTopProducts(count: number = 5): Product[] {
  return summaryData.topProducts.slice(0, count).map(hydrateProduct);
}

export function getAverageRating(): number {
  const totalRatings = summaryData.ratingDistribution.reduce(
    (sum, bucket) => sum + bucket.count,
    0,
  );
  if (totalRatings === 0) {
    return 0;
  }

  const weightedTotal = summaryData.ratingDistribution.reduce(
    (sum, bucket) => sum + (bucket.score * bucket.count),
    0,
  );
  return Number((weightedTotal / totalRatings).toFixed(1));
}

export function getUserCount(): number {
  return summaryData.totalUsers;
}

export function getProductCount(): number {
  return summaryData.totalProducts;
}
