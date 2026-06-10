import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sideNamer } from '../js/ui.js';

test('nomes normais ficam sem sufixo', () => {
  const name = sideNamer('BlazeMan', 'SylvaKid');
  assert.equal(name('player'), 'BlazeMan');
  assert.equal(name('enemy'), 'SylvaKid');
});

test('partida-espelho distingue você e rival', () => {
  const name = sideNamer('SylvaKid', 'SylvaKid');
  assert.equal(name('player'), 'SylvaKid (você)');
  assert.equal(name('enemy'), 'SylvaKid (rival)');
});
