import { useState } from 'react';
import { dailyHands, dailyScore, parisDate, pastDays } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { drawKind } from '../core/progres.js';
import { remember, shareText, store, stored } from '../lib/share.js';
import { Carte } from '../components/Carte.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';

export const KEY = 'tirage:jeu';
// Les jours rejoués en archives : gardés à part, ils ne comptent pas dans la série
export const ARCHIVES_KEY = 'tirage:archives';
const ARCHIVE_DAYS = 14;
const STREETS = ['Flop', 'Turn', 'Flop'];

/** Une journée finie a son total ; une journée commencée n'a que ses premières mains */
export const finished = (game) => game?.total !== undefined;

/** Jours d'affilée joués, jusqu'à aujourd'hui (ou hier si la main du jour reste à jouer) */
export function streak(games, today) {
    const day = new Date(`${today}T12:00:00Z`);
    if (!finished(games[today])) day.setUTCDate(day.getUTCDate() - 1);
    let count = 0;
    while (finished(games[day.toISOString().slice(0, 10)])) {
        count += 1;
        day.setUTCDate(day.getUTCDate() - 1);
    }
    return count;
}

const longDate = (day) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date(`${day}T12:00:00Z`));
const shortDate = (day) => new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(`${day}T12:00:00Z`));
const square = (total) => (total >= 80 ? '🟩' : total >= 50 ? '🟨' : '🟥');

/** Le jour demandé par ?jour=2026-10-20, s'il est passé ; sinon aujourd'hui */
function requestedDay(today) {
    const day = new URLSearchParams(location.search).get('jour');
    return /^\d{4}-\d{2}-\d{2}$/.test(day ?? '') && day < today && day >= '2026-01-01' ? day : today;
}

/** Ce que dit la situation, selon la rue et ce qui reste à venir */
function situationText(hand) {
    if (hand.cardsToCome === 2) return <>Votre adversaire part à tapis. Pot <strong>{num(hand.pot)}</strong>, à payer <strong>{num(hand.call)}</strong> : le turn et la river vont tomber.</>;
    return <>Votre adversaire mise. Pot <strong>{num(hand.pot)}</strong>, à payer <strong>{num(hand.call)}</strong> : une seule carte à venir avant la prochaine mise.</>;
}

function Etape({ hand, onValidate }) {
    const [choice, setChoice] = useState(null);
    const [estimate, setEstimate] = useState(30);
    return (
        <section className="jeu-etapes">
            <div className="jeu-etape">
                <h2 className="jeu-etape-titre">Vous suivez ?</h2>
                <div className="choix">
                    <button type="button" className="btn btn-ok" aria-pressed={choice === 'suivre'} onClick={() => setChoice('suivre')}>Suivre</button>
                    <button type="button" className="btn btn-rouge" aria-pressed={choice === 'coucher'} onClick={() => setChoice('coucher')}>Coucher</button>
                </div>
            </div>
            <div className="jeu-etape" aria-disabled={!choice}>
                <h2 className="jeu-etape-titre">Vos chances de toucher {hand.cardsToCome === 2 ? "d'ici la river" : 'à la prochaine carte'} ?</h2>
                <label className="curseur">
                    <input type="range" min="0" max="100" value={estimate} disabled={!choice} aria-label="Estimation en pourcentage" onChange={(e) => setEstimate(Number(e.target.value))} />
                    <output className="curseur-valeur">{estimate} %</output>
                </label>
                <button type="button" className="btn btn-signal" disabled={!choice} onClick={() => onValidate({ choice, estimate, ...dailyScore(hand, choice, estimate) })}>Valider ma réponse</button>
            </div>
        </section>
    );
}

