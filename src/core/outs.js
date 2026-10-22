// Les outs : les cartes à venir qui font passer la main au-dessus de ce qu'elle est.
import { rankOf, unseen } from './cards.js';
import { CATEGORY, CATEGORY_NAMES, evaluate } from './evaluator.js';

/**
 * Une carte est un out si elle fait monter la main d'au moins une catégorie, jusqu'à deux paires ou mieux,
 * grâce aux cartes du joueur : la même carte posée sur le board seul ne doit pas donner autant.
 * Deux paires ne compte que si la carte s'apparie avec une carte du joueur (sinon c'est le board qui double).
 *
 * @param {string[]} hand les 2 cartes du joueur
 * @param {string[]} board 3 (flop) ou 4 cartes (turn)
 * @returns {{ cards: string[], byType: { name: string, category: number, cards: string[] }[], current: number, unseen: number }}
 */
export function countOuts(hand, board) {
    const known = [...hand, ...board];
    const current = evaluate(known)[0];
    const handRanks = hand.map(rankOf);
    const remaining = unseen(known);
    const outs = [];

    for (const card of remaining) {
        const after = evaluate([...known, card])[0];
        const boardOnly = evaluate([...board, card])[0];
        const pairsHand = handRanks.includes(rankOf(card));
        if (after > current && after >= CATEGORY.TWO_PAIR && after > boardOnly
            && !(after === CATEGORY.TWO_PAIR && !pairsHand)) {
            outs.push({ card, category: after });
        }
    }

    // Chaque carte n'est comptée qu'une fois, sous la meilleure catégorie qu'elle donne
    const types = new Map();
    for (const { card, category } of outs) {
        types.set(category, [...(types.get(category) ?? []), card]);
    }

    return {
        cards: outs.map((o) => o.card),
        byType: [...types].sort((a, b) => b[0] - a[0]).map(([category, cards]) => ({ name: CATEGORY_NAMES[category], category, cards })),
        current,
        unseen: remaining.length,
    };
}
