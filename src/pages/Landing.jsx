import { useState } from 'react';
import { hitProbability, potOdds, decide } from '../core/odds.js';
import { dailyHand, parisDate, seeded, situation } from '../core/situations.js';
import { num, pct } from '../lib/analyse.js';
import { Carte } from '../components/Carte.jsx';
import { Incrust } from '../components/Incrust.jsx';
import { SiteFooter, SiteHeader } from '../components/Site.jsx';
import { Table, useSpot } from '../components/Table.jsx';

// La main de la démo : tirage couleur + quinte ouverte au flop, adversaire qui mise 100 dans un pot de 200
const DEMO = { hand: ['8h', '9h'], board: ['7h', '6c', '2h'], pot: 300, call: 100, cardsToCome: 1 };

function Check() {
    return (
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
        </svg>
    );
}

/** Le premier écran : le titre à gauche, la retransmission à droite, vivante */
function Hero() {
    const state = useSpot({ cards: [...DEMO.hand, ...DEMO.board, null], pot: DEMO.pot, call: DEMO.call });
    const [random] = useState(() => seeded(Date.now()));
    const deal = () => state.load(situation(random, { street: 'flop', allIn: false }));

    return (
        <section className="hero" aria-labelledby="titre">
            <div className="wrap hero-grille">
                <div className="hero-texte">
                    <h1 id="titre" className="display">Vos outs, vos cotes, la bonne décision.</h1>
                    <p className="lede">
                        Tirage compte les cartes qui vous sauvent, donne vos chances au chiffre près et les compare aux cotes du pot.
                        Avec la règle du 2 et du 4 juste à côté, pour apprendre à vous en passer.
                    </p>
                    <div className="hero-actions">
                        <a className="btn btn-signal" href="/calculateur/">Ouvrir le calculateur</a>
                        <a className="btn btn-ghost" href="/jeu/">Jouer la main du jour</a>
                    </div>
                    <p className="hero-note">Gratuit, sans compte, rien ne quitte votre navigateur.</p>
                </div>

                <figure className="ecran" aria-label="Démonstration : une main analysée en direct">
                    <div className="ecran-haut">
                        <span>Table 1 · Flop</span>
                        <span>Pot {num(state.pot)} · À payer {num(state.call)}</span>
                    </div>
                    <div className="ecran-scene">
                        <Table state={state} size={86} boardSize={70} />
                    </div>
                    <div className="ecran-bas">
                        <Incrust result={state.result} />
                        <div className="ecran-actions">
                            <button type="button" className="btn btn-tv" onClick={deal}>Distribuer une autre main</button>
                            <span>Touchez une carte pour la changer.</span>
                        </div>
                    </div>
                </figure>
            </div>
        </section>
    );
}

/** Le bandeau défilant de la retransmission : des faits du calcul, pas des slogans */
function Ticker() {
    const facts = [
        `Tirage couleur au flop : 9 outs, ${pct(hitProbability(9, 47, 2))} d'ici la river`,
        `Quinte ouverte : 8 outs, ${pct(hitProbability(8, 47, 1))} au turn`,
        `Couleur + quinte ouverte : 15 outs, la règle du 4 surestime de ${num(Math.round((0.6 - hitProbability(15, 47, 2)) * 1000) / 10)} points`,
        `Quinte ventrale : 4 outs, ${pct(hitProbability(4, 46, 1))} à la river`,
        `Payer 100 dans un pot de 300 : il faut gagner 25 % du temps`,
        `Paire servie vers le brelan : 2 outs, ${pct(hitProbability(2, 47, 2))} d'ici la river`,
    ];
    return (
        <div className="ticker" role="region" aria-label="Les chiffres à connaître">
            <p className="ticker-tag">Les chiffres</p>
            <div className="ticker-piste">
                <ul className="ticker-defile">
                    {[...facts, ...facts].map((fact, i) => <li key={i} aria-hidden={i >= facts.length || undefined}>{fact}</li>)}
                </ul>
            </div>
        </div>
    );
}

