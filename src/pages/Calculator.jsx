import { useEffect, useState } from 'react';
import { CATEGORY_NAMES } from '../core/evaluator.js';
import { queryToSpot, spotToQuery } from '../core/lien.js';
import { seeded, situation } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { shareText } from '../lib/share.js';
import { Carte } from '../components/Carte.jsx';
import { Incrust } from '../components/Incrust.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';
import { Table, useSpot } from '../components/Table.jsx';

const EMPTY = { cards: Array(6).fill(null), pot: 300, call: 100, cardsToCome: 1 };

/** La main reçue par lien (?main=…&board=…), sinon une table vide */
function initialSpot() {
    const spot = queryToSpot(location.search);
    if (!spot) return EMPTY;
    return { ...spot, cards: [...spot.hand, ...spot.board, ...Array(4 - spot.board.length).fill(null), ...(spot.opponent ?? [])] };
}

// Des mains d'école, pour voir un calcul en un clic
const EXAMPLES = [
    ['Tirage couleur', { hand: ['Ah', 'Kh'], board: ['7h', '2h', '9c'], pot: 300, call: 100, cardsToCome: 1 }],
    ['Quinte ouverte', { hand: ['8c', '9d'], board: ['7h', '6s', '2c'], pot: 200, call: 100, cardsToCome: 1 }],
    ['Couleur + quinte', { hand: ['8h', '9h'], board: ['7h', '6c', '2h'], pot: 400, call: 400, cardsToCome: 2 }],
    ['Quinte ventrale', { hand: ['8c', '9d'], board: ['Js', '7h', '2c'], pot: 300, call: 150, cardsToCome: 1 }],
    ['Paire servie', { hand: ['5s', '5d'], board: ['Kh', '7c', '2s'], pot: 500, call: 100, cardsToCome: 1 }],
];

