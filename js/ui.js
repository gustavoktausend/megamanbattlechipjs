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
