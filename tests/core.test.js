import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DECK } from '../src/core/cards.js';
import { CATEGORY, compare, evaluate } from '../src/core/evaluator.js';
import { hitProbability, potOdds, decide, ruleOfTwoAndFour } from '../src/core/odds.js';
import { countOuts } from '../src/core/outs.js';
import { queryToSpot, spotToQuery } from '../src/core/lien.js';
import { dailyHand, dailyScore, parisDate, seeded, situation } from '../src/core/situations.js';

test('le paquet compte 52 cartes différentes', () => {
    assert.equal(new Set(DECK).size, 52);
});

test("l'évaluateur reconnaît chaque catégorie", () => {
    const cat = (cards) => evaluate(cards.split(' '))[0];
    assert.equal(cat('As Kd 7h 4c 2s'), CATEGORY.HIGH_CARD);
    assert.equal(cat('As Ad 7h 4c 2s'), CATEGORY.PAIR);
    assert.equal(cat('As Ad 7h 7c 2s'), CATEGORY.TWO_PAIR);
    assert.equal(cat('As Ad Ah 7c 2s'), CATEGORY.TRIPS);
    assert.equal(cat('As 2d 3h 4c 5s'), CATEGORY.STRAIGHT, 'la roue, as compté pour 1');
    assert.equal(cat('Ts Jd Qh Kc As'), CATEGORY.STRAIGHT);
    assert.equal(cat('2h 7h 9h Jh Kh'), CATEGORY.FLUSH);
    assert.equal(cat('As Ad Ah 7c 7s'), CATEGORY.FULL_HOUSE);
    assert.equal(cat('As Ad Ah Ac 7s'), CATEGORY.QUADS);
    assert.equal(cat('5h 6h 7h 8h 9h'), CATEGORY.STRAIGHT_FLUSH);
    assert.equal(cat('5h 6h 7h 8h 9h Kd Kc'), CATEGORY.STRAIGHT_FLUSH, 'meilleure main parmi 7 cartes');
});

test('les départages comparent la bonne main', () => {
    const hand = (cards) => evaluate(cards.split(' '));
    assert.ok(compare(hand('As Ad 9h 4c 2s'), hand('Ks Kd Qh Jc 9s')) > 0, 'paire d\'as bat paire de rois');
    assert.ok(compare(hand('As Ad 9h 4c 2s'), hand('Ah Ac 8h 4d 2c')) > 0, 'au kicker');
    assert.equal(compare(hand('As Kd 9h 4c 2s'), hand('Ah Kc 9d 4s 2c')), 0);
});

test('un tirage couleur + quinte ouverte vaut 15 outs', () => {
    const outs = countOuts(['8h', '9h'], ['7h', '6c', '2h']);
    assert.equal(outs.cards.length, 15);
    assert.deepEqual(outs.byType.map((t) => [t.name, t.cards.length]), [['Couleur', 9], ['Quinte', 6]], 'les 5 et 10 de cœur comptés une seule fois, en couleur');
});

test('les outs classiques', () => {
    const count = (hand, board) => countOuts(hand.split(' '), board.split(' ')).cards.length;
    assert.equal(count('Ah Kh', '7h 2h 9c'), 9, 'tirage couleur');
    assert.equal(count('8c 9d', '7h 6s 2c'), 8, 'quinte ouverte');
    assert.equal(count('8c 9d', 'Js 7h 2c'), 4, 'quinte ventrale');
    assert.equal(count('5s 5d', 'Kh 7c 2s'), 2, 'paire servie vers le brelan');
    assert.equal(count('As Kd', 'Kh 7c 2s'), 5, 'top paire : 3 as pour deux paires, 2 rois pour le brelan');
    assert.equal(count('5s 5d', '5h Kc 2s'), 7, 'brelan servi vers le full ou le carré');
});

test("un board qui double n'est pas un out pour le joueur", () => {
    const outs = countOuts(['5s', '5d'], ['Kh', '7c', '2s']);
    assert.ok(!outs.cards.includes('Kd'), 'le roi double le board : deux paires, mais pas grâce au joueur');
});

test('9 outs au flop : 35 % à la river, 19,6 % au turn', () => {
    assert.equal(Math.round(hitProbability(9, 47, 2) * 1000) / 10, 35);
    assert.equal(Math.round(hitProbability(9, 47, 1) * 1000) / 10, 19.1);
    assert.equal(Math.round(hitProbability(9, 46, 1) * 1000) / 10, 19.6);
    assert.equal(ruleOfTwoAndFour(9, 2), 36);
    assert.equal(ruleOfTwoAndFour(9, 1), 18);
});

test('les cotes du pot et la décision', () => {
    const { required, ratio } = potOdds(300, 100);
    assert.equal(required, 0.25, '100 à payer pour un pot final de 400');
    assert.equal(ratio, 3);
    assert.equal(decide(0.35, required), 'suivre');
    assert.equal(decide(0.2, required), 'coucher');
});

