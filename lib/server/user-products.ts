"server-only";

import { getCatalogSnapshot } from "./catalog";
import { getRecommendationPayload } from "./recommender";

export async function getUserInteractions(userId: number) {
  const catalog = await getCatalogSnapshot();
  const interactions = catalog.interactionsByUser.get(userId) ?? [];

  const interactionMap = new Map<number, {
    viewed: number;
    clicked: number;
    purchased: number;
    rating: number;
    fitness: number;
  }>();

  for (const interaction of interactions) {
    interactionMap.set(interaction.product_id, {
      viewed: interaction.viewed,
      clicked: interaction.clicked,
      purchased: interaction.purchased,
      rating: interaction.rating,
      fitness: interaction.fitness,
    });
  }

  return {
    interactions: interactionMap,
    hasUser: catalog.usersById.has(userId),
  };
}

export async function getUserRecommendations(userId: number) {
  const payload = await getRecommendationPayload(userId);
  if (!payload) {
    return null;
  }

  return {
    user: payload.user,
    recommendations: payload.recommendations,
    history: payload.history,
  };
}
