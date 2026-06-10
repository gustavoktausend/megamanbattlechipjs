// Biblioteca de chips de batalha. Dados puros, sem lógica.
// kind: 'attack' (power = dano) | 'defense' (power = dano bloqueado no round) | 'heal' (power = HP curado)
// speed: maior age primeiro no round.

export const DECK_SIZE = 12;
export const SLOTIN_SIZE = 3;
export const MAX_COPIES = 3;

export const CHIPS = [
  { id: 'cannon',     name: 'Canhão',       kind: 'attack',  element: 'neutro',   power: 40,  speed: 8 },
  { id: 'hicannon',   name: 'CanhãoAlto',   kind: 'attack',  element: 'neutro',   power: 80,  speed: 6 },
  { id: 'megacannon', name: 'MegaCanhão',   kind: 'attack',  element: 'neutro',   power: 120, speed: 4 },
  { id: 'sword',      name: 'Espada',       kind: 'attack',  element: 'neutro',   power: 60,  speed: 9 },
  { id: 'widesword',  name: 'EspadaLarga',  kind: 'attack',  element: 'neutro',   power: 90,  speed: 7 },
  { id: 'shotgun',    name: 'Escopeta',     kind: 'attack',  element: 'neutro',   power: 50,  speed: 7 },
  { id: 'vulcan',     name: 'Vulcan',       kind: 'attack',  element: 'neutro',   power: 30,  speed: 10 },
  { id: 'airshot',    name: 'TiroDeAr',     kind: 'attack',  element: 'neutro',   power: 35,  speed: 11 },
  { id: 'dashattack', name: 'Investida',    kind: 'attack',  element: 'neutro',   power: 70,  speed: 9 },
  { id: 'gutspunch',  name: 'SocoForte',    kind: 'attack',  element: 'neutro',   power: 75,  speed: 5 },
  { id: 'minibomb',   name: 'MiniBomba',    kind: 'attack',  element: 'neutro',   power: 55,  speed: 6 },
  { id: 'bigbomb',    name: 'BombaGrande',  kind: 'attack',  element: 'neutro',   power: 100, speed: 3 },
  { id: 'heatshot',   name: 'TiroFogo',     kind: 'attack',  element: 'fogo',     power: 50,  speed: 7 },
  { id: 'flamesword', name: 'EspadaFlama',  kind: 'attack',  element: 'fogo',     power: 85,  speed: 6 },
  { id: 'fireburst',  name: 'Labareda',     kind: 'attack',  element: 'fogo',     power: 110, speed: 4 },
  { id: 'bubbler',    name: 'Bolha',        kind: 'attack',  element: 'agua',     power: 50,  speed: 7 },
  { id: 'aquatower',  name: 'TorreÁgua',    kind: 'attack',  element: 'agua',     power: 85,  speed: 5 },
  { id: 'tsunami',    name: 'Tsunami',      kind: 'attack',  element: 'agua',     power: 110, speed: 3 },
  { id: 'zapring',    name: 'AnelChoque',   kind: 'attack',  element: 'eletrico', power: 50,  speed: 8 },
  { id: 'thunder',    name: 'Trovão',       kind: 'attack',  element: 'eletrico', power: 80,  speed: 6 },
  { id: 'lightning',  name: 'Relâmpago',    kind: 'attack',  element: 'eletrico', power: 110, speed: 4 },
  { id: 'boomerang',  name: 'Bumerangue',   kind: 'attack',  element: 'madeira',  power: 55,  speed: 8 },
  { id: 'woodtower',  name: 'TorreMadeira', kind: 'attack',  element: 'madeira',  power: 85,  speed: 5 },
  { id: 'forestbomb', name: 'BombaVerde',   kind: 'attack',  element: 'madeira',  power: 110, speed: 4 },
  { id: 'guard',      name: 'Guarda',       kind: 'defense', element: 'neutro',   power: 60,  speed: 12 },
  { id: 'barrier',    name: 'Barreira',     kind: 'defense', element: 'neutro',   power: 100, speed: 12 },
  { id: 'aura',       name: 'Aura',         kind: 'defense', element: 'neutro',   power: 200, speed: 11 },
  { id: 'recover30',  name: 'Cura30',       kind: 'heal',    element: 'neutro',   power: 30,  speed: 10 },
  { id: 'recover80',  name: 'Cura80',       kind: 'heal',    element: 'neutro',   power: 80,  speed: 9 },
  { id: 'recover150', name: 'Cura150',      kind: 'heal',    element: 'neutro',   power: 150, speed: 8 },
];

export const CHIP_BY_ID = Object.fromEntries(CHIPS.map(c => [c.id, c]));
