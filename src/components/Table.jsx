import { useMemo, useState } from 'react';
import { analyse } from '../lib/analyse.js';
import { Carte } from './Carte.jsx';
import { Paquet } from './Paquet.jsx';

const SLOT_LABELS = ['Carte 1', 'Carte 2', 'Flop', 'Flop', 'Flop', 'Turn', 'Adversaire', 'Adversaire'];

/** La situation éditée : 2 cartes en main, 3 ou 4 au board, la main adverse si on la connaît, le pot et la mise à payer */
export function useSpot(initial) {
    const [cards, setCards] = useState([...initial.cards, ...Array(8 - initial.cards.length).fill(null)]);
    const [pot, setPot] = useState(initial.pot);
    const [call, setCall] = useState(initial.call);
    const [cardsToCome, setCardsToCome] = useState(initial.cardsToCome ?? 1);
    const spot = { hand: cards.slice(0, 2), board: cards.slice(2, 6), opponent: cards.slice(6), pot, call, cardsToCome };
    const result = useMemo(() => analyse(spot), [cards.join(), pot, call, cardsToCome]);

    const setCard = (slot, card) => setCards((list) => list.map((c, i) => (i === slot ? card : c === card ? null : c)));
    const load = (s) => {
        const opponent = s.opponent ?? [];
        setCards([...s.hand, ...s.board, ...Array(4 - s.board.length).fill(null), ...opponent, ...Array(2 - opponent.length).fill(null)]);
        setPot(s.pot);
        setCall(s.call);
        setCardsToCome(s.cardsToCome);
    };

    return { cards, spot, result, setCard, load, pot, setPot, call, setCall, cardsToCome, setCardsToCome };
}

/**
 * La main et le board, chaque emplacement cliquable ; le paquet s'ouvre sous la table pour choisir la carte.
 */
export function Table({ state, size = 72, boardSize = size * 0.86, opponent = false }) {
    const [active, setActive] = useState(null);
    const { cards, setCard } = state;

    const slot = (i, s) => (
        <Carte
            key={i}
            card={cards[i]}
            size={s}
            label={SLOT_LABELS[i]}
            pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
        />
    );

    const pick = (card) => {
        setCard(active, card);
        // Enchaîne sur l'emplacement vide suivant, comme quand on distribue (le turn et l'adversaire restent à part)
        const order = active >= 6 ? [6, 7] : [0, 1, 2, 3, 4];
        const next = order.find((i) => i !== active && !cards[i]) ?? -1;
        setActive(next >= 0 ? next : null);
    };

    return (
        <div className="table">
            <div className="table-main">
                <p className="table-etiquette">Votre main</p>
                <div className="table-cartes">{[0, 1].map((i) => slot(i, size))}</div>
            </div>
            <div className="table-board">
                <p className="table-etiquette">Board</p>
                <div className="table-cartes">
                    {[2, 3, 4].map((i) => slot(i, boardSize))}
                    {(cards[4] || cards[5]) && slot(5, boardSize)}
                </div>
            </div>
            {opponent && (
                <div className="table-adverse">
                    <p className="table-etiquette">Main adverse <span>(facultatif)</span></p>
                    <div className="table-cartes">{[6, 7].map((i) => slot(i, boardSize))}</div>
                </div>
            )}
            {active !== null && (
                <div className="table-paquet">
                    <div className="table-paquet-tete">
                        <p>Choisir : <strong>{SLOT_LABELS[active]}</strong></p>
                        {cards[active] && (
                            <button type="button" className="lien" onClick={() => { setCard(active, null); setActive(null); }}>Retirer la carte</button>
                        )}
                        <button type="button" className="lien" onClick={() => setActive(null)}>Fermer</button>
                    </div>
                    <Paquet used={cards.filter(Boolean)} selected={cards[active]} onPick={pick} />
                </div>
            )}
        </div>
    );
}
