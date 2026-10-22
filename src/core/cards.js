// Les 52 cartes, écrites « As », « Th », « 9c » : la valeur (2 à A) puis la couleur (s pique, h cœur, d carreau, c trèfle).

export const RANKS = '23456789TJQKA';
export const SUITS = 'shdc';

export const DECK = [...SUITS].flatMap((suit) => [...RANKS].map((rank) => rank + suit));

const RANK_NAMES = { T: '10', J: 'V', Q: 'D', K: 'R', A: 'A' };
const SUIT_NAMES = { s: 'pique', h: 'cœur', d: 'carreau', c: 'trèfle' };
const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };

/** Valeur numérique : 2 → 0 … As → 12 */
export const rankOf = (card) => RANKS.indexOf(card[0]);
export const suitOf = (card) => card[1];

/** « 10 », « V », « D », « R », « A » : les index imprimés sur les cartes françaises */
export const rankLabel = (card) => RANK_NAMES[card[0]] ?? card[0];
export const suitSymbol = (card) => SUIT_SYMBOLS[card[1]];
export const isRed = (card) => card[1] === 'h' || card[1] === 'd';

/** « dame de cœur », pour les lecteurs d'écran et les listes d'outs */
export function cardName(card) {
    const names = { T: 'dix', J: 'valet', Q: 'dame', K: 'roi', A: 'as' };
    return `${names[card[0]] ?? card[0]} de ${SUIT_NAMES[card[1]]}`;
}

/** Les cartes qui ne sont ni dans la main ni sur le board */
export const unseen = (known) => DECK.filter((card) => !known.includes(card));
