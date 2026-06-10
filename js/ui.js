// Renderização das telas. Toda manipulação de DOM vive aqui.
import { CHIPS, CHIP_BY_ID, DECK_SIZE, SLOTIN_SIZE, MAX_COPIES } from './data/chips.js';
import { NAVIS, NAVI_BY_ID } from './data/navis.js';
import { createBattle, useSlotIn, playRound, nextChip } from './battle.js';
import { aiChooseSlotIn } from './ai.js';
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

// Nomeia os lados para exibição; em partida-espelho (mesmo Navi dos
// dois lados) acrescenta (você)/(rival) para o log não ficar ambíguo.
export function sideNamer(playerName, enemyName) {
  const mirror = playerName === enemyName;
  return side => {
    const n = side === 'player' ? playerName : enemyName;
    if (!mirror) return n;
    return `${n} ${side === 'player' ? '(você)' : '(rival)'}`;
  };
}

// opponent: { template, config } vindo de pickOpponent().
// onEnd recebe { winner, rounds, playerHp, playerMaxHp, enemyName }.
export function renderBattle(root, playerConfig, opponent, onEnd) {
  root.innerHTML = '';
  const battle = createBattle(playerConfig, opponent.config);
  const sideName = sideNamer(playerConfig.navi.name, opponent.config.navi.name);
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
      h('div', { class: 'fighter-name' }, `${sideName(side)} (${EL_NAMES[s.navi.element]})`),
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
    const name = sideName;
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
        log(`${sideName('enemy')} usou Slot-In!`);
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
