# Chip Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clone de Megaman Battle Chip Challenge (GBA) — batalha rápida de decks de chips com auto-batalha por turnos — em HTML/CSS/JS puro, hospedável em GitHub Pages.

**Architecture:** Site estático sem build com módulos ES nativos. Motor de batalha (`js/battle.js`) é lógica pura sem DOM, testada em Node; a UI (`js/ui.js` + `js/main.js`) consome eventos do motor para animar. Dados (chips/Navis) são módulos de dados puros. Sprites são mapas de pixels desenhados em canvas (zero imagens).

**Tech Stack:** HTML5, CSS3, JavaScript ES2022 (módulos ES), Node 18+ apenas para testes (`node --test`), fonte Press Start 2P via Google Fonts.

**Spec:** `docs/superpowers/specs/2026-06-10-chip-challenge-design.md`

**Estrutura de arquivos final:**

```
index.html           — contêineres das 4 telas
css/style.css        — tema GBA
js/main.js           — boot + roteamento de telas
js/data/chips.js     — 30 chips + constantes (dados puros)
js/data/navis.js     — 4 Navis + 6 decks template da IA (dados puros)
js/battle.js         — motor de batalha puro (sem DOM)
js/ai.js             — sorteio de oponente + decisão de slot-in da IA
js/sprites.js        — pixel art em canvas
js/ui.js             — renderização das 4 telas
tests/data.test.mjs  — validação dos dados
tests/battle.test.mjs— motor de batalha
tests/ai.test.mjs    — IA
README.md            — instruções de uso e deploy
```

**Convenções do motor:** lados são `'player'` e `'enemy'`. Tipos de chip (`kind`): `'attack'`, `'defense'`, `'heal'`. Elementos: `'neutro'`, `'fogo'`, `'agua'`, `'eletrico'`, `'madeira'`. Fraquezas (2x dano): fogo>madeira, madeira>eletrico, eletrico>agua, agua>fogo. Chip de defesa bloqueia até `power` de dano no round em que age. Quando `deckIndex === 12`, o próximo a agir é o Navi Attack e depois o deck recarrega (`deckIndex = 0`).

---

### Task 1: Esqueleto do projeto (HTML + CSS + boot)

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/main.js` (placeholder, substituído na Task 8)

- [ ] **Step 1: Criar `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chip Challenge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <main id="game">
    <section id="screen-title" class="screen"></section>
    <section id="screen-builder" class="screen hidden"></section>
    <section id="screen-battle" class="screen hidden"></section>
    <section id="screen-result" class="screen hidden"></section>
  </main>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Criar `css/style.css`**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #10142e;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  line-height: 1.6;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
}

canvas { image-rendering: pixelated; }

#game { width: 100%; max-width: 760px; }

.screen {
  background: #20285c;
  border: 4px solid #fff;
  border-radius: 8px;
  padding: 16px;
  min-height: 520px;
  box-shadow: 0 0 0 4px #10142e, 0 6px 0 4px #000;
}

.hidden { display: none; }

