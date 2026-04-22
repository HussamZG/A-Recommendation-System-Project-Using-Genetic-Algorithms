export type TrackEvent = "view" | "click" | "purchase";

export interface InteractionMetrics {
  viewed: number;
  clicked: number;
  purchased: number;
  rating: number;
}

export function calculateFitness({
  viewed,
  clicked,
  purchased,
  rating,
}: InteractionMetrics) {
  return (purchased * 5) + (clicked * 2) + viewed + (rating * 3);
}

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

export interface ProductCounters {
  views: number;
  clicks: number;
  purchases: number;
}

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
