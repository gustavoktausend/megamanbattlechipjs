# Chip Challenge — Design

Clone de *Megaman Battle Chip Challenge* (GBA) em HTML/CSS/JavaScript puro, hospedável em GitHub Pages. Interface em português. Versão inicial: **batalha rápida apenas** (sem campanha, sem progressão salva).

## Objetivo

O jogador monta um Program Deck de chips de batalha, escolhe um Navi e enfrenta um oponente controlado por IA numa batalha automática por turnos, fiel ao espírito do Battle Chip Challenge: a estratégia está na montagem do deck, e a intervenção durante a batalha se limita ao Slot-In.

## Telas e fluxo

```
Título → Montagem de Deck → Batalha → Resultado
                ↑                          |
                └──── "Novo Deck" ─────────┤
                ┌──── "Revanche" ──────────┘
                ↓
             Batalha (mesmo deck, novo oponente sorteado)
```

### 1. Título
- Logo pixelado do jogo, botão "Iniciar".

### 2. Montagem de Deck
- Escolha de **1 entre 4 Navis**. Cada Navi tem: HP máximo, elemento, poder do Navi Attack (golpe especial) e nome/sprite próprios.
- Montagem do **deck de 12 chips**, em ordem (a ordem é a ordem de execução na batalha).
- Escolha de **3 chips de Slot-In** (reserva usável durante a batalha).
- Biblioteca de **~30 chips** distintos. Chips podem se repetir no deck até um limite de 3 cópias do mesmo chip (somando deck + slot-in).
- Botão **"Deck Aleatório"** preenche Navi, deck e slot-ins automaticamente.
- Só é possível iniciar a batalha com deck completo (12 + 3) e Navi escolhido.

### 3. Batalha
- Dois Navis frente a frente (pixel art em canvas), barras de HP, nome e elemento.
- Fila de chips de cada lado visível (próximos chips do jogador; do oponente, apenas o chip atual é revelado).
- Log de batalha em texto na parte inferior.
- A batalha avança sozinha em rounds com pausa curta entre ações (animação simples de flash/recuo ao tomar dano).
- **Slot-In:** a qualquer momento o jogador pode clicar num dos 3 chips de reserva para substituir o próximo chip da sua fila. Cada slot-in é usável uma única vez por batalha.
- Botão de velocidade (1x / 2x) para acelerar a batalha.

### 4. Resultado
- Tela de vitória ou derrota com resumo (HP restante, rounds).
- Botões: **"Revanche"** (mesmo deck, sorteia novo oponente) e **"Novo Deck"** (volta à montagem).

## Mecânica de batalha

- A batalha é dividida em **rounds**. Em cada round, o chip atual de cada lado executa e a fila avança.
- **Ordem de ação:** cada chip tem um atributo de velocidade; o chip mais rápido do round age primeiro. Empate: sorteio.
- **Tipos de chip:**
  - **Ataque** — causa dano ao Navi adversário; tem elemento (ou neutro).
  - **Defesa** — reduz/anula dano recebido neste round (ex.: Barreira, Guard).
  - **Cura** — recupera HP do próprio Navi.
- **Elementos:** Fogo, Água, Elétrico, Madeira, Neutro. Ciclo de fraqueza clássico BN:
  Fogo > Madeira > Elétrico > Água > Fogo. Dano na fraqueza = **2x**. Neutro não tem bônus nem fraqueza.
- **Navi Attack:** quando a fila de 12 chips esvazia, o Navi dispara seu golpe especial (dano com o elemento do Navi) e o deck recarrega do início, repetindo o ciclo.
- **Fim:** vence quem zerar o HP do adversário. Se os dois zerarem no mesmo round, quem agiu primeiro vence. Limite de 100 rounds: se atingido, vence quem tiver mais HP percentual (empate = derrota do jogador, para simplificar).

## IA do oponente

- O oponente é sorteado entre **decks pré-montados** (templates com Navi + 12 chips + tema de elemento), com 3 faixas de dificuldade misturadas no sorteio.
- A IA usa seus slot-ins com regra simples: usa um slot-in de cura quando HP < 30%, ou um slot-in de ataque forte quando o jogador está com HP baixo.

## Arquitetura

Site estático sem build, módulos ES nativos. Funciona abrindo via servidor estático (GitHub Pages, `python -m http.server`, etc.).

```
index.html          — único HTML, contém os contêineres das 4 telas
css/style.css       — tema GBA: paleta azul/cinza, fonte Press Start 2P (Google Fonts)
js/main.js          — boot, roteamento entre telas, estado global da sessão
js/data/chips.js    — definições dos ~30 chips (dados puros)
js/data/navis.js    — definições dos 4 Navis + decks template da IA
js/battle.js        — motor de batalha: lógica pura, sem DOM, determinístico via RNG injetável
js/ai.js            — sorteio de oponente e decisões de slot-in da IA
js/sprites.js       — pixel art própria (mapas de pixels → canvas); zero arquivos de imagem
js/ui.js            — renderização das telas, eventos, animações e log
```

- **`battle.js` é puro:** recebe estado + RNG, devolve eventos do round (dano, cura, slot-in, fim). A UI consome a lista de eventos para animar. Isso permite testar o motor em Node sem navegador.
- **Sprites:** cada Navi/efeito é um mapa de pixels (array de strings + paleta) desenhado em canvas com escala inteira, estilo GBA. Arte 100% original (sem assets da Capcom).

## Tratamento de erros

- Validação de deck na UI (impede iniciar incompleto) — o motor também valida e lança erro claro se receber deck inválido.
- Sem rede, sem armazenamento: não há estados de erro externos nesta versão.

## Testes

- `tests/battle.test.mjs` rodando em Node puro (`node tests/battle.test.mjs`, asserts nativos): fraquezas elementais, ordem por velocidade, ciclo do deck + Navi Attack, slot-in, condições de vitória/empate, limite de rounds.
- UI verificada manualmente no navegador.

## Fora de escopo (futuro)

- Campanha/torneio com progressão e localStorage
- Multiplayer
- Sons/música
- Diálogos e história
