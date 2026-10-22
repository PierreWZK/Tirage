import { useEffect, useRef, useState } from 'react';
import { seeded, situation } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { store, stored } from '../lib/share.js';
import { Carte } from '../components/Carte.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';

const ROUNDS = 10;
const SECONDS = 15;
const RECORD_KEY = 'tirage:record';

/** Le chrono d'une main : la barre se vide en 15 secondes, puis la main compte comme perdue */
function useTimer(running, onTimeout) {
    const [left, setLeft] = useState(SECONDS);
    const timeout = useRef(onTimeout);
    timeout.current = onTimeout;
    useEffect(() => {
        if (!running) return undefined;
        const start = performance.now();
        setLeft(SECONDS);
        const id = setInterval(() => {
            const remaining = Math.max(0, SECONDS - (performance.now() - start) / 1000);
            setLeft(remaining);
            if (remaining === 0) {
                clearInterval(id);
                timeout.current();
            }
        }, 100);
        return () => clearInterval(id);
    }, [running]);
    return left;
}

export function Training() {
    const [hands, setHands] = useState([]);
    const [round, setRound] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [phase, setPhase] = useState('accueil');
    const [record, setRecord] = useState(() => stored(RECORD_KEY, null));
    const hand = hands[round];
    const answered = answers.length > round;

    const answer = (choice) => {
        if (answered) return;
        setAnswers((list) => [...list, { choice, correct: choice === hand.answer, time: SECONDS - left }]);
    };
    const left = useTimer(phase === 'jeu' && !answered, () => answer(null));

    const start = () => {
        const random = seeded(Date.now());
        setHands(Array.from({ length: ROUNDS }, () => situation(random)));
        setRound(0);
        setAnswers([]);
        setPhase('jeu');
    };

    const next = () => {
        if (round + 1 < ROUNDS) {
            setRound(round + 1);
            return;
        }
        const score = answers.filter((a) => a.correct).length;
        const time = answers.reduce((sum, a) => sum + a.time, 0);
        if (!record || score > record.score || (score === record.score && time < record.time)) {
            const best = { score, time, date: new Date().toISOString().slice(0, 10) };
            setRecord(best);
            store(RECORD_KEY, best);
        }
        setPhase('fin');
    };

    // Clavier : S pour suivre, C pour coucher, Entrée pour la suite
    useEffect(() => {
        if (phase !== 'jeu') return undefined;
        const onKey = (e) => {
            if (e.target.closest?.('input, textarea')) return;
            if (!answered && e.key.toLowerCase() === 's') answer('suivre');
            if (!answered && e.key.toLowerCase() === 'c') answer('coucher');
            if (answered && e.key === 'Enter') next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const score = answers.filter((a) => a.correct).length;
    const last = answers[round];

    return (
        <>
            <SiteHeader page="entrainement" />
            <main className="wrap outil">
                <h1 className="display outil-titre">Entraînement</h1>

                {phase === 'accueil' && (
                    <section className="entr-accueil">
                        <p className="lede">Dix mains tirées au hasard. Quinze secondes pour chacune : suivre ou coucher, d'après vos outs et les cotes du pot.</p>
                        <p className="prose">Au clavier : <kbd>S</kbd> pour suivre, <kbd>C</kbd> pour coucher, <kbd>Entrée</kbd> pour la main suivante.</p>
                        {record && <p className="record">Votre record : <strong>{record.score}/{ROUNDS}</strong> en {num(Math.round(record.time))} s.</p>}
                        <button type="button" className="btn btn-signal" onClick={start}>Commencer</button>
                    </section>
                )}

                {phase === 'jeu' && hand && (
                    <section className="entr-jeu" aria-live="polite">
                        <div className="entr-tete">
                            <span>Main {round + 1} sur {ROUNDS}</span>
                            <span>Score {score}</span>
                        </div>
                        <div className="chrono" role="progressbar" aria-label="Temps restant" aria-valuemin={0} aria-valuemax={SECONDS} aria-valuenow={Math.ceil(left)}>
                            <i style={{ width: `${(answered ? (SECONDS - last.time) : left) / SECONDS * 100}%` }} className={left < 5 && !answered ? 'urgent' : ''} />
                        </div>
                        <div className="entr-table">
                            <div className="table-cartes">{hand.hand.map((c) => <Carte key={c} card={c} size={92} />)}</div>
                            <div className="table-cartes">{hand.board.map((c) => <Carte key={c} card={c} size={72} />)}</div>
                        </div>
                        <p className="entr-situation">
                            Pot <strong>{num(hand.pot)}</strong> · à payer <strong>{num(hand.call)}</strong> · {hand.cardsToCome === 2 ? 'adversaire à tapis, turn et river à venir' : 'une carte à venir'}
                        </p>

                        {!answered ? (
                            <div className="choix">
                                <button type="button" className="btn btn-ok" onClick={() => answer('suivre')}>Suivre</button>
                                <button type="button" className="btn btn-rouge" onClick={() => answer('coucher')}>Coucher</button>
                            </div>
                        ) : (
                            <div className={`retour ${last.correct ? 'bon' : 'faux'}`}>
                                <p className="retour-titre">{last.choice === null ? 'Temps écoulé.' : last.correct ? 'Bien joué.' : 'Raté.'} Il fallait {hand.answer}.</p>
                                <p>
                                    {hand.outs.cards.length} outs ({hand.outs.byType.map((t) => `${t.name.toLowerCase()} ${t.cards.length}`).join(', ')}) :
                                    {' '}vous touchez {pct(hand.probability)} du temps, il fallait {pct(hand.required)}.
                                </p>
                                <div className="outs-cartes">{hand.outs.cards.map((c) => <Carte key={c} card={c} size={34} />)}</div>
                                <button type="button" className="btn btn-signal" onClick={next} autoFocus>{round + 1 < ROUNDS ? 'Main suivante' : 'Voir mon score'}</button>
                            </div>
                        )}
                    </section>
                )}

                {phase === 'fin' && (
                    <section className="entr-fin">
                        <p className="entr-score"><strong>{score}</strong>/{ROUNDS}</p>
                        <p className="lede">
                            {score === ROUNDS ? 'Sans faute.' : score >= 7 ? 'Solide.' : 'Encore quelques séries.'} Record : {record.score}/{ROUNDS} en {num(Math.round(record.time))} s.
                        </p>
                        <ol className="entr-recap">
                            {hands.map((h, i) => (
                                <li key={i} className={answers[i].correct ? 'bon' : 'faux'}>
                                    <span>Main {i + 1}</span>
                                    <span>{h.outs.cards.length} outs · {pct(h.probability)} contre {pct(h.required)}</span>
                                    <span>{answers[i].correct ? 'Juste' : `Il fallait ${h.answer}`}</span>
                                </li>
                            ))}
                        </ol>
                        <button type="button" className="btn btn-signal" onClick={start}>Rejouer</button>
                    </section>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
