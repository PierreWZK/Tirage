import { cardName, isRed, rankLabel, suitSymbol } from '../core/cards.js';

/** Une carte à jouer. Vide : un emplacement à remplir. Avec onClick : un bouton. */
export function Carte({ card, size = 64, label, onClick, pressed, out, className = '' }) {
    const Tag = onClick ? 'button' : 'div';
    const style = { '--w': `${size}px` };
    const common = { style, onClick, type: onClick ? 'button' : undefined, 'aria-pressed': onClick ? Boolean(pressed) : undefined };

    if (!card) {
        return (
            <Tag {...common} className={`carte vide ${className}`} aria-label={onClick ? `Choisir : ${label}` : label}>
                {label}
            </Tag>
        );
    }
    return (
        <Tag {...common} className={`carte ${isRed(card) ? 'rouge' : ''} ${out ? 'out' : ''} ${className}`} aria-label={cardName(card)}>
            <span className="idx" aria-hidden="true"><span>{rankLabel(card)}</span><span>{suitSymbol(card)}</span></span>
            <span className="grande" aria-hidden="true">{suitSymbol(card)}</span>
        </Tag>
    );
}
