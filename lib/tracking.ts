// أنواع الأحداث القابلة للتتبع: مشاهدة، نقر، أو عملية شراء
export type TrackEvent = "view" | "click" | "purchase";

// مقاييس التفاعل بين مستخدم ومنتج: عدد المشاهدات، النقرات، المشتريات، والتقييم
export interface InteractionMetrics {
  viewed: number;
  clicked: number;
  purchased: number;
  rating: number;
}

// دالة حساب درجة اللياقة (Fitness) لكل تفاعل: معادلة مرجّحة تعطي أولوية أعلى للمشتريات (×5) ثم النقرات (×2) ثم المشاهدات والتقييم
export function calculateFitness({
  viewed,
  clicked,
  purchased,
  rating,
}: InteractionMetrics) {
  return (purchased * 5) + (clicked * 2) + viewed + (rating * 3);
}

// تحديث مقاييس التفاعل بناءً على حدث جديد: زيادة عداد المشاهدة، النقرة، أو الشراء
export function applyTrackEvent(
  current: InteractionMetrics,
  event: TrackEvent,
): InteractionMetrics {
  if (event === "view") {
    return {
      ...current,
      viewed: current.viewed + 1,
    };
  }

  if (event === "click") {
    return {
      ...current,
      clicked: current.clicked + 1,
    };
  }

  return {
    ...current,
    clicked: current.clicked + 1,
    purchased: current.purchased + 1,
  };
}

// عدادات عالمية للمنتج: تُستخدم لتحديث إجمالي المشاهدات، النقرات، والمبيعات على مستوى المتجر
export interface ProductCounters {
  views: number;
  clicks: number;
  purchases: number;
}

// تحديث عدادات المنتج العالمية بناءً على حدث جديد: زيادة views/clicks/purchases للمنتج
export function applyTrackEventToProduct(
  current: ProductCounters,
  event: TrackEvent,
): ProductCounters {
  if (event === "view") {
    return {
      ...current,
      views: current.views + 1,
    };
  }

  if (event === "click") {
    return {
      ...current,
      clicks: current.clicks + 1,
    };
  }

  return {
    ...current,
    clicks: current.clicks + 1,
    purchases: current.purchases + 1,
  };
}
