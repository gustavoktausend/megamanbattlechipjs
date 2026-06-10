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

test('chip mais rápido age primeiro', () => {
  const b = makeBattle(
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ name: 'Rápido', speed: 10 })) },
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ name: 'Lento', speed: 1 })) },
  );
  const events = playRound(b);
  const uses = events.filter(e => e.type === 'chip');
  assert.equal(uses[0].side, 'player');
  assert.equal(uses[1].side, 'enemy');
});

test('ataque causa dano com multiplicador elemental', () => {
  const b = makeBattle(
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ element: 'fogo', power: 50, speed: 10 })) },
    { navi: { element: 'madeira', maxHp: 300 }, deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'heal', power: 1, speed: 1 })) },
  );
  const events = playRound(b);
  const dmg = events.find(e => e.type === 'damage');
  assert.equal(dmg.amount, 100); // 50 x2 (fogo > madeira)
  assert.equal(dmg.super, true);
  assert.equal(b.sides.enemy.hp, 300 - 100 + 1); // sofreu 100, curou 1
});

test('defesa bloqueia dano no mesmo round e expira', () => {
  const b = makeBattle(
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ power: 80, speed: 5 })) },
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'defense', power: 100, speed: 12 })) },
  );
  playRound(b); // defesa (vel 12) age antes do ataque de 80: bloqueia tudo
  assert.equal(b.sides.enemy.hp, 300);
  // round seguinte: nova defesa reaplicada, continua bloqueando
  playRound(b);
  assert.equal(b.sides.enemy.hp, 300);
});

test('defesa parcial deixa passar o excedente', () => {
  const b = makeBattle(
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ power: 80, speed: 5 })) },
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'defense', power: 30, speed: 12 })) },
  );
  playRound(b);
  assert.equal(b.sides.enemy.hp, 300 - 50); // 80 - 30 bloqueados
});

test('cura não passa do HP máximo', () => {
  const b = makeBattle(
    { navi: { maxHp: 300 }, deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'heal', power: 999, speed: 10 })) },
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ power: 10, speed: 1 })) },
  );
  playRound(b); // toma 10 depois de curar 0 (já cheio)
  assert.equal(b.sides.player.hp, 290);
  playRound(b); // cura 10 (volta ao teto), toma 10
  assert.equal(b.sides.player.hp, 290);
});

test('deck esgota, dispara Navi Attack e recarrega', () => {
  const b = makeBattle(
    { navi: { naviAttack: { name: 'Especial', power: 70 } }, deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'heal', power: 1, speed: 10 })) },
    { navi: { maxHp: 9999 }, deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'heal', power: 1, speed: 1 })) },
  );
  for (let i = 0; i < DECK_SIZE; i++) playRound(b);
  assert.equal(nextChip(b, 'player').source, 'navi');
  const events = playRound(b); // round 13: os DOIS lados disparam o Navi Attack
  const na = events.find(e => e.type === 'naviAttack' && e.side === 'player');
  assert.ok(na);
  assert.equal(b.sides.enemy.hp, 9999 - 70); // só o Navi Attack do jogador feriu o inimigo
  assert.equal(b.sides.player.deckIndex, 0); // recarregou
});

test('slot-in substitui o próximo chip, é consumido e não avança o deck', () => {
  const b = makeBattle(
    { slotIns: [chip({ name: 'Reserva', power: 99, speed: 10 }), chip(), chip()] },
    { navi: { maxHp: 9999 }, deck: Array.from({ length: DECK_SIZE }, () => chip({ kind: 'heal', power: 1, speed: 1 })) },
  );
  useSlotIn(b, 'player', 0);
  const events = playRound(b);
  const use = events.find(e => e.type === 'chip' && e.side === 'player');
  assert.equal(use.chip.name, 'Reserva');
  assert.equal(use.source, 'slotin');
  assert.equal(b.sides.player.deckIndex, 0); // deck não andou
  assert.equal(b.sides.player.slotInUsed[0], true);
  assert.equal(b.sides.player.pendingSlotIn, null);
  assert.equal(useSlotIn(b, 'player', 0), false); // não reutiliza
});

test('batalha termina quando um lado zera; playRound depois disso lança erro', () => {
  const b = makeBattle(
    { deck: Array.from({ length: DECK_SIZE }, () => chip({ power: 9999, speed: 10 })) },
    {},
  );
  const events = playRound(b);
  assert.equal(b.winner, 'player');
  assert.equal(b.sides.enemy.hp, 0);
  const end = events.find(e => e.type === 'end');
  assert.equal(end.winner, 'player');
  // o perdedor não age depois de morrer
  assert.equal(events.filter(e => e.type === 'chip' && e.side === 'enemy').length, 0);
  assert.throws(() => playRound(b));
});

test('limite de rounds decide por % de HP; empate é derrota do jogador', () => {
  // Lados simétricos (só curas + Navi Attack de 1): a cura repõe o dano,
  // então no round 100 os dois têm o mesmo % de HP → empate → enemy vence.
  const heals = () => Array.from({ length: DECK_SIZE }, () => chip({ kind: 'heal', power: 1, speed: 5 }));
  const slotHeals = () => [chip({ kind: 'heal', power: 1 }), chip({ kind: 'heal', power: 1 }), chip({ kind: 'heal', power: 1 })];
  const b = makeBattle(
    { navi: { maxHp: 300, naviAttack: { name: 'X', power: 1 } }, deck: heals(), slotIns: slotHeals() },
    { navi: { maxHp: 300, naviAttack: { name: 'X', power: 1 } }, deck: heals(), slotIns: slotHeals() },
  );
  let last = [];
  while (b.winner === null) last = playRound(b);
  assert.equal(b.round, ROUND_LIMIT);
  const end = last.find(e => e.type === 'end');
  assert.equal(end.byLimit, true);
  assert.equal(b.winner, 'enemy');
});
