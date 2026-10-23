// Équité exacte contre une main adverse connue : toutes les cartes restantes du board, une par une.
import { DECK } from './cards.js';
import { compare, evaluate } from './evaluator.js';

/**
 * @param {string[]} hand vos deux cartes
 * @param {string[]} opponent les deux cartes adverses
 * @param {string[]} board 3 ou 4 cartes
 * @returns {{ win: number, tie: number, lose: number, equity: number, runouts: number }} parts entre 0 et 1
 */
export function equityVs(hand, opponent, board) {
    const used = new Set([...hand, ...opponent, ...board]);
    const rest = DECK.filter((c) => !used.has(c));
    const missing = 5 - board.length;
    let win = 0;
    let tie = 0;
    let runouts = 0;
    const play = (full) => {
        const diff = compare(evaluate([...hand, ...full]), evaluate([...opponent, ...full]));
        if (diff > 0) win += 1;
        else if (diff === 0) tie += 1;
        runouts += 1;
    };
    // Au flop : 990 turns et rivers possibles ; au turn : 44 rivers
    for (let i = 0; i < rest.length; i += 1) {
        if (missing === 1) {
            play([...board, rest[i]]);
            continue;
        }
        for (let j = i + 1; j < rest.length; j += 1) play([...board, rest[i], rest[j]]);
    }
    return { win: win / runouts, tie: tie / runouts, lose: (runouts - win - tie) / runouts, equity: (win + tie / 2) / runouts, runouts };
}
