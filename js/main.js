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