/** Le tableau qui justifie le produit : la règle de tête contre le calcul exact, outs par outs */
function ExactVsRule() {
    const rows = [2, 4, 8, 9, 12, 15].map((outs) => {
        const exact = hitProbability(outs, 47, 2);
        const rule = Math.min(1, outs * 0.04);
        return { outs, exact, rule, gap: rule - exact };
    });
    const label = { 2: 'Paire servie vers le brelan', 4: 'Quinte ventrale', 8: 'Quinte ouverte', 9: 'Tirage couleur', 12: 'Couleur + paire', 15: 'Couleur + quinte ouverte' };

    return (
        <section className="bande" aria-labelledby="exact-titre">
            <div className="wrap bande-grille">
                <div>
                    <h2 id="exact-titre" className="display">Le chiffre exact, et celui de tête.</h2>
                    <p className="prose">
                        À table, on multiplie ses outs par 4 au flop et par 2 au turn. C'est rapide, et presque juste : jusqu'à 8 outs,
                        l'écart tient dans un point. Au-delà, la règle s'emballe : avec <strong>15 outs, elle annonce 60 %</strong> quand
                        la vraie probabilité est de 54,1 %. Tirage affiche les deux, côte à côte, à chaque main.
                    </p>
                </div>
                <table className="tableau-cotes">
                    <caption className="sr">Probabilité de toucher entre le flop et la river : calcul exact et règle du 4</caption>
                    <thead>
                        <tr><th scope="col">Outs</th><th scope="col">Tirage</th><th scope="col">Exact</th><th scope="col">Règle du 4</th><th scope="col">Écart</th></tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.outs} className={Math.abs(r.gap) > 0.02 ? 'ecart-fort' : ''}>
                                <th scope="row">{r.outs}</th>
                                <td className="tirage-nom">{label[r.outs] ?? ''}</td>
                                <td>
                                    <span className="valeur">{pct(r.exact)}</span>
                                    <span className="jauge" aria-hidden="true"><i style={{ width: `${r.exact * 100}%` }} /><b style={{ left: `${r.rule * 100}%` }} /></span>
                                </td>
                                <td>{pct(r.rule)}</td>
                                <td className="ecart">{r.gap >= 0 ? '+' : '−'}{num(Math.round(Math.abs(r.gap) * 1000) / 10)} pt</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/** Les cotes du pot, à régler soi-même : outs, pot, mise, verdict */
function PotOddsDemo() {
    const [outs, setOuts] = useState(9);
    const [pot, setPot] = useState(300);
    const [call, setCall] = useState(100);
    const probability = hitProbability(outs, 46, 1);
    const { required, ratio } = potOdds(pot, call);
    const verdict = decide(probability, required);

    return (
        <section className="section" aria-labelledby="cotes-titre">
            <div className="wrap cotes-grille">
                <div className="cotes-texte">
                    <h2 id="cotes-titre" className="display">Suivre ou coucher, en une ligne.</h2>
                    <p className="prose">
                        Payer {num(call)} pour un pot de {num(pot)}, c'est miser pour un pot final de {num(pot + call)} : il faut gagner
                        au moins <strong>{pct(required)}</strong> du temps. Avec {outs} outs au turn, vous touchez <strong>{pct(probability)}</strong> du temps.
                        Tirage fait cette comparaison à chaque main et vous dit pourquoi.
                    </p>
                </div>
                <div className="cotes-panneau">
                    <div className="cotes-champs">
                        <label className="champ">Outs
                            <input type="number" min="1" max="20" value={outs} onChange={(e) => setOuts(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
                        </label>
                        <label className="champ">Pot, mise comprise
                            <input type="number" min="1" step="10" value={pot} onChange={(e) => setPot(Math.max(1, Number(e.target.value) || 1))} />
                        </label>
                        <label className="champ">À payer
                            <input type="number" min="1" step="10" value={call} onChange={(e) => setCall(Math.max(1, Number(e.target.value) || 1))} />
                        </label>
                    </div>
                    <p className={`cotes-verdict ${verdict}`}>
                        <span>{verdict === 'suivre' ? 'Suivre' : 'Coucher'}</span>
                        <small>Cotes de {num(Math.round(ratio * 10) / 10)} contre 1 · vos chances {pct(probability)} · il en faut {pct(required)}</small>
                    </p>
                </div>
            </div>
        </section>
    );
}

function Training() {
    return (
        <section className="section" aria-labelledby="entrainement-titre">
            <div className="wrap entr-grille">
                <div className="entr-chrono" aria-hidden="true">
                    <span className="entr-temps">0:15</span>
                    <div className="entr-cartes">
                        <Carte card="Js" size={58} /><Carte card="Ts" size={58} />
                        <span className="entr-sep" />
                        <Carte card="9s" size={48} /><Carte card="4s" size={48} /><Carte card="Kd" size={48} />
                    </div>
                    <span className="entr-question">Pot 450 · à payer 150</span>
                </div>
                <div>
                    <h2 id="entrainement-titre" className="display">Dix mains, quinze secondes chacune.</h2>
                    <p className="prose">
                        Des situations tirées au hasard, un chrono, suivre ou coucher. Après chaque main, le compte des outs et la raison
                        du verdict. Votre record reste dans ce navigateur.
                    </p>
                    <a className="btn btn-tv" href="/entrainement/">Lancer l'entraînement</a>
                </div>
            </div>
        </section>
    );
}

function Daily() {
    const day = parisDate();
    const hand = dailyHand(day);
    const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date());

    return (
        <section className="bande bande-signal" aria-labelledby="jour-titre">
            <div className="wrap jour-grille">
                <div>
                    <h2 id="jour-titre" className="display">La main du {date}.</h2>
                    <p className="prose">
                        La même pour tout le monde aujourd'hui. Votre adversaire est à tapis : suivez ou couchez-vous, puis estimez vos chances.
                        Un score sur 100, à partager.
                    </p>
                    <a className="btn btn-tv" href="/jeu/">Jouer la main du jour</a>
                </div>
                <div className="jour-cartes" aria-label="Votre main et le flop du jour">
                    <div className="jour-main">{hand.hand.map((c) => <Carte key={c} card={c} size={96} />)}</div>
                    <div className="jour-board">{hand.board.map((c) => <Carte key={c} card={c} size={74} />)}</div>
                    <p className="jour-pot">Pot {num(hand.pot)} · tapis adverse à payer : {num(hand.call)}</p>
                </div>
            </div>
        </section>
    );
}

function Offer() {
    const included = [
        'Le calculateur d\'outs et de probabilités exactes',
        'La règle du 2 et du 4 à côté de chaque calcul',
        'Les cotes du pot et le verdict, expliqué',
        'L\'entraînement chronométré, avec votre record',
        'La main du jour, à partager',
        'Sans compte, sans publicité, sans collecte',
    ];
    return (
        <section className="section" aria-labelledby="offre-titre">
            <div className="wrap offre-grille">
                <h2 id="offre-titre" className="display">Une seule offre. Elle est gratuite.</h2>
                <div className="offre">
                    <p className="offre-nom">Tirage</p>
                    <p className="offre-prix"><span>0 €</span> pour toujours</p>
                    <ul className="offre-liste">
                        {included.map((item) => <li key={item}><Check />{item}</li>)}
                    </ul>
                    <a className="btn btn-signal" href="/calculateur/">Ouvrir le calculateur</a>
                </div>
            </div>
        </section>
    );
}

function Faq() {
    const items = [
        ['Qu\'est-ce qu\'un out ?', 'Une carte encore dans le paquet qui ferait de votre main une main bien meilleure : la couleur, la quinte, le brelan… Tirage ne compte que les cartes qui vous améliorent vous, pas celles qui améliorent le board pour tout le monde.'],
        ['Comment Tirage compte-t-il les outs ?', 'Pour chaque carte restante, il évalue votre meilleure main de cinq cartes avant et après. Un out fait monter la main d\'une catégorie, jusqu\'à deux paires au moins, grâce à vos cartes. Chaque carte n\'est comptée qu\'une fois, sous la meilleure main qu\'elle donne : le 10 de cœur d\'un tirage couleur + quinte compte en couleur, pas deux fois.'],
        ['Pourquoi le calcul exact diffère-t-il de la règle du 2 et du 4 ?', 'La règle multiplie les outs par un taux fixe ; le calcul exact énumère toutes les cartes à venir. La règle exagère d\'autant plus que vous avez d\'outs : au-delà de 8, comptez un peu moins que ce qu\'elle annonce.'],
        ['Le calcul tient-il compte des cartes de mon adversaire ?', 'Non : Tirage mesure vos chances de toucher votre tirage, comme on le fait à table. Il ne simule pas une fourchette de mains adverses.'],
        ['Que deviennent mes données ?', 'Rien ne quitte votre navigateur. Votre record d\'entraînement et votre série de mains du jour y sont gardés, et c\'est tout.'],
    ];
    return (
        <section className="section" aria-labelledby="faq-titre">
            <div className="wrap faq-grille">
                <h2 id="faq-titre" className="display">Questions de table.</h2>
                <div className="faq">
                    {items.map(([q, a]) => (
                        <details key={q}>
                            <summary>{q}</summary>
                            <p>{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Landing() {
    return (
        <>
            <SiteHeader page="accueil" />
            <main>
                <Hero />
                <Ticker />
                <ExactVsRule />
                <PotOddsDemo />
                <Training />
                <Daily />
                <Offer />
                <Faq />
            </main>
            <SiteFooter />
        </>
    );
}
