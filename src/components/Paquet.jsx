import { RANKS, SUITS, cardName, isRed, rankLabel, suitSymbol } from '../core/cards.js';

/** Le paquet étalé, une rangée par couleur : une carte déjà en jeu ne peut pas être reprise. */
export function Paquet({ used = [], selected, onPick }) {
    return (
        <div className="paquet" role="group" aria-label="Paquet de 52 cartes">
            {[...SUITS].map((suit) => (
                <div className="paquet-rang" key={suit}>
                    {[...RANKS].reverse().map((rank) => {
                        const card = rank + suit;
                        return (
                            <button
                                key={card}
                                type="button"
                                className={isRed(card) ? 'rouge' : ''}
                                disabled={used.includes(card) && card !== selected}
                                aria-pressed={card === selected}
                                aria-label={cardName(card)}
                                onClick={() => onPick(card)}
                            >
                                <span aria-hidden="true">{rankLabel(card)}</span>
                                <span aria-hidden="true">{suitSymbol(card)}</span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
