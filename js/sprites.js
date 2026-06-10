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
