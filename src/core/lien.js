// Une main dans l'adresse : ?main=AhKh&board=7h2h9c&pot=300&mise=100&tapis=1
import { DECK } from './cards.js';

const cardsOf = (text = '') => text.match(/.{1,2}/g) ?? [];

/** La main en paramètres d'adresse, à coller derrière /calculateur/ */
export function spotToQuery({ hand, board, pot, call, cardsToCome }) {
    const params = new URLSearchParams({ main: hand.join(''), board: board.join(''), pot: String(pot), mise: String(call) });
    if (cardsToCome === 2 && board.length === 3) params.set('tapis', '1');
    return params.toString();
}

/**
 * Relit une main depuis l'adresse ; null si elle est incomplète ou invalide
 * (carte inconnue ou en double, mises négatives).
 */
export function queryToSpot(query) {
    const params = new URLSearchParams(query);
    const hand = cardsOf(params.get('main') ?? '');
    const board = cardsOf(params.get('board') ?? '');
    const pot = Number(params.get('pot') ?? 0);
    const call = Number(params.get('mise') ?? 0);
    const all = [...hand, ...board];
    if (hand.length !== 2 || board.length < 3 || board.length > 4) return null;
    if (!all.every((c) => DECK.includes(c)) || new Set(all).size !== all.length) return null;
    if (!Number.isFinite(pot) || !Number.isFinite(call) || pot < 0 || call < 0) return null;
    const cardsToCome = board.length === 3 && params.get('tapis') === '1' ? 2 : 1;
    return { hand, board, pot: Math.round(pot), call: Math.round(call), cardsToCome };
}
