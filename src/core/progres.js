// Vos progrès : chaque réponse donnée (entraînement, main du jour, leçons), résumée par type de tirage.

const MAX = 2000;

/** Le nom d'un tirage d'après ses outs : « Couleur », « Couleur + Quinte »… */
export const drawKind = (outs) => outs.byType.map((t) => t.name).join(' + ') || 'Sans out';

/** Ajoute une réponse à l'historique, en gardant les plus récentes */
export const addEntry = (history, entry) => [...history, entry].slice(-MAX);

const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);

/**
 * @param {{ k: string, ok: boolean, g?: number }[]} history g : estimation moins la vraie probabilité, en points
 * @returns le taux de réussite, l'écart moyen d'estimation et son sens, et les mêmes chiffres par tirage
 */
export function summarize(history) {
    const stats = (list) => {
        const gaps = list.filter((e) => typeof e.g === 'number').map((e) => e.g);
        return {
            count: list.length,
            rate: list.length ? list.filter((e) => e.ok).length / list.length : null,
            gap: mean(gaps.map(Math.abs)),
            bias: mean(gaps),
            estimates: gaps.length,
        };
    };
    const kinds = new Map();
    history.forEach((e) => kinds.set(e.k, [...(kinds.get(e.k) ?? []), e]));
    const byKind = [...kinds].map(([kind, list]) => ({ kind, ...stats(list) })).sort((a, b) => b.count - a.count);
    // Le point faible : le tirage le moins réussi, sur assez de mains pour que ça veuille dire quelque chose
    const weakest = byKind.filter((k) => k.count >= 5).sort((a, b) => a.rate - b.rate)[0] ?? null;
    return { ...stats(history), byKind, weakest };
}