h1 { font-size: 24px; text-shadow: 3px 3px 0 #000; margin-bottom: 16px; }
h2 { font-size: 14px; text-shadow: 2px 2px 0 #000; margin-bottom: 12px; }

button {
  font-family: inherit;
  font-size: 10px;
  background: #3050a0;
  color: #fff;
  border: 2px solid #fff;
  padding: 8px 10px;
  cursor: pointer;
}
button:hover:not(:disabled) { background: #4668c8; }
button:disabled { opacity: 0.4; cursor: default; }
button.big { font-size: 14px; padding: 14px 24px; }
button.active { background: #e8a020; border-color: #ffe080; }

/* ---- Título ---- */
.title-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 480px;
  text-align: center;
}
.subtitle { color: #9fb0e8; font-size: 8px; }

/* ---- Montagem de deck ---- */
.navi-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.navi-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  font-size: 8px;
}
.navi-card.selected { background: #e8a020; border-color: #ffe080; }

.target-row { display: flex; gap: 8px; margin-bottom: 12px; }

.builder-cols { display: flex; gap: 12px; align-items: flex-start; }
.library {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 6px;
}
.loadout { width: 240px; flex-shrink: 0; }
.loadout h3 { font-size: 9px; margin: 8px 0 4px; color: #9fb0e8; }
.slot-list { display: flex; flex-direction: column; gap: 4px; }
.slot-empty {
  border: 2px dashed #4a5a9a;
  color: #4a5a9a;
  padding: 6px;
  text-align: center;
  font-size: 8px;
}

.chip {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-size: 8px;
  padding: 6px;
  border-width: 2px;
  border-style: solid;
  text-align: left;
}
.chip-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chip-power { color: #ffe080; }

.el-neutro   { border-color: #c8d0e8; }
.el-fogo     { border-color: #ff6b3d; }
.el-agua     { border-color: #4db8ff; }
.el-eletrico { border-color: #ffd93d; }
.el-madeira  { border-color: #6bcb4f; }

.builder-actions { display: flex; gap: 8px; margin-top: 12px; }

/* ---- Batalha ---- */
.battle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.arena { display: flex; justify-content: space-around; align-items: flex-end; margin-bottom: 12px; }
.fighter { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 220px; }
.fighter.hit { animation: shake 0.3s; }
@keyframes shake {
  0%, 100% { transform: translateX(0); filter: none; }
  25% { transform: translateX(-6px); filter: brightness(3); }
  75% { transform: translateX(6px); filter: brightness(3); }
}
.fighter-name { font-size: 9px; }
.hp-bar { width: 100%; height: 12px; border: 2px solid #fff; background: #101430; }
.hp-fill { height: 100%; background: #3fd44f; transition: width 0.3s; }
.hp-fill.low { background: #e84118; }
.hp-text { font-size: 8px; color: #9fb0e8; }

.queues { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.queue { flex: 1; }
.queue h3 { font-size: 8px; color: #9fb0e8; margin-bottom: 4px; }
.queue-chips { display: flex; flex-direction: column; gap: 4px; }
.queue-chip { font-size: 8px; padding: 4px 6px; border: 2px solid #c8d0e8; }
.queue-chip.special { border-color: #ffe080; color: #ffe080; }

.slotin-bar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
.slotin-bar h3 { font-size: 8px; color: #9fb0e8; }

.battle-log {
  background: #101430;
  border: 2px solid #fff;
  height: 110px;
  overflow-y: auto;
  padding: 8px;
  font-size: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ---- Resultado ---- */
.result-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 480px;
  text-align: center;
}
.result-box .win { color: #3fd44f; }
.result-box .lose { color: #e84118; }
.result-stats { font-size: 9px; color: #9fb0e8; }
.result-actions { display: flex; gap: 12px; }

@media (max-width: 640px) {
  .builder-cols { flex-direction: column; }
  .loadout { width: 100%; }
}
```

- [ ] **Step 3: Criar `js/main.js` placeholder**

```js
// Placeholder — substituído quando as telas existirem (Task 8).
document.getElementById('screen-title').textContent = 'CHIP CHALLENGE — em construção';
```

- [ ] **Step 4: Verificar no navegador**

Run: `npx -y http-server -p 8080 -c-1` (deixar rodando em background) e abrir `http://localhost:8080`.
Expected: caixa azul estilo GBA com o texto "CHIP CHALLENGE — em construção". Sem erros no console.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: esqueleto do projeto (HTML, CSS tema GBA, boot)"
```

---

### Task 2: Dados dos chips

**Files:**
- Create: `js/data/chips.js`
- Test: `tests/data.test.mjs`

- [ ] **Step 1: Escrever os testes (falhando)** — criar `tests/data.test.mjs`:

```js
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
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module ... js/data/chips.js`

- [ ] **Step 3: Criar `js/data/chips.js`**

```js
// Biblioteca de chips de batalha. Dados puros, sem lógica.
// kind: 'attack' (power = dano) | 'defense' (power = dano bloqueado no round) | 'heal' (power = HP curado)
// speed: maior age primeiro no round.

export const DECK_SIZE = 12;
export const SLOTIN_SIZE = 3;
export const MAX_COPIES = 3;

export const CHIPS = [
  { id: 'cannon',     name: 'Canhão',       kind: 'attack',  element: 'neutro',   power: 40,  speed: 8 },
  { id: 'hicannon',   name: 'CanhãoAlto',   kind: 'attack',  element: 'neutro',   power: 80,  speed: 6 },
  { id: 'megacannon', name: 'MegaCanhão',   kind: 'attack',  element: 'neutro',   power: 120, speed: 4 },
  { id: 'sword',      name: 'Espada',       kind: 'attack',  element: 'neutro',   power: 60,  speed: 9 },
  { id: 'widesword',  name: 'EspadaLarga',  kind: 'attack',  element: 'neutro',   power: 90,  speed: 7 },
  { id: 'shotgun',    name: 'Escopeta',     kind: 'attack',  element: 'neutro',   power: 50,  speed: 7 },
  { id: 'vulcan',     name: 'Vulcan',       kind: 'attack',  element: 'neutro',   power: 30,  speed: 10 },
  { id: 'airshot',    name: 'TiroDeAr',     kind: 'attack',  element: 'neutro',   power: 35,  speed: 11 },
  { id: 'dashattack', name: 'Investida',    kind: 'attack',  element: 'neutro',   power: 70,  speed: 9 },
  { id: 'gutspunch',  name: 'SocoForte',    kind: 'attack',  element: 'neutro',   power: 75,  speed: 5 },
  { id: 'minibomb',   name: 'MiniBomba',    kind: 'attack',  element: 'neutro',   power: 55,  speed: 6 },
  { id: 'bigbomb',    name: 'BombaGrande',  kind: 'attack',  element: 'neutro',   power: 100, speed: 3 },
  { id: 'heatshot',   name: 'TiroFogo',     kind: 'attack',  element: 'fogo',     power: 50,  speed: 7 },
  { id: 'flamesword', name: 'EspadaFlama',  kind: 'attack',  element: 'fogo',     power: 85,  speed: 6 },
  { id: 'fireburst',  name: 'Labareda',     kind: 'attack',  element: 'fogo',     power: 110, speed: 4 },
  { id: 'bubbler',    name: 'Bolha',        kind: 'attack',  element: 'agua',     power: 50,  speed: 7 },
  { id: 'aquatower',  name: 'TorreÁgua',    kind: 'attack',  element: 'agua',     power: 85,  speed: 5 },
  { id: 'tsunami',    name: 'Tsunami',      kind: 'attack',  element: 'agua',     power: 110, speed: 3 },
  { id: 'zapring',    name: 'AnelChoque',   kind: 'attack',  element: 'eletrico', power: 50,  speed: 8 },
  { id: 'thunder',    name: 'Trovão',       kind: 'attack',  element: 'eletrico', power: 80,  speed: 6 },
  { id: 'lightning',  name: 'Relâmpago',    kind: 'attack',  element: 'eletrico', power: 110, speed: 4 },
  { id: 'boomerang',  name: 'Bumerangue',   kind: 'attack',  element: 'madeira',  power: 55,  speed: 8 },
  { id: 'woodtower',  name: 'TorreMadeira', kind: 'attack',  element: 'madeira',  power: 85,  speed: 5 },
  { id: 'forestbomb', name: 'BombaVerde',   kind: 'attack',  element: 'madeira',  power: 110, speed: 4 },
  { id: 'guard',      name: 'Guarda',       kind: 'defense', element: 'neutro',   power: 60,  speed: 12 },
  { id: 'barrier',    name: 'Barreira',     kind: 'defense', element: 'neutro',   power: 100, speed: 12 },
  { id: 'aura',       name: 'Aura',         kind: 'defense', element: 'neutro',   power: 200, speed: 11 },
  { id: 'recover30',  name: 'Cura30',       kind: 'heal',    element: 'neutro',   power: 30,  speed: 10 },
  { id: 'recover80',  name: 'Cura80',       kind: 'heal',    element: 'neutro',   power: 80,  speed: 9 },
  { id: 'recover150', name: 'Cura150',      kind: 'heal',    element: 'neutro',   power: 150, speed: 8 },
];

export const CHIP_BY_ID = Object.fromEntries(CHIPS.map(c => [c.id, c]));
```

- [ ] **Step 4: Rodar os testes e ver passar**

Run: `node --test tests/`
Expected: `pass 4`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/data/chips.js tests/data.test.mjs
git commit -m "feat: biblioteca de 30 chips de batalha"
```

---

### Task 3: Dados dos Navis e decks da IA

**Files:**
- Create: `js/data/navis.js`
- Modify: `tests/data.test.mjs` (acrescentar testes ao final)

- [ ] **Step 1: Acrescentar testes (falhando)** — adicionar ao final de `tests/data.test.mjs`:

```js
import { NAVIS, NAVI_BY_ID, AI_DECKS } from '../js/data/navis.js';

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
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module ... js/data/navis.js`

- [ ] **Step 3: Criar `js/data/navis.js`**

```js
// Navis jogáveis e decks template da IA. Dados puros, sem lógica.

export const NAVIS = [
  { id: 'blaze',   name: 'BlazeMan',    element: 'fogo',     maxHp: 480, naviAttack: { name: 'Inferno Solar',   power: 90 } },
  { id: 'torrent', name: 'TorrentGirl', element: 'agua',     maxHp: 520, naviAttack: { name: 'Maré Brava',      power: 80 } },
  { id: 'volt',    name: 'VoltMan',     element: 'eletrico', maxHp: 450, naviAttack: { name: 'Tempestade Volt', power: 100 } },
  { id: 'sylva',   name: 'SylvaKid',    element: 'madeira',  maxHp: 560, naviAttack: { name: 'Floresta Viva',   power: 70 } },
];

export const NAVI_BY_ID = Object.fromEntries(NAVIS.map(n => [n.id, n]));

// difficulty: 1 fácil, 2 médio, 3 difícil
export const AI_DECKS = [
  {
    naviId: 'blaze', difficulty: 1,
    deck: ['cannon', 'heatshot', 'vulcan', 'sword', 'minibomb', 'shotgun', 'heatshot', 'recover30', 'guard', 'cannon', 'airshot', 'heatshot'],
    slotIns: ['recover30', 'cannon', 'guard'],
  },
  {
    naviId: 'sylva', difficulty: 1,
    deck: ['boomerang', 'vulcan', 'woodtower', 'shotgun', 'recover30', 'boomerang', 'minibomb', 'sword', 'guard', 'airshot', 'boomerang', 'cannon'],
    slotIns: ['recover80', 'woodtower', 'minibomb'],
  },
  {
    naviId: 'torrent', difficulty: 2,
    deck: ['bubbler', 'aquatower', 'sword', 'zapring', 'barrier', 'bubbler', 'recover80', 'widesword', 'aquatower', 'shotgun', 'tsunami', 'bubbler'],
    slotIns: ['recover80', 'tsunami', 'barrier'],
  },
  {
    naviId: 'volt', difficulty: 2,
    deck: ['zapring', 'thunder', 'dashattack', 'zapring', 'widesword', 'barrier', 'thunder', 'recover80', 'vulcan', 'lightning', 'zapring', 'sword'],
    slotIns: ['recover80', 'lightning', 'guard'],
  },
  {
    naviId: 'blaze', difficulty: 3,
    deck: ['flamesword', 'fireburst', 'hicannon', 'heatshot', 'barrier', 'flamesword', 'recover150', 'widesword', 'fireburst', 'heatshot', 'aura', 'flamesword'],
    slotIns: ['recover150', 'fireburst', 'aura'],
  },
  {
    naviId: 'sylva', difficulty: 3,
    deck: ['forestbomb', 'woodtower', 'bigbomb', 'boomerang', 'aura', 'forestbomb', 'recover150', 'gutspunch', 'woodtower', 'megacannon', 'forestbomb', 'widesword'],
    slotIns: ['recover150', 'bigbomb', 'barrier'],
  },
];
```

- [ ] **Step 4: Rodar os testes e ver passar**

Run: `node --test tests/`
Expected: `pass 6`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/data/navis.js tests/data.test.mjs
git commit -m "feat: 4 Navis e 6 decks template da IA"
```

---

### Task 4: Motor de batalha — criação, validação, elementos e próximo chip

**Files:**
- Create: `js/battle.js`
- Test: `tests/battle.test.mjs`

- [ ] **Step 1: Escrever os testes (falhando)** — criar `tests/battle.test.mjs`:

```js
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
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `node --test tests/battle.test.mjs`
Expected: FAIL — `Cannot find module ... js/battle.js`

- [ ] **Step 3: Criar `js/battle.js`** (com `playRound` mínimo que será completado na Task 5):

```js
// Motor de batalha puro: sem DOM, sem timers. RNG injetável para testes.
import { DECK_SIZE, SLOTIN_SIZE } from './data/chips.js';

export const WEAKNESS = { fogo: 'madeira', madeira: 'eletrico', eletrico: 'agua', agua: 'fogo' };
export const ROUND_LIMIT = 100;
export const NAVI_ATTACK_SPEED = 7;

export function elementMultiplier(attackElement, targetElement) {
  return WEAKNESS[attackElement] === targetElement ? 2 : 1;
}

function makeSide(cfg) {
  if (!cfg || !cfg.navi) throw new Error('Configuração precisa de um Navi');
  if (!Array.isArray(cfg.deck) || cfg.deck.length !== DECK_SIZE) {
    throw new Error(`Deck deve ter ${DECK_SIZE} chips`);
  }
  if (!Array.isArray(cfg.slotIns) || cfg.slotIns.length !== SLOTIN_SIZE) {
    throw new Error(`Slot-In deve ter ${SLOTIN_SIZE} chips`);
  }
  return {
    navi: cfg.navi,
    deck: cfg.deck.slice(),
    slotIns: cfg.slotIns.slice(),
    slotInUsed: cfg.slotIns.map(() => false),
    hp: cfg.navi.maxHp,
    deckIndex: 0,
    pendingSlotIn: null,
    guard: 0,
  };
}

export function createBattle(playerConfig, enemyConfig, rng = Math.random) {
  return {
    sides: { player: makeSide(playerConfig), enemy: makeSide(enemyConfig) },
    round: 0,
    winner: null,
    rng,
  };
}

// O que este lado fará no próximo round: slot-in pendente > Navi Attack (deck esgotado) > chip do deck.
export function nextChip(battle, sideName) {
  const side = battle.sides[sideName];
  if (side.pendingSlotIn !== null) {
    return { chip: side.slotIns[side.pendingSlotIn], source: 'slotin' };
  }
  if (side.deckIndex === DECK_SIZE) {
    const na = side.navi.naviAttack;
    return {
      chip: { name: na.name, kind: 'attack', element: side.navi.element, power: na.power, speed: NAVI_ATTACK_SPEED },
      source: 'navi',
    };
  }
  return { chip: side.deck[side.deckIndex], source: 'deck' };
}

export function useSlotIn(battle, sideName, index) {
  const side = battle.sides[sideName];
  if (battle.winner !== null) return false;
  if (!Number.isInteger(index) || index < 0 || index >= side.slotIns.length) return false;
  if (side.slotInUsed[index] || side.pendingSlotIn !== null) return false;
  side.pendingSlotIn = index;
  return true;
}

export function playRound(battle) {
  throw new Error('não implementado'); // Task 5
}
```

- [ ] **Step 4: Rodar os testes e ver passar**

Run: `node --test tests/battle.test.mjs`
Expected: `pass 5`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/battle.js tests/battle.test.mjs
git commit -m "feat: motor de batalha - criação, validação, elementos, fila"
```

---

### Task 5: Motor de batalha — execução dos rounds

**Files:**
- Modify: `js/battle.js` (substituir `playRound`)
- Modify: `tests/battle.test.mjs` (acrescentar testes ao final)

- [ ] **Step 1: Acrescentar testes de combate (falhando)** — adicionar ao final de `tests/battle.test.mjs`:

```js
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
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `node --test tests/battle.test.mjs`
Expected: FAIL — os novos testes falham com `não implementado`

- [ ] **Step 3: Implementar `playRound`** — substituir a função inteira em `js/battle.js`:

```js
// Executa um round completo e devolve a lista de eventos para a UI animar.
// Eventos: {type:'chip'|'naviAttack', side, chip, source} | {type:'damage', side, amount, super}
//          {type:'guard', side, amount} | {type:'heal', side, amount} | {type:'reload', side}
//          {type:'end', winner, byLimit?}
export function playRound(battle) {
  if (battle.winner !== null) throw new Error('A batalha já terminou');
  battle.round++;
  const events = [];

  // Guarda dura só o round em que o chip de defesa age.
  battle.sides.player.guard = 0;
  battle.sides.enemy.guard = 0;

  const actors = ['player', 'enemy'].map(name => ({ name, ...nextChip(battle, name) }));
  actors.sort((a, b) => b.chip.speed - a.chip.speed || (battle.rng() < 0.5 ? -1 : 1));

  for (const actor of actors) {
    if (battle.winner !== null) break; // quem morreu não age
    const side = battle.sides[actor.name];
    const foeName = actor.name === 'player' ? 'enemy' : 'player';
    const foe = battle.sides[foeName];

    events.push({ type: actor.source === 'navi' ? 'naviAttack' : 'chip', side: actor.name, chip: actor.chip, source: actor.source });

    if (actor.chip.kind === 'attack') {
      const mult = elementMultiplier(actor.chip.element, foe.navi.element);
      const raw = actor.chip.power * mult;
      const dmg = Math.max(0, raw - foe.guard);
      foe.guard = Math.max(0, foe.guard - raw);
      foe.hp = Math.max(0, foe.hp - dmg);
      events.push({ type: 'damage', side: foeName, amount: dmg, super: mult > 1 });
      if (foe.hp === 0) {
        battle.winner = actor.name;
        events.push({ type: 'end', winner: actor.name });
      }
    } else if (actor.chip.kind === 'defense') {
      side.guard += actor.chip.power;
      events.push({ type: 'guard', side: actor.name, amount: actor.chip.power });
    } else if (actor.chip.kind === 'heal') {
      const healed = Math.min(side.navi.maxHp - side.hp, actor.chip.power);
      side.hp += healed;
      events.push({ type: 'heal', side: actor.name, amount: healed });
    }

    // Avança a fila do lado que agiu.
    if (actor.source === 'slotin') {
      side.slotInUsed[side.pendingSlotIn] = true;
      side.pendingSlotIn = null;
    } else if (actor.source === 'navi') {
      side.deckIndex = 0;
      events.push({ type: 'reload', side: actor.name });
    } else {
      side.deckIndex++;
    }
  }

  if (battle.winner === null && battle.round >= ROUND_LIMIT) {
    const p = battle.sides.player.hp / battle.sides.player.navi.maxHp;
    const e = battle.sides.enemy.hp / battle.sides.enemy.navi.maxHp;
    battle.winner = p > e ? 'player' : 'enemy'; // empate favorece o oponente
    events.push({ type: 'end', winner: battle.winner, byLimit: true });
  }

  return events;
}
```

- [ ] **Step 4: Rodar todos os testes e ver passar**

Run: `node --test tests/`
Expected: `pass 20`, `fail 0` (6 de dados + 14 de batalha)

- [ ] **Step 5: Commit**

```bash
git add js/battle.js tests/battle.test.mjs
git commit -m "feat: execução de rounds - ataque, defesa, cura, ciclo do deck, fim"
```

---

### Task 6: IA do oponente

**Files:**
- Create: `js/ai.js`
- Test: `tests/ai.test.mjs`

- [ ] **Step 1: Escrever os testes (falhando)** — criar `tests/ai.test.mjs`:

```js
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
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `node --test tests/ai.test.mjs`
Expected: FAIL — `Cannot find module ... js/ai.js`

- [ ] **Step 3: Criar `js/ai.js`**

```js
// Sorteio de oponente e decisões de slot-in da IA (sempre o lado 'enemy').
import { CHIP_BY_ID } from './data/chips.js';
import { NAVI_BY_ID, AI_DECKS } from './data/navis.js';

const LOW_HP = 0.3;

export function buildConfig(template) {
  return {
    navi: NAVI_BY_ID[template.naviId],
    deck: template.deck.map(id => CHIP_BY_ID[id]),
    slotIns: template.slotIns.map(id => CHIP_BY_ID[id]),
  };
}

export function pickOpponent(rng = Math.random) {
  const template = AI_DECKS[Math.floor(rng() * AI_DECKS.length)];
  return { template, config: buildConfig(template) };
}

// Devolve o índice do slot-in a usar neste round, ou null.
export function aiChooseSlotIn(battle) {
  const me = battle.sides.enemy;
  const foe = battle.sides.player;
  if (me.pendingSlotIn !== null) return null;

  if (me.hp / me.navi.maxHp < LOW_HP) {
    const i = me.slotIns.findIndex((c, idx) => !me.slotInUsed[idx] && c.kind === 'heal');
    if (i !== -1) return i;
    return null;
  }

  if (foe.hp / foe.navi.maxHp < LOW_HP) {
    let best = -1;
    me.slotIns.forEach((c, idx) => {
      if (!me.slotInUsed[idx] && c.kind === 'attack' && (best === -1 || c.power > me.slotIns[best].power)) best = idx;
    });
    if (best !== -1) return best;
  }
  return null;
}
```

- [ ] **Step 4: Rodar todos os testes e ver passar**

Run: `node --test tests/`
Expected: `pass 25`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/ai.js tests/ai.test.mjs
git commit -m "feat: IA - sorteio de oponente e slot-in por gatilho de HP"
```

---

### Task 7: Sprites pixel art

**Files:**
- Create: `js/sprites.js`
- Modify: `tests/data.test.mjs` (acrescentar teste ao final)

- [ ] **Step 1: Acrescentar teste (falhando)** — adicionar ao final de `tests/data.test.mjs`:

```js
import { NAVI_SPRITE_MAP, NAVI_PALETTES } from '../js/sprites.js';

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
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `node --test tests/data.test.mjs`
Expected: FAIL — `Cannot find module ... js/sprites.js`

- [ ] **Step 3: Criar `js/sprites.js`**

```js
// Pixel art própria desenhada em canvas. Um corpo base de Navi 16x16,
// recolorido por paleta para cada personagem. '.' = transparente.

export const NAVI_SPRITE_MAP = [
  '......2222......',
  '.....211112.....',
  '....21111112....',
  '....21311312....',
  '....21111112....',
  '.....214412.....',
  '......2112......',
  '...3322222233...',
  '..332222222233..',
  '..332222222233..',
  '..332222222233..',
  '...3322222233...',
  '....222..222....',
  '....222..222....',
  '...3333..3333...',
  '...3333..3333...',
];

// 1: pele/visor, 2: cor primária, 3: cor secundária, 4: boca
export const NAVI_PALETTES = {
  blaze:   { 1: '#ffe0b0', 2: '#e8401f', 3: '#7a1408', 4: '#3a2020' },
  torrent: { 1: '#e0f0ff', 2: '#2a6fd6', 3: '#103a78', 4: '#202a3a' },
  volt:    { 1: '#fff8d0', 2: '#e6b800', 3: '#8a6d00', 4: '#3a3320' },
  sylva:   { 1: '#e8ffd8', 2: '#3fa34d', 3: '#1d5c28', 4: '#203a24' },
};

export function drawSprite(ctx, map, palette, x, y, scale, flip = false) {
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[flip ? row.length - 1 - c : c];
      if (ch === '.') continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    }
  }
}

// Desenha o Navi centralizado e em escala inteira no canvas dado.
export function drawNavi(canvas, naviId, flip = false) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / 16));
  const x = Math.floor((canvas.width - 16 * scale) / 2);
  const y = Math.floor((canvas.height - 16 * scale) / 2);
  drawSprite(ctx, NAVI_SPRITE_MAP, NAVI_PALETTES[naviId], x, y, scale, flip);
}
```

- [ ] **Step 4: Rodar os testes e ver passar**

Run: `node --test tests/`
Expected: `pass 26`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/sprites.js tests/data.test.mjs
git commit -m "feat: sprites pixel art dos Navis em canvas"
```

---

### Task 8: UI — título e montagem de deck

**Files:**
- Create: `js/ui.js`
- Modify: `js/main.js` (substituir o placeholder por completo)

Sem testes automatizados (DOM); verificação manual no Step 3.

- [ ] **Step 1: Criar `js/ui.js`** com título e montagem (as telas de batalha/resultado entram na Task 9):

```js
// Renderização das telas. Toda manipulação de DOM vive aqui.
import { CHIPS, CHIP_BY_ID, DECK_SIZE, SLOTIN_SIZE, MAX_COPIES } from './data/chips.js';
import { NAVIS, NAVI_BY_ID } from './data/navis.js';
import { drawNavi } from './sprites.js';

export const EL_NAMES = { neutro: 'Neutro', fogo: 'Fogo', agua: 'Água', eletrico: 'Elétrico', madeira: 'Madeira' };
export const KIND_NAMES = { attack: 'Ataque', defense: 'Defesa', heal: 'Cura' };

// Cria elementos DOM: h('div', {class: 'x', onclick: fn}, filho1, filho2...)
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) el.append(c);
  return el;
}

function chipCard(chip, extra = {}) {
  const title = `${KIND_NAMES[chip.kind]} • ${EL_NAMES[chip.element]} • Poder ${chip.power} • Vel ${chip.speed}`;
  return h('button', { class: `chip el-${chip.element}`, title, ...extra },
    h('span', { class: 'chip-name' }, chip.name),
    h('span', { class: 'chip-power' }, String(chip.power)));
}

export function renderTitle(root, { onStart }) {
  root.innerHTML = '';
  root.append(h('div', { class: 'title-box' },
    h('h1', {}, 'CHIP CHALLENGE'),
    h('p', { class: 'subtitle' }, 'Monte seu deck. Vença a batalha.'),
    h('p', { class: 'subtitle' }, 'Um tributo a Megaman Battle Chip Challenge'),
    h('button', { class: 'big', onclick: onStart }, 'INICIAR')));
}

export function randomLoadout(rng = Math.random) {
  const navi = NAVIS[Math.floor(rng() * NAVIS.length)];
  const counts = {};
  const pick = () => {
    for (;;) {
      const c = CHIPS[Math.floor(rng() * CHIPS.length)];
      if ((counts[c.id] || 0) < MAX_COPIES) {
        counts[c.id] = (counts[c.id] || 0) + 1;
        return c.id;
      }
    }
  };
  return {
    naviId: navi.id,
    deck: Array.from({ length: DECK_SIZE }, pick),
    slotIns: Array.from({ length: SLOTIN_SIZE }, pick),
  };
}

export function renderBuilder(root, { onReady }) {
  const state = { naviId: null, deck: [], slotIns: [], target: 'deck' };
  const copies = id => state.deck.filter(x => x === id).length + state.slotIns.filter(x => x === id).length;

  function addChip(id) {
    if (copies(id) >= MAX_COPIES) return;
    if (state.target === 'deck' && state.deck.length < DECK_SIZE) state.deck.push(id);
    else if (state.target === 'slot' && state.slotIns.length < SLOTIN_SIZE) state.slotIns.push(id);
    update();
  }

  function slotList(ids, size, listName) {
    const items = ids.map((id, i) =>
      chipCard(CHIP_BY_ID[id], { onclick: () => { state[listName].splice(i, 1); update(); } }));
    for (let i = ids.length; i < size; i++) items.push(h('div', { class: 'slot-empty' }, '— vazio —'));
    return h('div', { class: 'slot-list' }, items);
  }

  function update() {
    root.innerHTML = '';
    const complete = state.naviId && state.deck.length === DECK_SIZE && state.slotIns.length === SLOTIN_SIZE;

    const naviRow = h('div', { class: 'navi-row' }, NAVIS.map(n => {
      const canvas = h('canvas', { width: 48, height: 48 });
      const card = h('button', {
        class: `navi-card${state.naviId === n.id ? ' selected' : ''}`,
        onclick: () => { state.naviId = n.id; update(); },
      }, canvas, h('span', {}, n.name), h('span', {}, `HP ${n.maxHp} • ${EL_NAMES[n.element]}`));
      drawNavi(canvas, n.id);
      return card;
    }));

    root.append(
      h('h2', {}, 'MONTE SEU DECK'),
      naviRow,
      h('div', { class: 'target-row' },
        h('button', { class: state.target === 'deck' ? 'active' : '', onclick: () => { state.target = 'deck'; update(); } },
          `DECK ${state.deck.length}/${DECK_SIZE}`),
        h('button', { class: state.target === 'slot' ? 'active' : '', onclick: () => { state.target = 'slot'; update(); } },
          `SLOT-IN ${state.slotIns.length}/${SLOTIN_SIZE}`)),
      h('div', { class: 'builder-cols' },
        h('div', { class: 'library' }, CHIPS.map(c =>
          chipCard(c, { onclick: () => addChip(c.id), disabled: copies(c.id) >= MAX_COPIES }))),
        h('div', { class: 'loadout' },
          h('h3', {}, 'DECK (ordem de uso)'),
          slotList(state.deck, DECK_SIZE, 'deck'),
          h('h3', {}, 'SLOT-IN (reserva)'),
          slotList(state.slotIns, SLOTIN_SIZE, 'slotIns'))),
      h('div', { class: 'builder-actions' },
        h('button', { onclick: () => { Object.assign(state, randomLoadout()); update(); } }, 'DECK ALEATÓRIO'),
        h('button', {
          class: 'big', disabled: !complete,
          onclick: () => onReady({
            navi: NAVI_BY_ID[state.naviId],
            deck: state.deck.map(id => CHIP_BY_ID[id]),
            slotIns: state.slotIns.map(id => CHIP_BY_ID[id]),
          }),
        }, 'BATALHAR!')));
  }

  update();
}
```

- [ ] **Step 2: Substituir `js/main.js` por completo**

```js
// Boot e roteamento entre telas. Estado da sessão vive aqui.
import { renderTitle, renderBuilder } from './ui.js';

const els = {
  title: document.getElementById('screen-title'),
  builder: document.getElementById('screen-builder'),
  battle: document.getElementById('screen-battle'),
  result: document.getElementById('screen-result'),
};

const session = { playerConfig: null, result: null };

function show(name) {
  for (const [k, el] of Object.entries(els)) el.classList.toggle('hidden', k !== name);
}

function goTitle() {
  renderTitle(els.title, { onStart: goBuilder });
  show('title');
}

function goBuilder() {
  renderBuilder(els.builder, {
    onReady: cfg => {
      session.playerConfig = cfg;
      goBattle();
    },
  });
  show('builder');
}

function goBattle() {
  // Task 9 liga a tela de batalha; por enquanto confirma o fluxo.
  els.battle.textContent = 'Batalha em construção (Task 9)';
  show('battle');
}

goTitle();
```

- [ ] **Step 3: Verificar no navegador**

Run: servidor da Task 1 ainda rodando (`npx -y http-server -p 8080 -c-1`), abrir `http://localhost:8080` e checar:
- Título aparece; "INICIAR" leva à montagem.
- 4 Navis com sprites coloridos diferentes; clique seleciona (fica laranja).
- Clicar chips adiciona ao alvo ativo (Deck/Slot-In); contador atualiza; clicar no item da lista remove; 4ª cópia de um chip fica desabilitada.
- "DECK ALEATÓRIO" preenche tudo; "BATALHAR!" só habilita completo e leva ao placeholder da batalha.
- Console sem erros.

- [ ] **Step 4: Commit**

```bash
git add js/ui.js js/main.js
git commit -m "feat: telas de título e montagem de deck"
```

---

### Task 9: UI — batalha e resultado

**Files:**
- Modify: `js/ui.js` (acrescentar `renderBattle` e `renderResult` ao final)
- Modify: `js/main.js` (ligar batalha e resultado)

- [ ] **Step 1: Acrescentar imports e telas em `js/ui.js`**

No topo do arquivo, acrescentar aos imports existentes:

```js
import { createBattle, useSlotIn, playRound, nextChip } from './battle.js';
import { aiChooseSlotIn } from './ai.js';
```

Ao final do arquivo, acrescentar:

```js
// opponent: { template, config } vindo de pickOpponent().
// onEnd recebe { winner, rounds, playerHp, playerMaxHp, enemyName }.
export function renderBattle(root, playerConfig, opponent, onEnd) {
  root.innerHTML = '';
  const battle = createBattle(playerConfig, opponent.config);
  let speed = 1;

  const playerCanvas = h('canvas', { width: 96, height: 96 });
  const enemyCanvas = h('canvas', { width: 96, height: 96 });
  const roundEl = h('span', {}, 'ROUND 1');
  const speedBtn = h('button', { onclick: () => { speed = speed === 1 ? 2 : 1; speedBtn.textContent = `VELOCIDADE ${speed}x`; } }, 'VELOCIDADE 1x');
  const logEl = h('div', { class: 'battle-log' });

  function fighterBox(canvas, side) {
    const s = battle.sides[side];
    return h('div', { class: 'fighter', id: `fighter-${side}` },
      canvas,
      h('div', { class: 'fighter-name' }, `${s.navi.name} (${EL_NAMES[s.navi.element]})`),
      h('div', { class: 'hp-bar' }, h('div', { class: 'hp-fill', id: `hp-fill-${side}` })),
      h('div', { class: 'hp-text', id: `hp-text-${side}` }));
  }

  const playerQueue = h('div', { class: 'queue-chips', id: 'queue-player' });
  const enemyQueue = h('div', { class: 'queue-chips', id: 'queue-enemy' });
  const slotInBar = h('div', { class: 'slotin-bar' }, h('h3', {}, 'SLOT-IN:'));
  const slotBtns = battle.sides.player.slotIns.map((c, i) =>
    chipCard(c, {
      onclick: () => {
        if (useSlotIn(battle, 'player', i)) {
          log(`Slot-In preparado: ${c.name}!`);
          updateHud();
        }
      },
    }));
  slotInBar.append(...slotBtns);

  root.append(
    h('div', { class: 'battle-header' }, roundEl, speedBtn),
    h('div', { class: 'arena' }, fighterBox(playerCanvas, 'player'), fighterBox(enemyCanvas, 'enemy')),
    h('div', { class: 'queues' },
      h('div', { class: 'queue' }, h('h3', {}, 'SEUS PRÓXIMOS CHIPS'), playerQueue),
      h('div', { class: 'queue' }, h('h3', {}, 'CHIP DO OPONENTE'), enemyQueue)),
    slotInBar,
    logEl);

  drawNavi(playerCanvas, playerConfig.navi.id);
  drawNavi(enemyCanvas, opponent.config.navi.id, true);

  function log(msg) {
    logEl.prepend(h('div', {}, msg));
  }

  function upcomingPlayer() {
    const side = battle.sides.player;
    const list = [];
    if (side.pendingSlotIn !== null) {
      list.push({ ...side.slotIns[side.pendingSlotIn], fromSlotIn: true });
    }
    let idx = side.deckIndex;
    while (list.length < 3) {
      if (idx === DECK_SIZE) {
        list.push({ name: side.navi.naviAttack.name, element: side.navi.element, special: true });
        idx = 0;
      } else {
        list.push(side.deck[idx++]);
      }
    }
    return list;
  }

  function updateHud() {
    roundEl.textContent = `ROUND ${Math.max(1, battle.round)}`;
    for (const side of ['player', 'enemy']) {
      const s = battle.sides[side];
      const pct = (s.hp / s.navi.maxHp) * 100;
      const fill = document.getElementById(`hp-fill-${side}`);
      fill.style.width = `${pct}%`;
      fill.classList.toggle('low', pct < 30);
      document.getElementById(`hp-text-${side}`).textContent = `${s.hp}/${s.navi.maxHp} HP`;
    }
    playerQueue.innerHTML = '';
    playerQueue.append(...upcomingPlayer().map(c =>
      h('div', { class: `queue-chip${c.special || c.fromSlotIn ? ' special' : ''}` },
        `${c.special ? '★ ' : ''}${c.fromSlotIn ? '⮕ ' : ''}${c.name}`)));
    enemyQueue.innerHTML = '';
    const ec = nextChip(battle, 'enemy').chip;
    enemyQueue.append(h('div', { class: 'queue-chip' }, ec.name));
    battle.sides.player.slotIns.forEach((c, i) => {
      slotBtns[i].disabled = battle.sides.player.slotInUsed[i]
        || battle.sides.player.pendingSlotIn !== null
        || battle.winner !== null;
    });
  }

  function flash(side) {
    const el = document.getElementById(`fighter-${side}`);
    el.classList.remove('hit');
    void el.offsetWidth; // reinicia a animação
    el.classList.add('hit');
  }

  function describe(ev) {
    const name = s => battle.sides[s].navi.name;
    switch (ev.type) {
      case 'chip': return `${name(ev.side)} usou ${ev.chip.name}!`;
      case 'naviAttack': return `${name(ev.side)} disparou ${ev.chip.name}!`;
      case 'damage': return `${name(ev.side)} sofreu ${ev.amount} de dano${ev.super ? ' — SUPER EFETIVO!' : '!'}`;
      case 'guard': return `${name(ev.side)} se protege (${ev.amount})!`;
      case 'heal': return `${name(ev.side)} recuperou ${ev.amount} HP!`;
      case 'reload': return `Deck de ${name(ev.side)} recarregado!`;
      case 'end': return ev.byLimit ? 'Limite de rounds atingido!' : (ev.winner === 'player' ? 'VITÓRIA!' : 'DERROTA...');
    }
    return '';
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms / speed));

  async function loop() {
    updateHud();
    await sleep(800);
    while (battle.winner === null) {
      const aiIdx = aiChooseSlotIn(battle);
      if (aiIdx !== null && useSlotIn(battle, 'enemy', aiIdx)) {
        log(`${opponent.config.navi.name} usou Slot-In!`);
        await sleep(500);
      }
      const events = playRound(battle);
      for (const ev of events) {
        log(describe(ev));
        if (ev.type === 'damage') flash(ev.side);
        updateHud();
        await sleep(550);
      }
      await sleep(350);
    }
    await sleep(900);
    onEnd({
      winner: battle.winner,
      rounds: battle.round,
      playerHp: battle.sides.player.hp,
      playerMaxHp: battle.sides.player.navi.maxHp,
      enemyName: opponent.config.navi.name,
    });
  }

  loop();
}

export function renderResult(root, result, { onRematch, onNewDeck }) {
  root.innerHTML = '';
  const won = result.winner === 'player';
  root.append(h('div', { class: 'result-box' },
    h('h1', { class: won ? 'win' : 'lose' }, won ? 'VITÓRIA!' : 'DERROTA...'),
    h('p', { class: 'result-stats' },
      `vs ${result.enemyName} • ${result.rounds} rounds • seu HP: ${result.playerHp}/${result.playerMaxHp}`),
    h('div', { class: 'result-actions' },
      h('button', { class: 'big', onclick: onRematch }, 'REVANCHE'),
      h('button', { onclick: onNewDeck }, 'NOVO DECK'))));
}
```

`renderBattle` também precisa de `DECK_SIZE` — já está importado no topo de `js/ui.js` desde a Task 8.

- [ ] **Step 2: Ligar batalha e resultado em `js/main.js`** — substituir o arquivo por completo:

```js
// Boot e roteamento entre telas. Estado da sessão vive aqui.
import { renderTitle, renderBuilder, renderBattle, renderResult } from './ui.js';
import { pickOpponent } from './ai.js';

const els = {
  title: document.getElementById('screen-title'),
  builder: document.getElementById('screen-builder'),
  battle: document.getElementById('screen-battle'),
  result: document.getElementById('screen-result'),
};

const session = { playerConfig: null, result: null };

function show(name) {
  for (const [k, el] of Object.entries(els)) el.classList.toggle('hidden', k !== name);
}

function goTitle() {
  renderTitle(els.title, { onStart: goBuilder });
  show('title');
}

function goBuilder() {
  renderBuilder(els.builder, {
    onReady: cfg => {
      session.playerConfig = cfg;
      goBattle();
    },
  });
  show('builder');
}

function goBattle() {
  const opponent = pickOpponent();
  renderBattle(els.battle, session.playerConfig, opponent, res => {
    session.result = res;
    goResult();
  });
  show('battle');
}

function goResult() {
  renderResult(els.result, session.result, { onRematch: goBattle, onNewDeck: goBuilder });
  show('result');
}

goTitle();
```

- [ ] **Step 3: Rodar os testes (garantir que nada quebrou)**

Run: `node --test tests/`
Expected: `pass 26`, `fail 0`

- [ ] **Step 4: Verificar no navegador (jogo completo)**

Abrir `http://localhost:8080` e checar:
- Fluxo completo: título → deck (usar "DECK ALEATÓRIO") → "BATALHAR!".
- Batalha roda sozinha: log descreve cada ação, HP cai com flash/tremida, barras atualizam (verde → vermelho abaixo de 30%).
- Fila mostra seus 3 próximos chips; ★ marca o Navi Attack; oponente mostra só o chip atual.
- Clicar um Slot-In durante a batalha: aparece "⮕" na fila, o chip executa no round seguinte e o botão fica desabilitado para sempre.
- "VELOCIDADE 2x" acelera visivelmente.
- Fim leva à tela de resultado com estatísticas; "REVANCHE" sorteia novo oponente com o mesmo deck; "NOVO DECK" volta à montagem.
- Console sem erros.

- [ ] **Step 5: Commit**

```bash
git add js/ui.js js/main.js
git commit -m "feat: telas de batalha e resultado - jogo completo"
```

---

### Task 10: README e checagem final

**Files:**
- Create: `README.md`

- [ ] **Step 1: Criar `README.md`**

````markdown
# Chip Challenge

Jogo de navegador inspirado em *Megaman Battle Chip Challenge* (GBA): monte um
Program Deck de 12 chips + 3 Slot-Ins, escolha seu Navi e vença a auto-batalha
por turnos contra oponentes de IA. Toda a arte é original (pixel art em canvas).

## Jogar localmente

É um site estático com módulos ES — precisa de um servidor (não funciona via `file://`):

```bash
npx http-server -p 8080
# ou: python -m http.server 8080
```

Abra http://localhost:8080.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos para a branch `main`.
2. No repositório: **Settings → Pages → Source: Deploy from a branch**,
   branch `main`, pasta `/ (root)`. Salve.
3. O jogo fica em `https://<seu-usuario>.github.io/<repo>/`.

## Como jogar

- **Deck:** a ordem dos 12 chips é a ordem de execução. Quando o deck esgota,
  seu Navi dispara o golpe especial e o deck recarrega.
- **Elementos:** Fogo > Madeira > Elétrico > Água > Fogo (dano 2x na fraqueza).
- **Slot-In:** durante a batalha, clique num chip de reserva para que ele
  substitua o próximo chip da sua fila (uma vez cada).

## Desenvolvimento

```bash
node --test tests/   # testes do motor de batalha, dados e IA
```

Estrutura: `js/battle.js` é o motor puro (sem DOM); `js/ui.js` renderiza as
telas; `js/data/` contém chips e Navis; `js/sprites.js` desenha a pixel art.
````

- [ ] **Step 2: Checagem final**

Run: `node --test tests/`
Expected: `pass 26`, `fail 0`

Run: `git status`
Expected: apenas `README.md` novo; nada mais pendente.

No navegador: jogar uma batalha completa do início ao fim sem erros no console.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README com instruções de jogo, dev e deploy no Pages"
```

---

## Verificação contra a spec (cobertura)

| Requisito da spec | Task |
|---|---|
| 4 telas (título/deck/batalha/resultado) e fluxo revanche/novo deck | 8, 9 |
| 4 Navis, deck de 12, 3 slot-ins, ~30 chips, máx. 3 cópias | 2, 3, 8 |
| Deck aleatório; só batalha com deck completo | 8 |
| Rounds com ordem por velocidade; ataque/defesa/cura | 5 |
| Elementos com fraqueza 2x | 4, 5 |
| Navi Attack ao esgotar deck + recarga | 5 |
| Slot-in (jogador via clique; uma vez cada) | 5, 9 |
| Fim por HP zero; limite de 100 rounds por % de HP (empate = derrota) | 5 |
| IA: sorteio de templates por dificuldade + slot-in por gatilho | 3, 6 |
| Pixel art própria em canvas, sem imagens | 7 |
| Velocidade 1x/2x | 9 |
| Motor puro testado em Node | 4, 5, 6 |
| README + deploy GitHub Pages | 10 |
