import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHIPS, CHIP_BY_ID, DECK_SIZE, SLOTIN_SIZE, MAX_COPIES } from '../js/data/chips.js';

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
