import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHIPS, CHIP_BY_ID, DECK_SIZE, SLOTIN_SIZE, MAX_COPIES } from '../js/data/chips.js';
import { NAVIS, NAVI_BY_ID, AI_DECKS } from '../js/data/navis.js';
import { NAVI_SPRITE_MAP, NAVI_PALETTES } from '../js/sprites.js';

const KINDS = ['attack', 'defense', 'heal'];
const ELEMENTS = ['neutro', 'fogo', 'agua', 'eletrico', 'madeira'];

test('constantes do deck', () => {
  assert.equal(DECK_SIZE, 12);
  assert.equal(SLOTIN_SIZE, 3);
  assert.equal(MAX_COPIES, 3);
});

test('há 30 chips com ids únicos', () => {
  assert.equal(CHIPS.length, 30);
  assert.equal(new Set(CHIPS.map(c => c.id)).size, 30);
});

test('todo chip tem campos válidos', () => {
  for (const c of CHIPS) {
    assert.ok(c.id && c.name, `chip sem id/nome: ${JSON.stringify(c)}`);
    assert.ok(KINDS.includes(c.kind), `kind inválido em ${c.id}`);
    assert.ok(ELEMENTS.includes(c.element), `elemento inválido em ${c.id}`);
    assert.ok(Number.isInteger(c.power) && c.power > 0, `power inválido em ${c.id}`);
    assert.ok(Number.isInteger(c.speed) && c.speed > 0, `speed inválido em ${c.id}`);
  }
});

test('CHIP_BY_ID indexa todos os chips', () => {
  for (const c of CHIPS) assert.equal(CHIP_BY_ID[c.id], c);
});

test('há 4 Navis com campos válidos', () => {
  assert.equal(NAVIS.length, 4);
  assert.equal(new Set(NAVIS.map(n => n.id)).size, 4);
  for (const n of NAVIS) {
    assert.ok(n.id && n.name, `navi sem id/nome`);
    assert.ok(ELEMENTS.includes(n.element), `elemento inválido em ${n.id}`);
    assert.ok(Number.isInteger(n.maxHp) && n.maxHp > 0, `maxHp inválido em ${n.id}`);
    assert.ok(n.naviAttack && n.naviAttack.name, `naviAttack sem nome em ${n.id}`);
    assert.ok(Number.isInteger(n.naviAttack.power) && n.naviAttack.power > 0, `naviAttack.power inválido em ${n.id}`);
    assert.equal(NAVI_BY_ID[n.id], n);
  }
});

test('decks da IA são válidos', () => {
  assert.ok(AI_DECKS.length >= 6, 'pelo menos 6 templates');
  for (const t of AI_DECKS) {
    assert.ok(NAVI_BY_ID[t.naviId], `naviId desconhecido: ${t.naviId}`);
    assert.ok([1, 2, 3].includes(t.difficulty), `dificuldade inválida em ${t.naviId}`);
    assert.equal(t.deck.length, DECK_SIZE, 'deck de 12');
    assert.equal(t.slotIns.length, SLOTIN_SIZE, 'slot-in de 3');
    const counts = {};
    for (const id of [...t.deck, ...t.slotIns]) {
      assert.ok(CHIP_BY_ID[id], `chip desconhecido: ${id}`);
      counts[id] = (counts[id] || 0) + 1;
      assert.ok(counts[id] <= MAX_COPIES, `mais de ${MAX_COPIES} cópias de ${id}`);
    }
  }
});

test('sprite é 16x16 e todas as cores existem nas paletas', () => {
  assert.equal(NAVI_SPRITE_MAP.length, 16);
  const chars = new Set();
  for (const row of NAVI_SPRITE_MAP) {
    assert.equal(row.length, 16, `linha com largura errada: "${row}"`);
    for (const ch of row) if (ch !== '.') chars.add(ch);
  }
  for (const n of NAVIS) {
    const pal = NAVI_PALETTES[n.id];
    assert.ok(pal, `paleta faltando para ${n.id}`);
    for (const ch of chars) assert.ok(pal[ch], `cor '${ch}' faltando na paleta de ${n.id}`);
  }
});
