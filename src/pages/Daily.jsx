import { useState } from 'react';
import { dailyHand, dailyScore, parisDate } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { shareText, store, stored } from '../lib/share.js';
import { Carte } from '../components/Carte.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';

const KEY = 'tirage:jeu';

/** Jours d'affilée joués, jusqu'à aujourd'hui (ou hier si la main du jour reste à jouer) */
function streak(games, today) {
    const day = new Date(`${today}T12:00:00Z`);
    if (!games[today]) day.setUTCDate(day.getUTCDate() - 1);
    let count = 0;
    while (games[day.toISOString().slice(0, 10)]) {
        count += 1;
        day.setUTCDate(day.getUTCDate() - 1);
    }
    return count;
}

export function Daily() {
    const today = parisDate();
    const hand = dailyHand(today);
    const [games, setGames] = useState(() => stored(KEY, {}));
    const [choice, setChoice] = useState(null);
    const [estimate, setEstimate] = useState(30);
    const [shared, setShared] = useState(null);
    const played = games[today];
    const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date(`${today}T12:00:00Z`));

    const validate = () => {
        const result = { choice, estimate, ...dailyScore(hand, choice, estimate) };
        const next = { ...games, [today]: result };
        setGames(next);
        store(KEY, next);
    };

    const share = async () => {
        const text = [
            `Tirage · main du ${date}`,
            `Décision : ${played.decision ? '✅' : '❌'} ${played.choice}`,
            `Équité : ${played.estimate} % estimés, ${pct(hand.probability)} exacts`,
            `Score : ${played.total}/100`,
            `${location.origin}/jeu/`,
        ].join('\n');
        setShared(await shareText(text));
    };

    return (
        <>
            <SiteHeader page="jeu" />
            <main className="wrap outil">
                <h1 className="display outil-titre">La main du {date}</h1>
                <p className="prose">La même pour tout le monde aujourd'hui. Une seule partie : la décision vaut 50 points, l'estimation de vos chances 50.</p>

                <section className="jeu-table" aria-label="La situation">
                    <div className="table-main">
                        <p className="table-etiquette">Votre main</p>
                        <div className="table-cartes">{hand.hand.map((c) => <Carte key={c} card={c} size={100} />)}</div>
                    </div>
                    <div className="table-board">
                        <p className="table-etiquette">Flop</p>
                        <div className="table-cartes">{hand.board.map((c) => <Carte key={c} card={c} size={80} />)}</div>
                    </div>
                    <p className="jeu-pot">Votre adversaire part à tapis. Pot <strong>{num(hand.pot)}</strong>, à payer <strong>{num(hand.call)}</strong> : le turn et la river vont tomber.</p>
                </section>

                {!played ? (
                    <section className="jeu-etapes">
                        <div className="jeu-etape">
                            <h2 className="jeu-etape-titre">Vous suivez ?</h2>
                            <div className="choix">
                                <button type="button" className="btn btn-ok" aria-pressed={choice === 'suivre'} onClick={() => setChoice('suivre')}>Suivre</button>
                                <button type="button" className="btn btn-rouge" aria-pressed={choice === 'coucher'} onClick={() => setChoice('coucher')}>Coucher</button>
                            </div>
                        </div>
                        <div className="jeu-etape" aria-disabled={!choice}>
                            <h2 className="jeu-etape-titre">Vos chances de toucher d'ici la river ?</h2>
                            <label className="curseur">
                                <span className="sr">Estimation en pourcentage</span>
                                <input type="range" min="0" max="100" value={estimate} disabled={!choice} onChange={(e) => setEstimate(Number(e.target.value))} />
                                <output className="curseur-valeur">{estimate} %</output>
                            </label>
                            <button type="button" className="btn btn-signal" disabled={!choice} onClick={validate}>Valider ma réponse</button>
                        </div>
                    </section>
                ) : (
                    <section className="jeu-resultat" aria-live="polite">
                        <p className="jeu-score"><strong>{played.total}</strong>/100</p>
                        <dl className="jeu-detail">
                            <div><dt>Décision</dt><dd>{played.decision}/50 · vous avez choisi de {played.choice}, il fallait {hand.answer}</dd></div>
                            <div><dt>Estimation</dt><dd>{played.estimatePoints}/50 · {played.estimate} % estimés, {pct(hand.probability)} exacts</dd></div>
                            <div><dt>Le calcul</dt><dd>{hand.outs.cards.length} outs ({hand.outs.byType.map((t) => `${t.name.toLowerCase()} ${t.cards.length}`).join(', ')}) ; les cotes demandaient {pct(hand.required)}</dd></div>
                        </dl>
                        <div className="outs-cartes">{hand.outs.cards.map((c) => <Carte key={c} card={c} size={38} />)}</div>
                        <div className="jeu-partage">
                            <button type="button" className="btn btn-signal" onClick={share}>Partager mon score</button>
                            <p aria-live="polite">
                                {shared === 'copie' && 'Score copié : collez-le où vous voulez.'}
                                {shared === 'echec' && 'Impossible de copier : sélectionnez le score à la main.'}
                            </p>
                        </div>
                        <p className="prose">Série : {streak(games, today)} jour{streak(games, today) > 1 ? 's' : ''} d'affilée. Une nouvelle main demain à minuit.</p>
                    </section>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
