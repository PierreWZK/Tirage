import { useEffect, useRef, useState } from 'react';
import { spotToQuery } from '../core/lien.js';
import { seeded, situation } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { shareText, store, stored } from '../lib/share.js';
import { Carte } from '../components/Carte.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';

const ROUNDS = 10;
// Écart toléré, en points, pour qu'une estimation compte comme juste
const TOLERANCE = 5;

const MODES = {
    decision: { name: 'Suivre ou coucher', seconds: 15, rounds: ROUNDS, text: 'Dix mains, quinze secondes chacune : la bonne décision d’après vos outs et les cotes du pot.' },
    outs: { name: 'Compte les outs', seconds: 20, rounds: ROUNDS, text: 'Dix mains, vingt secondes chacune : combien de cartes vous améliorent ? Le compte exact, pas à peu près.' },
    equite: { name: 'Estime tes chances', seconds: 20, rounds: ROUNDS, text: `Dix mains, vingt secondes chacune : vos chances de toucher, à ${TOLERANCE} points près.` },
    survie: { name: 'Survie', seconds: 15, rounds: Infinity, text: 'Suivre ou coucher, autant de mains que vous tenez : la première erreur arrête la série.' },
};

// Le record de « suivre ou coucher » garde sa clé d'avant les modes
const recordKey = (mode) => (mode === 'decision' ? 'tirage:record' : `tirage:record:${mode}`);
const newCode = () => Math.random().toString(36).slice(2, 8);

/** Un défi reçu par lien : ?mode=outs&serie=k3f9a2&score=8 */
function challengeFromUrl() {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const code = params.get('serie');
    if (!MODES[mode] || !/^[a-z0-9]{4,12}$/.test(code ?? '')) return null;
    const score = Number(params.get('score'));
    return { mode, code, score: Number.isInteger(score) && score >= 0 ? score : null };
}

/** Le chrono d'une main : la barre se vide, puis la main compte comme perdue */
function useTimer(seconds, running, onTimeout) {
    const [left, setLeft] = useState(seconds);
    const timeout = useRef(onTimeout);
    timeout.current = onTimeout;
    useEffect(() => {
        if (!running) return undefined;
        const start = performance.now();
        setLeft(seconds);
        const id = setInterval(() => {
            const remaining = Math.max(0, seconds - (performance.now() - start) / 1000);
            setLeft(remaining);
            if (remaining === 0) {
                clearInterval(id);
                timeout.current();
            }
        }, 100);
        return () => clearInterval(id);
    }, [running, seconds]);
    return left;
}

/** Juste ou faux, selon ce que le mode demande */
function check(mode, hand, value) {
    if (value === null) return false;
    if (mode === 'outs') return value === hand.outs.cards.length;
    if (mode === 'equite') return Math.abs(value - hand.probability * 100) <= TOLERANCE;
    return value === hand.answer;
}

/** Ce que le joueur a répondu, en clair */
function said(mode, value) {
    if (value === null) return 'pas de réponse';
    if (mode === 'outs') return `${value} out${value > 1 ? 's' : ''}`;
    if (mode === 'equite') return `${value} %`;
    return value;
}

function truth(mode, hand) {
    if (mode === 'outs') return `${hand.outs.cards.length} outs`;
    if (mode === 'equite') return pct(hand.probability);
    return hand.answer;
}