test('les situations ont toujours un vrai tirage', () => {
    const random = seeded(42);
    for (let i = 0; i < 30; i += 1) {
        const s = situation(random);
        assert.ok(s.outs.cards.length >= 4 && s.outs.cards.length <= 15);
        assert.equal(new Set([...s.hand, ...s.board]).size, s.hand.length + s.board.length);
        assert.ok(s.call > 0 && s.pot > s.call);
    }
});

test('les deux réponses sortent à peu près autant', () => {
    const random = seeded(7);
    const follow = Array.from({ length: 200 }, () => situation(random)).filter((s) => s.answer === 'suivre').length;
    assert.ok(follow > 70 && follow < 130, `${follow} « suivre » sur 200`);
});

test('la main du jour est la même pour tout le monde le même jour, et change le lendemain', () => {
    assert.deepEqual(dailyHand('2026-10-23'), dailyHand('2026-10-23'));
    assert.notDeepEqual(dailyHand('2026-10-23').hand, dailyHand('2026-10-24').hand);
    assert.equal(parisDate(new Date('2026-10-23T22:30:00Z')), '2026-10-24', 'minuit à Paris, pas à Londres');
});

test('le score de la main du jour', () => {
    const hand = { answer: 'suivre', probability: 0.35 };
    assert.equal(dailyScore(hand, 'suivre', 35).total, 100);
    assert.equal(dailyScore(hand, 'coucher', 35).total, 50);
    assert.equal(dailyScore(hand, 'suivre', 45).total, 75, '10 points d\'écart : 25 de perdus');
    assert.equal(dailyScore(hand, 'suivre', 95).estimatePoints, 0, 'jamais négatif');
});

test("une main passe par l'adresse et revient intacte", () => {
    const spot = { hand: ['8h', '9h'], board: ['7h', '6c', '2h'], pot: 400, call: 400, cardsToCome: 2 };
    assert.equal(spotToQuery(spot), 'main=8h9h&board=7h6c2h&pot=400&mise=400&tapis=1');
    assert.deepEqual(queryToSpot(spotToQuery(spot)), spot);
    assert.equal(queryToSpot('?main=8h9h&board=7h6c2h8d&pot=1&mise=1&tapis=1').cardsToCome, 1, 'au turn, une seule carte à venir');
});

test('une adresse invalide ne charge rien', () => {
    assert.equal(queryToSpot(''), null);
    assert.equal(queryToSpot('main=8h8h&board=7h6c2h'), null, 'carte en double');
    assert.equal(queryToSpot('main=8h9x&board=7h6c2h'), null, 'carte inconnue');
    assert.equal(queryToSpot('main=8h9h&board=7h6c'), null, 'flop incomplet');
    assert.equal(queryToSpot('main=8h9h&board=7h6c2h&pot=-5'), null, 'pot négatif');
});

test('un défi rejoue la même série de mains', () => {
    const series = (code) => { const r = seeded(`serie|outs|${code}`); return Array.from({ length: 10 }, () => situation(r).hand.join()); };
    assert.deepEqual(series('k3f9a2'), series('k3f9a2'));
    assert.notDeepEqual(series('k3f9a2'), series('zz12ab'));
});

test("l'équité contre une main connue", async () => {
    const { equityVs } = await import('../src/core/equity.js');
    const r = equityVs(['8h', '9h'], ['Ad', 'Ac'], ['7h', '6c', '2h']);
    assert.equal(r.runouts, 990);
    assert.equal(Math.round(r.equity * 1000) / 10, 56.3);
});

test('les cotes implicites et leurs exercices', async () => {
    const { impliedNeeded } = await import('../src/core/odds.js');
    const { impliedSituation } = await import('../src/core/situations.js');
    assert.equal(Math.round(impliedNeeded(9 / 46, 300, 100)), 111);
    const random = seeded(3);
    for (let i = 0; i < 20; i += 1) {
        const s = impliedSituation(random);
        assert.equal(s.answer, s.later >= s.needed ? 'suivre' : 'coucher');
    }
});

test('trois mains par jour, la première inchangée', async () => {
    const { dailyHands } = await import('../src/core/situations.js');
    const hands = dailyHands('2026-10-23');
    assert.deepEqual(hands[0], dailyHand('2026-10-23'));
    assert.equal(hands[1].board.length, 4);
    assert.equal(hands[2].cardsToCome, 1);
});

test('le résumé des progrès trouve le point faible', async () => {
    const { summarize } = await import('../src/core/progres.js');
    const h = [...Array(5)].map((_, i) => ({ k: 'Quinte', ok: i === 0, g: 6 })).concat([...Array(5)].map(() => ({ k: 'Couleur', ok: true })));
    const s = summarize(h);
    assert.equal(s.weakest.kind, 'Quinte');
    assert.equal(s.bias, 6);
    assert.equal(s.rate, 0.6);
});
