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
