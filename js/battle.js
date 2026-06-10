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
