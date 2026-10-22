// Situations de jeu tirées au hasard : une main avec un tirage, un pot, une mise à payer.
import { DECK } from './cards.js';
import { hitProbability, potOdds, decide } from './odds.js';
import { countOuts } from './outs.js';

/** Générateur pseudo-aléatoire à graine (mulberry32) : la même graine donne toujours la même suite */
export function seeded(seed) {
    let state = typeof seed === 'number' ? seed : [...String(seed)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 2166136261);
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const pick = (random, list) => list[Math.floor(random() * list.length)];

// Tailles de mise réalistes, en part du pot avant la mise : un tiers, la moitié, deux tiers, le pot, plus
const BET_SIZES = [1 / 3, 1 / 2, 2 / 3, 3 / 4, 1, 1.5];

/**
 * Une situation avec un vrai tirage (4 à 15 outs).
 * @param {() => number} random
 * @param {{ street?: 'flop' | 'turn', allIn?: boolean }} options flop à tapis : turn et river à venir
 */
export function situation(random, { street = pick(random, ['flop', 'turn']), allIn = street === 'flop' } = {}) {
    // La bonne réponse est tirée d'abord, à pile ou face : sans ça, les mises réalistes donnent surtout « coucher »
    const wanted = random() < 0.5 ? 'suivre' : 'coucher';
    for (;;) {
        const deck = [...DECK];
        for (let i = deck.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        const hand = deck.slice(0, 2);
        const board = deck.slice(2, street === 'flop' ? 5 : 6);
        const outs = countOuts(hand, board);
        if (outs.cards.length < 4 || outs.cards.length > 15 || outs.current >= 2) continue;

        const before = 10 * Math.round((20 + random() * 180) / 10) * 10;
        const call = Math.round((before * pick(random, BET_SIZES)) / 10) * 10;
        const pot = before + call;
        const cardsToCome = street === 'flop' && allIn ? 2 : 1;
        const probability = hitProbability(outs.cards.length, outs.unseen, cardsToCome);
        const { required } = potOdds(pot, call);

        const answer = decide(probability, required);
        if (answer !== wanted) continue;

        return { hand, board, pot, call, cardsToCome, outs, probability, required, answer };
    }
}

/** La date du jour à Paris, « 2026-10-23 » : la main du jour change à minuit, heure française */
export function parisDate(date = new Date()) {
    return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** La main du jour : au flop, adversaire à tapis, la même pour tout le monde ce jour-là */
export const dailyHand = (day = parisDate()) => situation(seeded(`tirage|${day}`), { street: 'flop', allIn: true });

/**
 * Score de la main du jour sur 100 : 50 pour la bonne décision, 50 pour l'estimation de l'équité
 * (moins 2,5 points par point d'écart, jamais négatif).
 */
export function dailyScore(hand, choice, estimate) {
    const decision = choice === hand.answer ? 50 : 0;
    const gap = Math.abs(estimate - hand.probability * 100);
    const estimatePoints = Math.max(0, Math.round(50 - gap * 2.5));
    return { decision, estimatePoints, gap, total: decision + estimatePoints };
}
