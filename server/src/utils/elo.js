// server/src/utils/elo.js

// Constante K : détermine la volatilité du classement (32 pour débutant, 16 pour pro)
const K_FACTOR = 32;

/**
 * Calcule les nouveaux ELOs après un match
 * @param {number} ratingA - ELO actuel du joueur A
 * @param {number} ratingB - ELO actuel du joueur B
 * @param {number} actualScoreA - 1 si A gagne, 0 si A perd, 0.5 si égalité
 * @returns {[number, number]} - [Nouveau ELO A, Nouveau ELO B]
 */
export function calculateElo(ratingA, ratingB, actualScoreA) {
  // Espérance de victoire (Expected Score)
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

  const actualScoreB = 1 - actualScoreA;

  // Calcul du nouveau ELO
  const newRatingA = Math.round(ratingA + K_FACTOR * (actualScoreA - expectedA));
  const newRatingB = Math.round(ratingB + K_FACTOR * (actualScoreB - expectedB));

  return [newRatingA, newRatingB];
}
