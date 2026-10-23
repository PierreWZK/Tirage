// Tout ce que l'incrustation affiche, calculé d'un coup à partir de la main, du board et des mises.
import { countOuts } from '../core/outs.js';
import { equityVs } from '../core/equity.js';
import { decide, hitProbability, impliedNeeded, potOdds, ruleOfTwoAndFour } from '../core/odds.js';

/**
 * @param {{ hand: (string|null)[], board: (string|null)[], pot: number, call: number, cardsToCome: 1|2, opponent?: (string|null)[] }} spot
 * @returns l'analyse, ou null tant que la main et le flop ne sont pas complets
 */
export function analyse({ hand, board, pot, call, cardsToCome, opponent = [] }) {
    const h = hand.filter(Boolean);
    const b = board.filter(Boolean);
    if (h.length < 2 || b.length < 3) return null;

    // Au turn, il ne reste qu'une carte : turn + river n'a plus de sens
    const toCome = b.length === 4 ? 1 : cardsToCome;
    const outs = countOuts(h, b);
    const n = outs.cards.length;
    const exact = hitProbability(n, outs.unseen, toCome);
    const odds = pot > 0 && call > 0 ? potOdds(pot, call) : null;
    const o = opponent.filter(Boolean);

    return {
        outs,
        count: n,
        toCome,
        nextCard: hitProbability(n, outs.unseen, 1),
        exact,
        rule: ruleOfTwoAndFour(n, toCome) / 100,
        odds,
        verdict: odds ? decide(exact, odds.required) : null,
        // Avec une seule carte à venir, ce que les gains futurs doivent rattraper
        implied: odds && toCome === 1 ? impliedNeeded(exact, pot, call) : null,
        versus: o.length === 2 ? equityVs(h, o, b) : null,
    };
}

const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat('fr-FR');

export const pct = (x) => percent.format(x);
export const num = (x) => whole.format(x);
