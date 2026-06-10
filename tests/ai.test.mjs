import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickOpponent, buildConfig, aiChooseSlotIn } from '../js/ai.js';
import { createBattle } from '../js/battle.js';
import { AI_DECKS } from '../js/data/navis.js';
import { DECK_SIZE, SLOTIN_SIZE } from '../js/data/chips.js';

function fixedRng(v) { return () => v; }

test('buildConfig resolve ids em objetos', () => {
  const cfg = buildConfig(AI_DECKS[0]);
  assert.ok(cfg.navi.maxHp > 0);
  assert.equal(cfg.deck.length, DECK_SIZE);
  assert.equal(cfg.slotIns.length, SLOTIN_SIZE);
  assert.ok(cfg.deck.every(c => c && c.kind));
});

test('pickOpponent sorteia um template e devolve config válida', () => {
  const opp = pickOpponent(fixedRng(0));
  assert.equal(opp.template, AI_DECKS[0]);
  assert.equal(opp.config.navi.id, AI_DECKS[0].naviId);
  const last = pickOpponent(fixedRng(0.999));
  assert.equal(last.template, AI_DECKS[AI_DECKS.length - 1]);
});

// Batalha de teste: inimigo tem slot-ins [cura, ataque forte, ataque fraco]
function aiBattle() {
  const mk = over => ({ id: 'x', name: 'X', kind: 'attack', element: 'neutro', power: 10, speed: 5, ...over });
  const cfg = side => ({
    navi: { id: side, name: side, element: 'neutro', maxHp: 100, naviAttack: { name: 'NA', power: 10 } },
    deck: Array.from({ length: DECK_SIZE }, () => mk()),
    slotIns: side === 'e'
      ? [mk({ kind: 'heal', power: 50 }), mk({ power: 90 }), mk({ power: 20 })]
      : [mk(), mk(), mk()],
  });
  return createBattle(cfg('p'), cfg('e'), fixedRng(0.5));
}

test('IA cura quando está com HP baixo', () => {
  const b = aiBattle();
  b.sides.enemy.hp = 20; // 20% de 100
  assert.equal(aiChooseSlotIn(b), 0);
});

test('IA usa o ataque mais forte quando o jogador está com HP baixo', () => {
  const b = aiBattle();
  b.sides.player.hp = 20;
  assert.equal(aiChooseSlotIn(b), 1); // power 90 > 20
});

test('IA não age sem gatilho, com slot-in já pendente ou já usado', () => {
  const b = aiBattle();
  assert.equal(aiChooseSlotIn(b), null);
  b.sides.enemy.hp = 20;
  b.sides.enemy.slotInUsed[0] = true; // cura gasta
  assert.equal(aiChooseSlotIn(b), null); // só cura nesse gatilho
  b.sides.enemy.slotInUsed[0] = false;
  b.sides.enemy.pendingSlotIn = 2;
  assert.equal(aiChooseSlotIn(b), null);
});
