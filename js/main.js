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
