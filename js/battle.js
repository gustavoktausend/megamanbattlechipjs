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