export function Daily() {
    const today = parisDate();
    const [day] = useState(() => requestedDay(today));
    const archive = day !== today;
    const key = archive ? ARCHIVES_KEY : KEY;
    const hands = dailyHands(day);
    const [games, setGames] = useState(() => stored(KEY, {}));
    const [archives, setArchives] = useState(() => stored(ARCHIVES_KEY, {}));
    const [shared, setShared] = useState(null);
    const book = archive ? archives : games;
    const game = book[day];
    // Une partie jouée avant les trois mains n'a gardé que la première
    const results = game?.hands ?? (game ? [game] : []);
    const done = finished(game);
    const current = results.length;
    const hand = hands[Math.min(current, hands.length - 1)];

    const save = (entry) => {
        const next = { ...book, [day]: entry };
        (archive ? setArchives : setGames)(next);
        store(key, next);
    };

    const validate = (result) => {
        const h = hands[results.length];
        remember({ m: archive ? 'archives' : 'jeu', k: drawKind(h.outs), ok: result.decision > 0, g: result.estimate - h.probability * 100 });
        const list = [...results, result];
        save(list.length === hands.length
            ? { hands: list, total: Math.round(list.reduce((sum, r) => sum + r.total, 0) / list.length) }
            : { hands: list });
    };

    const share = async () => {
        const text = [
            `Tirage · main du ${longDate(day)}${archive ? ' (archives)' : ''}`,
            results.map((r) => square(r.total)).join(''),
            `Score : ${game.total}/100`,
            `${location.origin}/jeu/${archive ? `?jour=${day}` : ''}`,
        ].join('\n');
        setShared(await shareText(text));
    };

    const days = pastDays(today, ARCHIVE_DAYS);

    return (
        <>
            <SiteHeader page="jeu" />
            <main className="wrap outil">
                <h1 className="display outil-titre">La main du {longDate(day)}</h1>
                <p className="prose">
                    {archive
                        ? <>Archives : la journée telle que tout le monde l'a jouée ce jour-là. Elle ne compte pas dans votre série. <a href="/jeu/">Revenir à la main d'aujourd'hui</a>.</>
                        : "Trois mains, les mêmes pour tout le monde aujourd'hui. Pour chacune, la décision vaut 50 points et l'estimation de vos chances 50 ; le score du jour est la moyenne."}
                </p>

                <ol className="jeu-progression" aria-label="Les trois mains">
                    {hands.map((h, i) => (
                        <li key={i} aria-current={!done && i === current ? 'step' : undefined} className={results[i] ? 'faite' : ''}>
                            <span>Main {i + 1} · {STREETS[i]}</span>
                            <strong>{results[i] ? `${results[i].total}/100` : i === current && !done ? 'En cours' : 'À jouer'}</strong>
                        </li>
                    ))}
                </ol>

                {!done && (
                    <>
                        <section className="jeu-table" aria-label="La situation">
                            <div className="table-main">
                                <p className="table-etiquette">Votre main</p>
                                <div className="table-cartes">{hand.hand.map((c) => <Carte key={c} card={c} size={100} />)}</div>
                            </div>
                            <div className="table-board">
                                <p className="table-etiquette">{hand.board.length === 4 ? 'Flop et turn' : 'Flop'}</p>
                                <div className="table-cartes">{hand.board.map((c) => <Carte key={c} card={c} size={80} />)}</div>
                            </div>
                            <p className="jeu-pot">{situationText(hand)}</p>
                        </section>
                        {current > 0 && (
                            <p className="jeu-precedente">
                                Main {current} : {results[current - 1].total}/100. Il fallait {hands[current - 1].answer}, avec {pct(hands[current - 1].probability)} de chances ({hands[current - 1].outs.cards.length} outs).
                            </p>
                        )}
                        <Etape key={current} hand={hand} onValidate={validate} />
                    </>
                )}

                {done && (
                    <section className="jeu-resultat" aria-live="polite">
                        <p className="jeu-score"><strong>{game.total}</strong>/100</p>
                        {results.map((r, i) => {
                            const h = hands[i];
                            return (
                                <div className="jeu-bilan" key={i}>
                                    <h2 className="jeu-etape-titre">{square(r.total)} Main {i + 1} · {r.total}/100</h2>
                                    <dl className="jeu-detail">
                                        <div><dt>Décision</dt><dd>{r.decision}/50 · vous avez choisi de {r.choice}, il fallait {h.answer}</dd></div>
                                        <div><dt>Estimation</dt><dd>{r.estimatePoints}/50 · {r.estimate} % estimés, {pct(h.probability)} exacts</dd></div>
                                        <div><dt>Le calcul</dt><dd>{h.outs.cards.length} outs ({h.outs.byType.map((t) => `${t.name.toLowerCase()} ${t.cards.length}`).join(', ')}) ; les cotes demandaient {pct(h.required)}</dd></div>
                                    </dl>
                                    <div className="outs-cartes">{h.outs.cards.map((c) => <Carte key={c} card={c} size={34} />)}</div>
                                </div>
                            );
                        })}
                        <div className="jeu-partage">
                            <button type="button" className="btn btn-signal" onClick={share}>Partager mon score</button>
                            <p aria-live="polite">
                                {shared === 'copie' && 'Score copié : collez-le où vous voulez.'}
                                {shared === 'echec' && 'Impossible de copier : sélectionnez le score à la main.'}
                            </p>
                        </div>
                        {!archive && <p className="prose">Série : {streak(games, today)} jour{streak(games, today) > 1 ? 's' : ''} d'affilée. Trois nouvelles mains demain à minuit ; en attendant, rejouez un jour passé ou suivez <a href="/progres/">vos progrès</a>.</p>}
                    </section>
                )}

                <section className="archives" aria-labelledby="archives-titre">
                    <h2 id="archives-titre" className="jeu-etape-titre">Les jours précédents</h2>
                    <ul className="archives-liste">
                        {days.map((d) => {
                            const played = finished(games[d]) ? games[d] : finished(archives[d]) ? archives[d] : null;
                            return (
                                <li key={d}>
                                    <a href={`/jeu/?jour=${d}`} aria-current={d === day ? 'page' : undefined}>
                                        <span>{shortDate(d)}</span>
                                        <strong>{played ? played.total : '–'}</strong>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
