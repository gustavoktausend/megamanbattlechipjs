import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBattle, elementMultiplier, nextChip, useSlotIn, playRound, ROUND_LIMIT } from '../js/battle.js';
import { DECK_SIZE } from '../js/data/chips.js';

// RNG determinístico para testes (mulberry32)
function seededRng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fábricas de dados de teste
function chip(over = {}) {
  return { id: 't', name: 'Teste', kind: 'attack', element: 'neutro', power: 10, speed: 5, ...over };
}
function navi(over = {}) {
  return { id: 'tnavi', name: 'TestNavi', element: 'neutro', maxHp: 300, naviAttack: { name: 'Especial', power: 50 }, ...over };
}
function config(over = {}) {
  return {
    navi: navi(over.navi),
    deck: over.deck ?? Array.from({ length: DECK_SIZE }, () => chip()),
    slotIns: over.slotIns ?? [chip(), chip(), chip()],
  };
}
function makeBattle(p = {}, e = {}, rng = seededRng(42)) {
  return createBattle(config(p), config(e), rng);
}

test('createBattle inicializa HP, ponteiros e sem vencedor', () => {
  const b = makeBattle({ navi: { maxHp: 400 } });
  assert.equal(b.sides.player.hp, 400);
  assert.equal(b.sides.enemy.hp, 300);
  assert.equal(b.sides.player.deckIndex, 0);
  assert.equal(b.round, 0);
  assert.equal(b.winner, null);
});

test('createBattle rejeita deck/slot-in de tamanho errado e config sem navi', () => {
  assert.throws(() => createBattle(config({ deck: [chip()] }), config(), seededRng(1)));
  assert.throws(() => createBattle(config({ slotIns: [chip()] }), config(), seededRng(1)));
  assert.throws(() => createBattle({ deck: [], slotIns: [] }, config(), seededRng(1)));
});

test('ciclo de fraquezas elementais', () => {
  assert.equal(elementMultiplier('fogo', 'madeira'), 2);
  assert.equal(elementMultiplier('madeira', 'eletrico'), 2);
  assert.equal(elementMultiplier('eletrico', 'agua'), 2);
  assert.equal(elementMultiplier('agua', 'fogo'), 2);
  assert.equal(elementMultiplier('madeira', 'fogo'), 1); // inverso não dobra
  assert.equal(elementMultiplier('neutro', 'fogo'), 1);
  assert.equal(elementMultiplier('fogo', 'neutro'), 1);
});

test('nextChip aponta o chip do deck, depois Navi Attack, e slot-in pendente tem prioridade', () => {
  const b = makeBattle();
  assert.equal(nextChip(b, 'player').source, 'deck');
  b.sides.player.deckIndex = DECK_SIZE;
  const na = nextChip(b, 'player');
  assert.equal(na.source, 'navi');
  assert.equal(na.chip.power, 50);
  assert.equal(na.chip.element, 'neutro');
  assert.ok(useSlotIn(b, 'player', 1));
  assert.equal(nextChip(b, 'player').source, 'slotin');
});

test('useSlotIn recusa índice inválido, repetição e segundo pendente', () => {
  const b = makeBattle();
  assert.equal(useSlotIn(b, 'player', 5), false);
  assert.ok(useSlotIn(b, 'player', 0));
  assert.equal(useSlotIn(b, 'player', 1), false); // já há um pendente
});
