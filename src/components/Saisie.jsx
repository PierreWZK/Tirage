// Les modes d'entraînement et la saisie des réponses, partagés par l'entraînement et les leçons.
import { useState } from 'react';
import { pct } from '../lib/analyse.js';

export const ROUNDS = 10;
// Écart toléré, en points, pour qu'une estimation compte comme juste
export const TOLERANCE = 5;

export const MODES = {
    decision: { name: 'Suivre ou coucher', seconds: 15, rounds: ROUNDS, text: 'Dix mains, quinze secondes chacune : la bonne décision d’après vos outs et les cotes du pot.' },
    outs: { name: 'Compte les outs', seconds: 20, rounds: ROUNDS, text: 'Dix mains, vingt secondes chacune : combien de cartes vous améliorent ? Le compte exact, pas à peu près.' },
    equite: { name: 'Estime tes chances', seconds: 20, rounds: ROUNDS, text: `Dix mains, vingt secondes chacune : vos chances de toucher, à ${TOLERANCE} points près.` },
    survie: { name: 'Survie', seconds: 15, rounds: Infinity, text: 'Suivre ou coucher, autant de mains que vous tenez : la première erreur arrête la série.' },
};

// Le record de « suivre ou coucher » garde sa clé d'avant les modes
export const recordKey = (mode) => (mode === 'decision' ? 'tirage:record' : `tirage:record:${mode}`);

/** Juste ou faux, selon ce que le mode demande */
export function check(mode, hand, value) {
    if (value === null) return false;
    if (mode === 'outs') return value === hand.outs.cards.length;
    if (mode === 'equite') return Math.abs(value - hand.probability * 100) <= TOLERANCE;
    return value === hand.answer;
}

/** Ce que le joueur a répondu, en clair */
export function said(mode, value) {
    if (value === null) return 'pas de réponse';
    if (mode === 'outs') return `${value} out${value > 1 ? 's' : ''}`;
    if (mode === 'equite') return `${value} %`;
    return value;
}

export function truth(mode, hand) {
    if (mode === 'outs') return `${hand.outs.cards.length} outs`;
    if (mode === 'equite') return pct(hand.probability);
    return hand.answer;
}

/** Saisie du nombre d'outs ou de l'estimation, validée par Entrée */
export function Saisie({ mode, onAnswer }) {
    const [value, setValue] = useState(mode === 'equite' ? 50 : '');
    const submit = (e) => {
        e.preventDefault();
        if (value === '') return;
        onAnswer(Number(value));
    };
    return (
        <form className="saisie" onSubmit={submit}>
            {mode === 'outs' ? (
                <label className="champ">Nombre d'outs
                    <input type="number" min="0" max="25" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
                </label>
            ) : (
                <label className="curseur">
                    <input type="range" aria-label="Vos chances de toucher, en pour cent" min="0" max="100" value={value} onChange={(e) => setValue(Number(e.target.value))} autoFocus />
                    <output className="curseur-valeur">{value} %</output>
                </label>
            )}
            <button type="submit" className="btn btn-signal">Valider</button>
        </form>
    );
}
