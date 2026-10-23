import { useState } from 'react';
import { summarize } from '../core/progres.js';
import { parisDate, pastDays } from '../core/situations.js';
import { num } from '../lib/analyse.js';
import { HISTORY_KEY, store, stored } from '../lib/share.js';
import { MODES, ROUNDS, recordKey } from '../components/Saisie.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';
import { ARCHIVES_KEY, KEY as DAILY_KEY, finished, streak } from './Daily.jsx';
import { LESSONS, LESSONS_KEY } from './Lessons.jsx';

const percent = (x) => (x === null ? '–' : `${Math.round(x * 100)} %`);
const points = (x) => `${num(Math.round(Math.abs(x) * 10) / 10)} point${Math.abs(x) >= 2 ? 's' : ''}`;
const shortDate = (day) => new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(`${day}T12:00:00Z`));

/** Le sens de l'erreur d'estimation, en une phrase */
function biasText(bias) {
    if (bias === null) return null;
    if (Math.abs(bias) < 1.5) return 'Vos estimations ne penchent d\'aucun côté.';
    return bias > 0 ? `Vous surestimez vos chances de ${points(bias)} en moyenne.` : `Vous sous-estimez vos chances de ${points(bias)} en moyenne.`;
}

const KEYS = [HISTORY_KEY, DAILY_KEY, ARCHIVES_KEY, LESSONS_KEY, ...Object.keys(MODES).map(recordKey)];

export function Progress() {
    const today = parisDate();
    const [history, setHistory] = useState(() => stored(HISTORY_KEY, []));
    const games = stored(DAILY_KEY, {});
    const lessons = stored(LESSONS_KEY, {});
    const summary = summarize(history);
    const days = [today, ...pastDays(today, 13)].reverse();
    const scores = days.map((d) => (finished(games[d]) ? games[d].total : null));
    const played = scores.filter((s) => s !== null);
    const daysPlayed = Object.entries(games).filter(([, g]) => finished(g));

    const erase = () => {
        if (!confirm('Effacer tout votre historique, vos records et vos scores du jour sur ce navigateur ?')) return;
        KEYS.forEach((k) => store(k, null));
        setHistory([]);
        location.reload();
    };

    return (
        <>
            <SiteHeader page="progres" />
            <main className="wrap outil">
                <h1 className="display outil-titre">Vos progrès</h1>
                <p className="lede">Chaque réponse donnée sur Tirage, rangée par type de tirage. Tout reste dans ce navigateur : rien n'est envoyé.</p>

                {summary.count === 0 && daysPlayed.length === 0 ? (
                    <section className="progres-vide">
                        <p className="prose">Rien encore. Jouez une série d'entraînement, la main du jour ou une leçon : vos chiffres apparaîtront ici.</p>
                        <div className="choix">
                            <a className="btn btn-signal" href="/entrainement/">S'entraîner</a>
                            <a className="btn btn-ghost" href="/jeu/">La main du jour</a>
                        </div>
                    </section>
                ) : (
                    <>
                        <dl className="progres-chiffres">
                            <div><dt>Mains jouées</dt><dd>{num(summary.count)}</dd></div>
                            <div><dt>Réponses justes</dt><dd>{percent(summary.rate)}</dd></div>
                            <div><dt>Écart d'estimation</dt><dd>{summary.gap === null ? '–' : `${num(Math.round(summary.gap * 10) / 10)} pts`}</dd></div>
                            <div><dt>Série du jour</dt><dd>{streak(games, today)} j</dd></div>
                        </dl>
                        {(summary.weakest || summary.bias !== null) && (
                            <p className="progres-constat">
                                {summary.weakest && <>Votre point faible : <strong>{summary.weakest.kind.toLowerCase()}</strong>, {percent(summary.weakest.rate)} de réponses justes sur {summary.weakest.count} mains. </>}
                                {biasText(summary.bias)}
                            </p>
                        )}

                        <section className="progres-bloc" aria-labelledby="tirages-titre">
                            <h2 id="tirages-titre" className="section-titre">Par tirage</h2>
                            <table className="progres-table">
                                <thead><tr><th scope="col">Tirage</th><th scope="col">Mains</th><th scope="col">Justes</th><th scope="col">Estimations</th></tr></thead>
                                <tbody>
                                    {summary.byKind.map((k) => (
                                        <tr key={k.kind}>
                                            <th scope="row">{k.kind}</th>
                                            <td>{k.count}</td>
                                            <td><span className="progres-barre"><i style={{ width: percent(k.rate).replace(' ', '') }} /></span>{percent(k.rate)}</td>
                                            <td>{k.bias === null ? '–' : `${k.bias > 0 ? '+' : '−'}${num(Math.round(Math.abs(k.bias) * 10) / 10)} pts`}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="prose progres-note">Estimations : l'écart moyen entre vos pourcentages et les vrais, + quand vous surestimez.</p>
                        </section>

                        <section className="progres-bloc" aria-labelledby="jour-titre">
                            <h2 id="jour-titre" className="section-titre">La main du jour, sur deux semaines</h2>
                            <ol className="progres-jours">
                                {days.map((d, i) => (
                                    <li key={d}>
                                        <span className="progres-colonne"><i style={{ height: `${scores[i] ?? 0}%` }} /></span>
                                        <strong>{scores[i] ?? '–'}</strong>
                                        <span>{shortDate(d)}</span>
                                    </li>
                                ))}
                            </ol>
                            <p className="prose">
                                {played.length ? <>Moyenne : <strong>{Math.round(played.reduce((a, b) => a + b, 0) / played.length)}/100</strong> sur {played.length} jour{played.length > 1 ? 's' : ''}. </> : 'Aucune main du jour jouée ces deux dernières semaines. '}
                                <a href="/jeu/">Jouer ou rejouer un jour</a>.
                            </p>
                        </section>

                        <section className="progres-bloc progres-duo" aria-label="Records et leçons">
                            <div>
                                <h2 className="section-titre">Records</h2>
                                <ul className="progres-liste">
                                    {Object.entries(MODES).map(([id, m]) => {
                                        const r = stored(recordKey(id), null);
                                        return <li key={id}><span>{m.name}</span><strong>{r ? `${r.score}${id === 'survie' ? ` main${r.score > 1 ? 's' : ''}` : `/${ROUNDS}`}` : '–'}</strong></li>;
                                    })}
                                </ul>
                            </div>
                            <div>
                                <h2 className="section-titre">Leçons</h2>
                                <ul className="progres-liste">
                                    {LESSONS.map((l) => <li key={l.id}><a href={`/lecons/#${l.id}`}>{l.title}</a><strong>{lessons[l.id] !== undefined ? `${lessons[l.id]}/5` : '–'}</strong></li>)}
                                </ul>
                            </div>
                        </section>

                        <p><button type="button" className="lien" onClick={erase}>Effacer mes données</button></p>
                    </>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
