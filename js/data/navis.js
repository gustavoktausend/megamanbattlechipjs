// Navis jogáveis e decks template da IA. Dados puros, sem lógica.

export const NAVIS = [
  { id: 'blaze',   name: 'BlazeMan',    element: 'fogo',     maxHp: 480, naviAttack: { name: 'Inferno Solar',   power: 90 } },
  { id: 'torrent', name: 'TorrentGirl', element: 'agua',     maxHp: 520, naviAttack: { name: 'Maré Brava',      power: 80 } },
  { id: 'volt',    name: 'VoltMan',     element: 'eletrico', maxHp: 450, naviAttack: { name: 'Tempestade Volt', power: 100 } },
  { id: 'sylva',   name: 'SylvaKid',    element: 'madeira',  maxHp: 560, naviAttack: { name: 'Floresta Viva',   power: 70 } },
];

export const NAVI_BY_ID = Object.fromEntries(NAVIS.map(n => [n.id, n]));

// difficulty: 1 fácil, 2 médio, 3 difícil
export const AI_DECKS = [
  {
    naviId: 'blaze', difficulty: 1,
    deck: ['cannon', 'heatshot', 'vulcan', 'sword', 'minibomb', 'shotgun', 'heatshot', 'recover30', 'guard', 'cannon', 'airshot', 'heatshot'],
    slotIns: ['recover30', 'cannon', 'guard'],
  },
  {
    naviId: 'sylva', difficulty: 1,
    deck: ['boomerang', 'vulcan', 'woodtower', 'shotgun', 'recover30', 'boomerang', 'minibomb', 'sword', 'guard', 'airshot', 'boomerang', 'cannon'],
    slotIns: ['recover80', 'woodtower', 'minibomb'],
  },
  {
    naviId: 'torrent', difficulty: 2,
    deck: ['bubbler', 'aquatower', 'sword', 'zapring', 'barrier', 'bubbler', 'recover80', 'widesword', 'aquatower', 'shotgun', 'tsunami', 'bubbler'],
    slotIns: ['recover80', 'tsunami', 'barrier'],
  },
  {
    naviId: 'volt', difficulty: 2,
    deck: ['zapring', 'thunder', 'dashattack', 'zapring', 'widesword', 'barrier', 'thunder', 'recover80', 'vulcan', 'lightning', 'zapring', 'sword'],
    slotIns: ['recover80', 'lightning', 'guard'],
  },
  {
    naviId: 'blaze', difficulty: 3,
    deck: ['flamesword', 'fireburst', 'hicannon', 'heatshot', 'barrier', 'flamesword', 'recover150', 'widesword', 'fireburst', 'heatshot', 'aura', 'flamesword'],
    slotIns: ['recover150', 'fireburst', 'aura'],
  },
  {
    naviId: 'sylva', difficulty: 3,
    deck: ['forestbomb', 'woodtower', 'bigbomb', 'boomerang', 'aura', 'forestbomb', 'recover150', 'gutspunch', 'woodtower', 'megacannon', 'forestbomb', 'widesword'],
    slotIns: ['recover150', 'bigbomb', 'barrier'],
  },
];
