// Probabilités et cotes du pot.

/**
 * Probabilité exacte de toucher au moins un out, par énumération des cartes restantes.
 * @param {number} outs nombre d'outs
 * @param {number} unseen cartes inconnues (47 au flop, 46 au turn)
 * @param {number} cardsToCome 1 (la prochaine carte) ou 2 (turn et river)
 */
export function hitProbability(outs, unseen, cardsToCome) {
    if (cardsToCome === 1) return outs / unseen;
    // Toutes les paires (turn, river) possibles, et celles qui contiennent au moins un out
    const pairs = (unseen * (unseen - 1)) / 2;
    const blanks = ((unseen - outs) * (unseen - outs - 1)) / 2;
    return (pairs - blanks) / pairs;
}

/** La règle du 2 et du 4 : outs × 4 avec deux cartes à venir, outs × 2 avec une seule (en %, plafonné à 100) */
export const ruleOfTwoAndFour = (outs, cardsToCome) => Math.min(100, outs * (cardsToCome === 2 ? 4 : 2));

/**
 * Les cotes du pot : quelle part du pot final il faut gagner pour que suivre soit rentable.
 * @param {number} pot le pot, mise adverse comprise
 * @param {number} call ce qu'il faut payer pour suivre
 */
export function potOdds(pot, call) {
    const required = call / (pot + call);
    return { required, ratio: pot / call };
}

/** Suivre si la probabilité de toucher couvre l'équité nécessaire */
export const decide = (probability, required) => (probability >= required ? 'suivre' : 'coucher');
