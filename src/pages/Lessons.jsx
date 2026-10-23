import { useState } from 'react';
import { drawKind } from '../core/progres.js';
import { impliedSituation, seeded, situation } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { remember, store, stored } from '../lib/share.js';
import { Carte } from '../components/Carte.jsx';
import { Saisie, check, said, truth } from '../components/Saisie.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';

export const LESSONS_KEY = 'tirage:lecons';
const EXERCISES = 5;

export const LESSONS = [
    {
        id: 'outs',
        title: 'Compter ses outs',
        mode: 'outs',
        make: (random) => situation(random),
        body: [
            'Un out est une carte qui vous fait passer devant : une couleur, une quinte, un brelan. Pour les compter, partez de ce qui manque à votre main, puis retirez les cartes que vous voyez déjà.',
            'Quatre cœurs entre votre main et le flop ? Il en reste 13 − 4 = 9 dans le paquet : 9 outs. Une quinte ouverte (8-9 sur 7-6) se complète par les quatre 5 et les quatre 10 : 8 outs. Une quinte ventrale n\'a qu\'une valeur possible : 4 outs.',
            'Avec deux tirages à la fois, ne comptez jamais deux fois la même carte. Le 5 et le 10 de cœur font à la fois la couleur et la quinte : 9 + 8 − 2 = 15 outs.',
        ],
        example: { hand: ['8h', '9h'], board: ['7h', '6c', '2h'], figure: '15 outs', caption: '9 cœurs pour la couleur, plus les 6 autres 5 et 10 pour la quinte.' },
    },
    {
        id: 'regle',
        title: 'La règle du 2 et du 4',
        mode: 'equite',
        make: (random) => situation(random),
        body: [
            'À la table, pas de calculatrice. Multipliez vos outs par 2 quand une seule carte reste à venir, par 4 quand le turn et la river vont tomber (adversaire à tapis au flop).',
            'La règle est juste jusqu\'à 8 outs environ. Au-delà, elle surestime : 15 outs × 4 donnent 60 %, la vraie probabilité est de 54,1 %. Avec deux cartes à venir, retirez l\'excédent au-dessus de 8 : 60 − (15 − 8) = 53 %, à un point près.',
            'L\'exercice demande la vraie probabilité, à 5 points près : la règle suffit, à condition de penser à la correction.',
        ],
        example: { hand: ['Ah', 'Kh'], board: ['7h', '2h', '9c'], figure: '9 × 4 = 36 %', caption: 'Tirage couleur au flop, à tapis : 35,0 % exacts.' },
    },
    {
        id: 'cotes',
        title: 'Les cotes du pot',
        mode: 'decision',
        make: (random) => situation(random),
        body: [
            'Suivre est rentable quand vos chances couvrent le prix. Le prix, c\'est ce que vous payez rapporté au pot final : à payer ÷ (pot + à payer), le pot comprenant déjà la mise adverse.',
            'Pot de 300 dont une mise de 100 : vous payez 100 pour un pot final de 400, il faut gagner 25 % du temps. Retenez les mises courantes : un tiers du pot demande 20 %, la moitié 25 %, le pot entier 33 %.',
            'Comparez ensuite avec vos chances : au-dessus, suivez ; en dessous, couchez-vous, sauf s\'il reste de quoi gagner plus tard (leçon suivante).',
        ],
        example: { hand: ['8c', '9d'], board: ['7h', '6s', '2c'], figure: '31,5 % > 25 %', caption: 'Quinte ouverte au flop, adversaire à tapis : pot 300 dont sa mise de 100, à payer 100. Suivre.', note: 'Avec une seule carte à venir, 8 outs sur 47 ne font que 17 % : il faudrait se coucher.' },
    },
    {
        id: 'implicites',
        title: 'Cotes implicites et outs sales',
        mode: 'implicite',
        make: (random) => impliedSituation(random),
        body: [
            'Quand une seule carte reste à venir et que l\'adversaire a encore des jetons, toucher rapporte plus que le pot actuel : il paiera souvent une mise de plus. C\'est la cote implicite.',
            'Le calcul : il faut gagner ensuite au moins (1 − p) × à payer ÷ p − pot, où p est votre chance de toucher. Au turn avec 9 outs (19,6 %), pot 300 et 100 à payer, il faut récupérer encore 111 au moins : si l\'adversaire a ce tapis et vous paiera, suivez.',
            'Méfiez-vous des outs sales : une carte qui vous donne la quinte mais met trois cœurs au board, ou une couleur qui double le board et offre un full à l\'adversaire. Comptez-les pour moitié.',
        ],
        example: { hand: ['Ah', 'Kh'], board: ['7h', '2h', '9c', 'Js'], figure: '≥ 111 ensuite', caption: '9 outs au turn, pot 300, à payer 100 : 19,6 % contre 25 % demandés.' },
    },
];