/** Saisie du nombre d'outs ou de l'estimation, validée par Entrée */
function Saisie({ mode, onAnswer }) {
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

export function Training() {
    const [challenge, setChallenge] = useState(challengeFromUrl);
    const [mode, setMode] = useState(() => challenge?.mode ?? 'decision');
    const [code, setCode] = useState(null);
    const [hands, setHands] = useState([]);
    const [round, setRound] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [phase, setPhase] = useState('accueil');
    const [record, setRecord] = useState(null);
    const [shared, setShared] = useState(null);
    const random = useRef(null);
    const config = MODES[mode];
    const hand = hands[round];
    const answered = answers.length > round;
    const records = Object.fromEntries(Object.keys(MODES).map((m) => [m, stored(recordKey(m), null)]));

    const answer = (value) => {
        if (answered) return;
        setAnswers((list) => [...list, { value, correct: check(mode, hand, value), time: config.seconds - left }]);
    };
    const left = useTimer(config.seconds, phase === 'jeu' && !answered, () => answer(null));

    // Même code et même mode : la même série de mains, dans le même ordre, pour vous et votre ami
    const start = (seriesCode = newCode()) => {
        random.current = seeded(`serie|${mode}|${seriesCode}`);
        setCode(seriesCode);
        setHands([situation(random.current)]);
        setRound(0);
        setAnswers([]);
        setShared(null);
        setPhase('jeu');
    };

    const finish = (list) => {
        const score = list.filter((a) => a.correct).length;
        const time = list.reduce((sum, a) => sum + a.time, 0);
        const best = records[mode];
        if (!best || score > best.score || (score === best.score && time < best.time)) {
            const entry = { score, time, date: new Date().toISOString().slice(0, 10) };
            store(recordKey(mode), entry);
            setRecord({ ...entry, nouveau: true });
        } else {
            setRecord(best);
        }
        setPhase('fin');
    };

    const next = () => {
        const over = mode === 'survie' ? !answers[round].correct : round + 1 >= config.rounds;
        if (over) {
            finish(answers);
            return;
        }
        if (hands.length === round + 1) setHands((list) => [...list, situation(random.current)]);
        setRound(round + 1);
    };

    // Clavier : S pour suivre, C pour coucher, Entrée pour la suite
    useEffect(() => {
        if (phase !== 'jeu') return undefined;
        const onKey = (e) => {
            if (e.target.closest?.('input, textarea, form')) return;
            const choosing = !answered && (mode === 'decision' || mode === 'survie');
            if (choosing && e.key.toLowerCase() === 's') answer('suivre');
            if (choosing && e.key.toLowerCase() === 'c') answer('coucher');
            if (answered && e.key === 'Enter') next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const score = answers.filter((a) => a.correct).length;
    const last = answers[round];
    const outOf = mode === 'survie' ? '' : `/${config.rounds}`;
    const accepted = challenge && challenge.mode === mode;

    const challengeFriend = async () => {
        const url = new URL('/entrainement/', location.origin);
        url.search = new URLSearchParams({ mode, serie: code, score: String(score) }).toString();
        const line = mode === 'survie' ? `${score} main${score > 1 ? 's' : ''} sans erreur` : `${score}${outOf}`;
        setShared(await shareText(`Tirage · ${config.name} : ${line}. Même série de mains, à vous de faire mieux.\n${url}`));
    };

    return (
        <>
            <SiteHeader page="entrainement" />
            <main className="wrap outil">
                <h1 className="display outil-titre">Entraînement</h1>

                {phase === 'accueil' && (
                    <section className="entr-accueil">
                        {challenge ? (
                            <div className="defi">
                                <p className="table-etiquette">Défi reçu</p>
                                <p className="lede">
                                    {MODES[challenge.mode].name}
                                    {challenge.score !== null && <> : votre ami a fait <strong>{challenge.score}{challenge.mode === 'survie' ? ` main${challenge.score > 1 ? 's' : ''}` : `/${ROUNDS}`}</strong></>}.
                                    {' '}Vous jouez exactement les mêmes mains.
                                </p>
                                <p className="prose">{MODES[challenge.mode].text}</p>
                                <div className="choix">
                                    <button type="button" className="btn btn-signal" onClick={() => start(challenge.code)}>Relever le défi</button>
                                    <button type="button" className="lien" onClick={() => setChallenge(null)}>Choisir un autre mode</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="modes" role="radiogroup" aria-label="Mode d'entraînement">
                                    {Object.entries(MODES).map(([id, m]) => (
                                        <button key={id} type="button" role="radio" aria-checked={mode === id} className="mode" onClick={() => setMode(id)}>
                                            <strong>{m.name}</strong>
                                            <span>{m.text}</span>
                                            <em>{records[id] ? `Record : ${records[id].score}${id === 'survie' ? ` main${records[id].score > 1 ? 's' : ''}` : `/${ROUNDS}`}` : 'Pas encore joué'}</em>
                                        </button>
                                    ))}
                                </div>
                                {(mode === 'decision' || mode === 'survie') && <p className="prose">Au clavier : <kbd>S</kbd> pour suivre, <kbd>C</kbd> pour coucher, <kbd>Entrée</kbd> pour la main suivante.</p>}
                                <button type="button" className="btn btn-signal" onClick={() => start()}>Commencer</button>
                            </>
                        )}
                    </section>
                )}

                {phase === 'jeu' && hand && (
                    <section className="entr-jeu" aria-live="polite">
                        <div className="entr-tete">
                            <span>{config.name} · main {round + 1}{mode === 'survie' ? '' : ` sur ${config.rounds}`}</span>
                            <span>Score {score}</span>
                        </div>
                        <div className="chrono" role="progressbar" aria-label="Temps restant" aria-valuemin={0} aria-valuemax={config.seconds} aria-valuenow={Math.ceil(left)}>
                            <i style={{ width: `${(answered ? (config.seconds - last.time) : left) / config.seconds * 100}%` }} className={left < 5 && !answered ? 'urgent' : ''} />
                        </div>
                        <div className="entr-table">
                            <div className="table-cartes">{hand.hand.map((c) => <Carte key={c} card={c} size={92} />)}</div>
                            <div className="table-cartes">{hand.board.map((c) => <Carte key={c} card={c} size={72} />)}</div>
                        </div>
                        <p className="entr-situation">
                            {mode === 'decision' || mode === 'survie'
                                ? <>Pot <strong>{num(hand.pot)}</strong> · à payer <strong>{num(hand.call)}</strong> · {hand.cardsToCome === 2 ? 'adversaire à tapis, turn et river à venir' : 'une carte à venir'}</>
                                : mode === 'outs'
                                    ? 'Combien de cartes vous améliorent ?'
                                    : <>Vos chances de toucher {hand.cardsToCome === 2 ? "d'ici la river (turn et river à venir)" : 'à la prochaine carte'} ?</>}
                        </p>

                        {!answered ? (
                            mode === 'decision' || mode === 'survie' ? (
                                <div className="choix">
                                    <button type="button" className="btn btn-ok" onClick={() => answer('suivre')}>Suivre</button>
                                    <button type="button" className="btn btn-rouge" onClick={() => answer('coucher')}>Coucher</button>
                                </div>
                            ) : (
                                <Saisie key={round} mode={mode} onAnswer={answer} />
                            )
                        ) : (
                            <div className={`retour ${last.correct ? 'bon' : 'faux'}`}>
                                <p className="retour-titre">
                                    {last.value === null ? 'Temps écoulé.' : last.correct ? 'Bien joué.' : 'Raté.'}
                                    {' '}{mode === 'decision' || mode === 'survie' ? `Il fallait ${hand.answer}.` : `Vous : ${said(mode, last.value)}. Réponse : ${truth(mode, hand)}.`}
                                </p>
                                <p>
                                    {hand.outs.cards.length} outs ({hand.outs.byType.map((t) => `${t.name.toLowerCase()} ${t.cards.length}`).join(', ')}) :
                                    {' '}vous touchez {pct(hand.probability)} du temps{mode === 'decision' || mode === 'survie' ? `, il fallait ${pct(hand.required)}` : ''}.
                                </p>
                                <div className="outs-cartes">{hand.outs.cards.map((c) => <Carte key={c} card={c} size={34} />)}</div>
                                <div className="choix">
                                    <button type="button" className="btn btn-signal" onClick={next} autoFocus>
                                        {(mode === 'survie' ? last.correct : round + 1 < config.rounds) ? 'Main suivante' : 'Voir mon score'}
                                    </button>
                                    <a className="lien" href={`/calculateur/?${spotToQuery(hand)}`} target="_blank" rel="noopener">Ouvrir dans le calculateur</a>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {phase === 'fin' && (
                    <section className="entr-fin">
                        <p className="entr-score"><strong>{score}</strong>{mode === 'survie' ? <span> main{score > 1 ? 's' : ''}</span> : outOf}</p>
                        <p className="lede">
                            {accepted && challenge.score !== null
                                ? (score > challenge.score ? 'Défi relevé : vous battez votre ami.' : score === challenge.score ? 'Égalité avec votre ami.' : `Votre ami garde l'avantage (${challenge.score}).`)
                                : mode === 'survie' ? (score >= 10 ? 'Belle série.' : 'Encore une.') : score === ROUNDS ? 'Sans faute.' : score >= 7 ? 'Solide.' : 'Encore quelques séries.'}
                            {' '}{record.nouveau ? 'Nouveau record.' : `Record : ${record.score}${mode === 'survie' ? '' : outOf}.`}
                        </p>
                        <ol className="entr-recap">
                            {answers.map((a, i) => (
                                <li key={i} className={a.correct ? 'bon' : 'faux'}>
                                    <span>Main {i + 1}</span>
                                    <span>{hands[i].outs.cards.length} outs · {pct(hands[i].probability)}{mode === 'decision' || mode === 'survie' ? ` contre ${pct(hands[i].required)}` : ''}</span>
                                    <span>{a.correct ? 'Juste' : `Réponse : ${truth(mode, hands[i])}`}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="choix">
                            <button type="button" className="btn btn-signal" onClick={challengeFriend}>Défier un ami</button>
                            <button type="button" className="btn btn-ghost" onClick={() => { setChallenge(null); start(); }}>Rejouer</button>
                            <button type="button" className="lien" onClick={() => { setChallenge(null); setPhase('accueil'); }}>Changer de mode</button>
                        </div>
                        <p role="status">{shared === 'copie' ? 'Lien copié : votre ami jouera les mêmes mains.' : shared === 'echec' ? 'Copie impossible.' : ''}</p>
                    </section>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
