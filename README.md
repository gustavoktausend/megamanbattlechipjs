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
node --test   # testes do motor de batalha, dados e IA
```

Estrutura: `js/battle.js` é o motor puro (sem DOM); `js/ui.js` renderiza as
telas; `js/data/` contém chips e Navis; `js/sprites.js` desenha a pixel art.