/** La phrase qui explique le verdict, avec les chiffres de la main */
function Explication({ result, pot, call }) {
    if (!result) return <p className="prose">Choisissez vos deux cartes puis le flop (et le turn s'il est tombé) : le calcul se fait à chaque carte.</p>;
    const { count, exact, odds, verdict, toCome, outs } = result;
    if (count === 0) {
        return <p className="prose">Aucun out : aucune carte à venir ne vous fait passer au-dessus de votre {CATEGORY_NAMES[outs.current].toLowerCase()} grâce à vos cartes. Sans autre raison de rester, on se couche.</p>;
    }
    return (
        <p className="prose">
            {count} carte{count > 1 ? 's' : ''} sur {outs.unseen} vous améliore{count > 1 ? 'nt' : ''} : vous touchez <strong>{pct(exact)}</strong> du temps
            {toCome === 2 ? " d'ici la river" : ' à la prochaine carte'}.
            {odds && <> Payer {num(call)} pour un pot de {num(pot)} demande de gagner <strong>{pct(odds.required)}</strong> du temps : {verdict === 'suivre' ? 'vos chances le couvrent, suivre est rentable.' : 'vos chances ne le couvrent pas.'}</>}
            {verdict === 'coucher' && toCome === 1 && Number.isFinite(result.implied) && <> Pour suivre quand même, il faudrait gagner encore au moins <strong>{num(Math.ceil(result.implied / 10) * 10)}</strong> ensuite quand vous touchez (cotes implicites). Sinon, couchez-vous.</>}
            {verdict === 'coucher' && toCome === 2 && ' Adversaire à tapis : rien à gagner ensuite, couchez-vous.'}
        </p>
    );
}

/** L'équité réelle contre une main précise, jusqu'à la river : les outs « sales » y sont décomptés */
function Contre({ result }) {
    const { versus, exact, toCome, odds } = result;
    if (!versus) {
        return <p className="contre contre-vide">Vous pensez savoir ce qu'a l'adversaire ? Placez ses deux cartes sous le board : l'équité exacte contre sa main s'affiche ici.</p>;
    }
    return (
        <div className="contre">
            <p className="table-etiquette">Contre cette main, jusqu'à la river</p>
            <p className="contre-chiffre"><strong>{pct(versus.equity)}</strong> d'équité</p>
            <div className="contre-barre" aria-hidden="true">
                <i style={{ width: `${versus.win * 100}%` }} />
                <b style={{ width: `${versus.tie * 100}%` }} />
            </div>
            <p className="prose">
                Vous gagnez {pct(versus.win)}{versus.tie > 0.0005 && <>, partagez {pct(versus.tie)}</>} et perdez {pct(versus.lose)} des {num(versus.runouts)} {versus.runouts > 44 ? 'turns et rivers' : 'rivers'} possibles.
                {toCome === 2 && odds && <> À tapis, il fallait {pct(odds.required)} : {versus.equity >= odds.required ? 'suivre est rentable contre cette main.' : 'couchez-vous contre cette main.'}</>}
                {toCome === 2 && Math.abs(versus.equity - exact) > 0.05 && <> L'écart avec vos {pct(exact)} de tirage vient des outs qui ne suffisent pas, ou de la main que vous avez déjà.</>}
            </p>
        </div>
    );
}

export function Calculator() {
    const state = useSpot(initialSpot());
    const { result, pot, call, setPot, setCall, cardsToCome, setCardsToCome, cards } = state;
    const onTurn = Boolean(cards[5]);
    const [random] = useState(() => seeded(Date.now()));
    const [shared, setShared] = useState(null);

    // L'adresse suit la main : la copier, c'est partager la situation
    const opponent = cards.slice(6).filter(Boolean);
    const query = result ? spotToQuery({ hand: cards.slice(0, 2), board: cards.slice(2, 6).filter(Boolean), opponent, pot, call, cardsToCome: result.toCome }) : '';
    useEffect(() => {
        history.replaceState(null, '', query ? `?${query}` : location.pathname);
        setShared(null);
    }, [query]);
    const share = async () => setShared(await shareText(location.href));

    return (
        <>
            <SiteHeader page="calculateur" />
            <main className="wrap outil">
                <h1 className="display outil-titre">Calculateur</h1>
                <div className="outil-grille">
                    <section className="outil-table" aria-label="Votre main, le board et les mises">
                        <Table state={state} size={92} boardSize={76} opponent />
                        <div className="outil-mises">
                            <label className="champ">Pot, mise adverse comprise
                                <input type="number" min="0" step="10" inputMode="numeric" value={pot} onChange={(e) => setPot(Math.max(0, Number(e.target.value) || 0))} />
                            </label>
                            <label className="champ">À payer pour suivre
                                <input type="number" min="0" step="10" inputMode="numeric" value={call} onChange={(e) => setCall(Math.max(0, Number(e.target.value) || 0))} />
                            </label>
                            <div className="champ">
                                <span id="cartes-a-venir">Cartes à venir</span>
                                <div className="segment" role="group" aria-labelledby="cartes-a-venir">
                                    <button type="button" aria-pressed={onTurn || cardsToCome === 1} onClick={() => setCardsToCome(1)}>La suivante</button>
                                    <button type="button" aria-pressed={!onTurn && cardsToCome === 2} disabled={onTurn} onClick={() => setCardsToCome(2)}>Turn et river (à tapis)</button>
                                </div>
                            </div>
                        </div>
                        <div className="exemples">
                            <p className="table-etiquette">Exemples</p>
                            <div className="exemples-liste">
                                {EXAMPLES.map(([label, spot]) => (
                                    <button key={label} type="button" className="btn btn-ghost" onClick={() => state.load(spot)}>{label}</button>
                                ))}
                                <button type="button" className="btn btn-tv" onClick={() => state.load(situation(random))}>Main au hasard</button>
                            </div>
                        </div>
                    </section>

                    <section className="outil-resultat" aria-label="Résultat">
                        <Incrust result={result} />
                        <Explication result={result} pot={pot} call={call} />
                        {result && <Contre result={result} />}
                        {result && (
                            <p className="partage-main">
                                <button type="button" className="btn btn-ghost" onClick={share}>Partager cette main</button>
                                <span role="status">{shared === 'copie' ? 'Lien copié : la personne verra la même table.' : shared === 'echec' ? "Copie impossible : copiez l'adresse de la page." : ''}</span>
                            </p>
                        )}
                        {result && result.count > 0 && (
                            <div className="outs-liste">
                                <h2 className="outs-titre">Vos {result.count} outs, carte par carte</h2>
                                {result.outs.byType.map((type) => (
                                    <div className="outs-type" key={type.name}>
                                        <p><strong>{type.name}</strong> · {type.cards.length}</p>
                                        <div className="outs-cartes">{type.cards.map((c) => <Carte key={c} card={c} size={44} />)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