/** Cinq mains pour mettre la leçon en pratique, sans chrono */
function Exercice({ lesson, onDone }) {
    const [random] = useState(() => seeded(Date.now()));
    const [hands, setHands] = useState(() => [lesson.make(random)]);
    const [answers, setAnswers] = useState([]);
    const round = hands.length - 1;
    const hand = hands[round];
    const answered = answers.length > round;
    const last = answers[round];
    const choosing = lesson.mode === 'decision' || lesson.mode === 'implicite';
    const score = answers.filter((a) => a.correct).length;
    const over = answers.length === EXERCISES;

    const answer = (value) => {
        const correct = check(lesson.mode, hand, value);
        setAnswers([...answers, { value, correct }]);
        remember({ m: 'lecon', k: drawKind(hand.outs), ok: correct, ...(lesson.mode === 'equite' && { g: value - hand.probability * 100 }) });
        if (answers.length + 1 === EXERCISES) onDone(score + (correct ? 1 : 0));
    };
    const restart = () => {
        setHands([lesson.make(random)]);
        setAnswers([]);
    };

    return (
        <div className="exercice" aria-live="polite">
            <p className="table-etiquette">Exercice · main {Math.min(round + 1, EXERCISES)} sur {EXERCISES} · {score} juste{score > 1 ? 's' : ''}</p>
            <div className="entr-table">
                <div className="table-cartes">{hand.hand.map((c) => <Carte key={c} card={c} size={72} />)}</div>
                <div className="table-cartes">{hand.board.map((c) => <Carte key={c} card={c} size={58} />)}</div>
            </div>
            <p className="entr-situation">
                {lesson.mode === 'outs' && 'Combien de cartes vous améliorent ?'}
                {lesson.mode === 'equite' && <>Vos chances de toucher {hand.cardsToCome === 2 ? "d'ici la river (adversaire à tapis)" : 'à la prochaine carte'} ?</>}
                {lesson.mode === 'decision' && <>Pot <strong>{num(hand.pot)}</strong> · à payer <strong>{num(hand.call)}</strong> · {hand.cardsToCome === 2 ? 'adversaire à tapis, turn et river à venir' : 'une carte à venir'}. Vous suivez ?</>}
                {lesson.mode === 'implicite' && <>Pot <strong>{num(hand.pot)}</strong> · à payer <strong>{num(hand.call)}</strong> · si vous touchez, l'adversaire paiera encore <strong>{num(hand.later)}</strong>. Vous suivez ?</>}
            </p>
            {!answered ? (
                choosing ? (
                    <div className="choix">
                        <button type="button" className="btn btn-ok" onClick={() => answer('suivre')}>Suivre</button>
                        <button type="button" className="btn btn-rouge" onClick={() => answer('coucher')}>Coucher</button>
                    </div>
                ) : (
                    <Saisie key={round} mode={lesson.mode} onAnswer={answer} />
                )
            ) : (
                <div className={`retour ${last.correct ? 'bon' : 'faux'}`}>
                    <p className="retour-titre">{last.correct ? 'Juste.' : 'Raté.'} {choosing ? `Il fallait ${hand.answer}.` : `Vous : ${said(lesson.mode, last.value)}. Réponse : ${truth(lesson.mode, hand)}.`}</p>
                    <p>
                        {hand.outs.cards.length} outs ({hand.outs.byType.map((t) => `${t.name.toLowerCase()} ${t.cards.length}`).join(', ')}) : {pct(hand.probability)} de chances
                        {lesson.mode === 'decision' && <>, les cotes demandaient {pct(hand.required)}</>}
                        {lesson.mode === 'implicite' && <>, les cotes demandaient {pct(hand.required)} ; il fallait gagner encore {num(Math.ceil(hand.needed))} ensuite</>}.
                    </p>
                    <div className="choix">
                        {over ? (
                            <>
                                <p className="exercice-score"><strong>{score}</strong>/{EXERCISES}</p>
                                <button type="button" className="btn btn-signal" onClick={restart}>Cinq autres mains</button>
                            </>
                        ) : (
                            <button type="button" className="btn btn-signal" onClick={() => setHands([...hands, lesson.make(random)])} autoFocus>Main suivante</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Lecon({ lesson, index, best, onDone }) {
    const [open, setOpen] = useState(false);
    const { example } = lesson;
    return (
        <article className="lecon" id={lesson.id} aria-labelledby={`${lesson.id}-titre`}>
            <div className="lecon-grille">
                <div className="lecon-texte">
                    <p className="lecon-numero" aria-hidden="true">{index + 1}</p>
                    <h2 id={`${lesson.id}-titre`} className="section-titre">{lesson.title}</h2>
                    {lesson.body.map((p) => <p key={p.slice(0, 20)} className="prose">{p}</p>)}
                </div>
                <figure className="lecon-exemple">
                    <div className="entr-table">
                        <div className="table-cartes">{example.hand.map((c) => <Carte key={c} card={c} size={64} />)}</div>
                        <div className="table-cartes">{example.board.map((c) => <Carte key={c} card={c} size={50} />)}</div>
                    </div>
                    <p className="lecon-chiffre">{example.figure}</p>
                    <figcaption>{example.caption}{example.note && <> {example.note}</>}</figcaption>
                </figure>
            </div>
            {open ? (
                <Exercice lesson={lesson} onDone={onDone} />
            ) : (
                <p className="lecon-action">
                    <button type="button" className="btn btn-tv" onClick={() => setOpen(true)}>S'exercer : {EXERCISES} mains</button>
                    {best !== undefined && <span>Meilleur score : {best}/{EXERCISES}</span>}
                </p>
            )}
        </article>
    );
}

export function Lessons() {
    const [bests, setBests] = useState(() => stored(LESSONS_KEY, {}));
    const done = (id) => (score) => {
        const next = { ...bests, [id]: Math.max(score, bests[id] ?? 0) };
        setBests(next);
        store(LESSONS_KEY, next);
    };

    return (
        <>
            <SiteHeader page="lecons" />
            <main className="wrap outil">
                <h1 className="display outil-titre">Leçons</h1>
                <p className="lede">Quatre leçons de cinq minutes, de la première carte comptée aux cotes implicites. Chacune se termine par cinq mains à jouer.</p>
                <nav className="lecons-sommaire" aria-label="Les leçons">
                    {LESSONS.map((l, i) => (
                        <a key={l.id} href={`#${l.id}`}>
                            <span>{i + 1}</span>
                            {l.title}
                            <em>{bests[l.id] !== undefined ? `${bests[l.id]}/${EXERCISES}` : 'À faire'}</em>
                        </a>
                    ))}
                </nav>
                {LESSONS.map((l, i) => <Lecon key={l.id} lesson={l} index={i} best={bests[l.id]} onDone={done(l.id)} />)}
            </main>
            <SiteFooter />
        </>
    );
}
