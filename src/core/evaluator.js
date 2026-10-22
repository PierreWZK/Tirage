// Évaluateur de mains : la meilleure combinaison de 5 cartes parmi 2 à 7.
import { rankOf, suitOf } from './cards.js';

export const CATEGORY = {
    HIGH_CARD: 0,
    PAIR: 1,
    TWO_PAIR: 2,
    TRIPS: 3,
    STRAIGHT: 4,
    FLUSH: 5,
    FULL_HOUSE: 6,
    QUADS: 7,
    STRAIGHT_FLUSH: 8,
};

export const CATEGORY_NAMES = [
    'Hauteur', 'Paire', 'Deux paires', 'Brelan', 'Quinte', 'Couleur', 'Full', 'Carré', 'Quinte flush',
];

/** La plus haute carte d'une quinte dans ces valeurs (l'as compte aussi pour 1), ou -1 */
function straightHigh(ranks) {
    const present = new Set(ranks);
    if (present.has(12)) present.add(-1);
    for (let high = 12; high >= 3; high -= 1) {
        if ([0, 1, 2, 3, 4].every((step) => present.has(high - step))) return high;
    }
    return -1;
}

/**
 * La force d'une main de 1 à 7 cartes : [catégorie, départages…], comparable avec compare().
 * Sous 5 cartes, seules les paires, brelans et carrés existent.
 */
export function evaluate(cards) {
    const ranks = cards.map(rankOf).sort((a, b) => b - a);
    const counts = new Map();
    ranks.forEach((rank) => counts.set(rank, (counts.get(rank) ?? 0) + 1));
    // Groupes de même valeur, les plus nombreux puis les plus hauts d'abord
    const groups = [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

    const bySuit = new Map();
    cards.forEach((card) => bySuit.set(suitOf(card), [...(bySuit.get(suitOf(card)) ?? []), rankOf(card)]));
    const flushRanks = [...bySuit.values()].find((list) => list.length >= 5)?.sort((a, b) => b - a);

    if (flushRanks) {
        const high = straightHigh(flushRanks);
        if (high >= 0) return [CATEGORY.STRAIGHT_FLUSH, high];
    }
    if (groups[0][1] === 4) {
        return [CATEGORY.QUADS, groups[0][0], Math.max(...ranks.filter((r) => r !== groups[0][0]), -1)];
    }
    if (groups[0][1] === 3 && groups.length > 1 && groups[1][1] >= 2) {
        return [CATEGORY.FULL_HOUSE, groups[0][0], groups[1][0]];
    }
    if (flushRanks) return [CATEGORY.FLUSH, ...flushRanks.slice(0, 5)];
    const high = straightHigh(ranks);
    if (high >= 0) return [CATEGORY.STRAIGHT, high];
    const kickers = (exclude, n) => ranks.filter((r) => !exclude.includes(r)).slice(0, n);
    if (groups[0][1] === 3) return [CATEGORY.TRIPS, groups[0][0], ...kickers([groups[0][0]], 2)];
    if (groups[0][1] === 2 && groups[1]?.[1] === 2) {
        const [a, b] = [groups[0][0], groups[1][0]];
        return [CATEGORY.TWO_PAIR, a, b, ...kickers([a, b], 1)];
    }
    if (groups[0][1] === 2) return [CATEGORY.PAIR, groups[0][0], ...kickers([groups[0][0]], 3)];
    return [CATEGORY.HIGH_CARD, ...ranks.slice(0, 5)];
}

/** > 0 si a bat b, < 0 si b bat a, 0 en cas d'égalité */
export function compare(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
        const diff = (a[i] ?? -1) - (b[i] ?? -1);
        if (diff) return diff;
    }
    return 0;
}
