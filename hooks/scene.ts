// A pixel-art living room at night: a brick fireplace with stockings in the
// bottom-right corner, a snowy window and a tree on the left, and a string of
// lights along the top. Every drawing is built from one-unit squares, scaled
// up with crisp edges so it reads as pixels. Nothing sits in the middle, where
// the conversation is.
//
// The scene is still. The desktop app draws the backdrop as a picture, so
// neither CSS nor SMIL animation plays there. Light comes from soft halos
// instead of blinking.

const PALETTE: Record<string, string> = {
  W: '#8a5a34', // mantel highlight
  M: '#6b4026', // mantel
  B: '#5a2a22', // brick
  b: '#743628', // lighter brick
  m: '#2e1814', // mortar
  K: '#0d0807', // firebox
  L: '#4a2a17', // log
  l: '#6e4426', // log end
  e: '#8c2a1c', // embers
  T: '#6a574d', // hearth top
  S: '#4b3a33', // hearth stone
  R: '#c8443a', // red stocking
  P: '#3f7f4c', // green stocking
  w: '#efe6d6', // cuff, snow
  G: '#2f6b3d', // garland
  g: '#4f9a5c', // garland highlight
  h: '#fff3c4', // white-hot heart of the fire
  Y: '#ffd35a', // flame core
  O: '#f28a2a', // flame
  r: '#d9472b', // flame edge
  F: '#4a2c1a', // window frame
  f: '#6b4026', // window frame highlight
  N: '#123024', // pine outside
  n: '#1b4433', // pine highlight
  y: '#f3e3a1', // moon
  Q: '#f2c14e', // gold ribbon, star
  U: '#3b6ea8', // blue present
  V: '#7e4f9c', // purple present
  C: '#c07a3a', // cat
  c: '#8e5426', // cat stripes
  k: '#3a2418', // cat's closed eye, cocoa, snowman's eyes
  D: '#b07a3e', // cookie
  d: '#5a3418', // chocolate chip, crumbs
  X: '#8ea2bd', // sleigh, lit by the moon
  Z: '#8a8580', // mouse
  p: '#d99a9a', // mouse's ear and nose
  v: '#a274b8', // yarn highlight
  q: '#e8d9a0', // tape
  A: '#0d0806', // armchair in deep shadow
  a: '#1b100b', // armchair
  H: '#b5622b', // firelight catching the armchair's edge
  j: '#5e3017', // fainter firelight on the armchair
  E: '#5a201a', // blanket, red
  J: '#203b27', // blanket, green
  s: '#8a3426', // blanket, red in firelight
  u: '#a8916f', // blanket fringe
  o: '#cf6f28', // pumpkin
  t: '#9c4a1c', // pumpkin ribs, pie filling, rust leaves
  x: '#4f5a24', // pumpkin stem, grass outside
  I: '#b8955a', // corn stalk
  i: '#7f6438', // corn stalk in shade
  z: '#c9a256', // hay
  1: '#79b85a', // fresh leaves, spring and summer grass
  7: '#a9d46a', // sunlit leaves
  2: '#f2c4d0', // pale blossom
  3: '#df86a2', // blossom pink
  5: '#7d5866', // blossom by moonlight
  4: '#8cc7e3', // robin's eggs, glass
  9: '#a85a3a', // clay pot
  0: '#743a24', // clay pot in shade
}

// One path per color, with a box for each run of that color along a row. '.' is
// empty. Paths keep the scene well under the size limit, where a rect per run
// would not.
const pixels = (rows: string[], x0 = 0, y0 = 0) => {
  const runs = new Map<string, string>()

  rows.forEach((row, y) => {
    let x = 0

    while (x < row.length) {
      const ch = row.charAt(x)
      let end = x + 1

      while (end < row.length && row.charAt(end) === ch) {
        end++
      }
      const fill = PALETTE[ch]

      if (fill !== undefined) {
        runs.set(fill, `${runs.get(fill) ?? ''}M${x0 + x} ${y0 + y}h${end - x}v1h${x - end}z`)
      }
      x = end
    }
  })

  return [...runs].map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join('')
}

const grid = (w: number, h: number) => {
  const cells = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'))

  return {
    set: (x: number, y: number, c: string) => {
      const row = cells[y]

      if (row !== undefined && x >= 0 && x < w) {
        row[x] = c
      }
    },
    rows: () => cells.map(row => row.join('')),
  }
}

// Red, orange, gold and rust, the colors of the autumn leaves.
const AUTUMN_LEAVES = ['R', 'o', 'Q', 't']

// Pumpkins: a stem on top and ribs down the body.
const BIG_PUMPKIN = ['....xx....', '.ootootoo.', 'oootootooo', 'oootootooo', 'oootootooo', '.ootootoo.']
const SMALL_PUMPKIN = ['..x...', '.otto.', 'oottoo', '.otto.']
const GOURD = ['.x..', 'QQQ.', 'QQQQ', '.QQ.']

// A knitted mitten with a white cuff and a band of pattern, 6 wide and 8 tall.
const MITTEN = ['..wwww', '..RRRR', 'R.RwRw', 'RRRRRR', '.RRRRR', '..RRRR', '..RRRR', '...RR.']

const STOCKING = ['wwwww..', 'wwwww..', 'RRRRR..', 'RRRRR..', 'RRRRR..', 'RRRRRR.', 'RRRRRRR', '.RRRRRR', '..RRRR.']

// The fireplace, 40 wide and 34 tall. The season dresses the front edge of the
// mantel and hangs things from it.
const fireplace = (dress: Dress) => {
  const g = grid(40, 34)

  for (let y = 4; y < 30; y++) {
    for (let x = 2; x < 38; x++) {
      const course = Math.floor((y - 4) / 3)
      const shift = (course % 2) * 3
      const mortar = (y - 4) % 3 === 2 || (x + shift) % 6 === 5

      g.set(x, y, mortar ? 'm' : (Math.floor((x + shift) / 6) + course) % 3 === 0 ? 'b' : 'B')
    }
  }
  for (let x = 0; x < 40; x++) {
    g.set(x, 0, 'W')
    g.set(x, 1, 'M')
    g.set(x, 2, 'M')
    g.set(x, 3, dress.garland(x))
  }
  for (let y = 13; y < 30; y++) {
    const inset = y === 13 ? 3 : y === 14 ? 1 : 0

    for (let x = 10 + inset; x < 30 - inset; x++) {
      g.set(x, y, 'K')
    }
  }
  for (let x = 13; x < 27; x++) {
    g.set(x, 27, x === 13 || x === 26 ? 'l' : 'L')
  }
  for (let x = 12; x < 28; x++) {
    g.set(x, 28, x === 12 || x === 27 ? 'l' : 'L')
    g.set(x, 29, x % 3 === 0 ? 'O' : 'e')
  }
  for (let x = 0; x < 40; x++) {
    g.set(x, 30, 'T')

    for (let y = 31; y < 34; y++) {
      g.set(x, y, 'S')
    }
  }
  const hang = (rows: string[], x0: number) =>
    rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && g.set(x0 + x, 4 + y, c)))

  for (const [rows, x0] of dress.hung) {
    hang(rows, x0)
  }

  return g.rows()
}

// The fire, 14 wide and 10 tall, with a white-hot heart above the logs.
const FLAME = [
  '......r.......',
  '.....rO...r...',
  '..r..rOr.rO...',
  '..rO.rOOrrOr..',
  '.rOOrOYOOOYOr.',
  '.rOYOOYYOYYOr.',
  'rOOYYOYhYYYOOr',
  'rOYYhhYhhYYYOr',
  'rOYhhhhhhhhYOr',
  'rOYYhhhhhhYYOr',
]

// Red, green, gold and blue bulbs, by the index of the bulb in its string.
const BULB_COLORS = ['#e0453a', '#4fbf6a', '#f2c14e', '#5aa7e6']

// A lit bulb: a soft halo of its own color behind a crisp pixel.
const bulb = (x: number, y: number, width: number, height: number, i: number, halo = 2.5) =>
  `<circle cx="${x + width / 2}" cy="${y + height / 2}" r="${halo}" fill="url(#halo${i % 4})"/>` +
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${BULB_COLORS[i % 4]}"/>`

const GARLAND_BULBS = [3, 9, 15, 21, 27, 33].map((x, i) => bulb(x, 3, 2, 1, i)).join('')

// Three candles on the mantel, each flame with a warm halo.
const CANDLE_FLAMES = ([
  [5, -5, ['Y']],
  [8, -8, ['O', 'Y']],
  [31, -7, ['O', 'Y']],
] as [number, number, string[]][])
  .map(([x, y, rows]) => `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="3" fill="url(#warm)"/>${pixels(rows, x, y)}`)
  .join('')

// A mug of cocoa with marshmallows on the left of the hearth, with a little
// steam above it.
const COCOA = `${pixels(['..w....', 'RkkkR..', 'RRRRRRR', 'RRRRR.R', 'RRRRRRR', '.RRR...'], 2, 24)}
  <g opacity=".35">${pixels(['.w', 'w.', '.w'], 3, 20)}${pixels(['w', '.', 'w'], 5, 19)}</g>`

// Cookies and milk for Santa on the right of the hearth. From Christmas Day on,
// he has been: the glass is empty and the plate holds one bitten cookie.
const forSanta = (eaten: boolean) =>
  eaten
    ? pixels(['......w.w', '.D....w.w', 'DDd...w.w', 'wdwwdwwww'], 30, 26)
    : pixels(['......www', '.DDd..www', 'DdDDDdwww', 'wwwwwwwww'], 30, 26)

// A regulator wall clock in a tall wooden case, 13 wide and 34 tall: a crown
// with a brass finial, a round face whose hands rest at ten past ten, and a
// glass door over a brass pendulum.
const WALL_CLOCK = (() => {
  const g = grid(13, 34)
  const c = 6
  const row = (y: number, text: string) => [...text].forEach((ch, x) => ch !== '.' && g.set(x, y, ch))

  row(0, '......Q......')
  row(1, '....MMMMM....')
  row(2, '..MMWWWWWMM..')
  row(3, 'MMMMMMMMMMMMM')

  // The head: dark wood around a round face with a brass bezel.
  for (let y = 4; y < 15; y++) {
    for (let x = 0; x < 13; x++) {
      const d = Math.hypot(x - c, y - 9)

      g.set(x, y, x === 0 || x === 12 ? 'M' : x === 1 || x === 11 ? 'W' : d <= 3.6 ? 'w' : d <= 4.6 ? 'Q' : 'L')
    }
  }
  g.set(c, 6, 'k')
  g.set(c, 12, 'k')
  // Ten past ten: the hour hand toward 10, the minute hand toward 2.
  g.set(5, 8, 'K')
  g.set(4, 8, 'K')
  g.set(7, 8, 'K')
  g.set(8, 7, 'K')
  g.set(9, 7, 'K')
  g.set(c, 9, 'Q')

  row(15, 'MMMMMMMMMMMMM')

  // The body: a glass door showing the pendulum.
  for (let y = 16; y < 30; y++) {
    row(y, 'MWL.......LWM')
    for (let x = 3; x < 10; x++) {
      g.set(x, y, 'K')
    }
  }
  for (let y = 16; y < 26; y++) {
    g.set(c, y, 'Q')
  }
  row(25, '.....QQQ.....')
  row(26, '.....QQQ.....')
  row(27, '......Q......')
  g.set(3, 17, 'w')
  g.set(4, 18, 'w')

  row(30, 'MMMMMMMMMMMMM')
  row(31, '.MMMMMMMMMMM.')
  row(32, '...MMMMMMM...')
  row(33, '.....MMM.....')

  return g.rows()
})()

// A pumpkin pie on a plate, with a dollop of cream, for the right of the hearth.
const PIE = pixels(['...ww....', '.DttttD..', 'DDDDDDDD.', 'wwwwwwwww'], 30, 26)

// A snow globe on the mantel with a little pine inside.
const SNOW_GLOBE = pixels(['.XXXXX.', 'XwnNwwX', 'XwNNNwX', 'XnNNNNX', '.XwLwX.', 'ddddddd'], 16, -6)

// Split logs stacked on the hearth, ready for the fire.
const WOODPILE = pixels(['...LlL...', '.LlLLlL..', 'LlLLlLLlL'], 30, 27)

// The fireplace with its fire, candles, clock and cocoa, which stay all year,
// and what the season puts on and beside it.
const hearth = (dress: Dress) => `
  <ellipse cx="20" cy="22" rx="70" ry="48" fill="url(#glow)"/>
  ${pixels(fireplace(dress))}
  <ellipse cx="20" cy="24" rx="10" ry="8" fill="url(#firebox)"/>
  ${pixels(FLAME, 13, 17)}
  ${pixels(['Y'], 16, 15)}${pixels(['O'], 23, 14)}${pixels(['r'], 19, 13)}
  ${dress.mantel}
  ${pixels(['w', 'w', 'w', 'w'], 5, -4)}${pixels(['ww', 'ww', 'ww', 'ww', 'ww', 'ww'], 8, -6)}
  ${pixels(['ww', 'ww', 'ww', 'ww', 'ww'], 31, -5)}
  ${CANDLE_FLAMES}
  ${pixels(WALL_CLOCK, 14, -47)}
  ${COCOA}
  ${dress.hearthside}`

// A rocking chair seen from the side, facing the fire on its right, 20 wide
// and 26 tall. Its back leans away from the fire, a plaid blanket hangs over
// it, and a red cushion sits on the seat. The fire lights the edges that face
// it.
const ROCKER = (() => {
  const g = grid(20, 26)

  // The runner, curving up at both ends.
  for (let x = 0; x < 20; x++) {
    const t = (x - 9.5) / 9.5
    const y = 23 - Math.round(2 * t * t)

    g.set(x, y, x > 9 ? 'H' : 'W')
    g.set(x, y + 1, 'M')
  }
  // Legs from the seat to the runner.
  for (let y = 18; y < 23; y++) {
    g.set(4, y, 'M')
    g.set(15, y, 'M')
    g.set(16, y, 'H')
  }
  // The seat, its edge lit, and a cushion on it.
  for (let x = 3; x < 18; x++) {
    g.set(x, 16, x === 17 ? 'H' : 'W')
    g.set(x, 17, 'L')
  }
  for (let x = 5; x < 16; x++) {
    g.set(x, 15, 'R')
    g.set(x, 14, x > 6 && x < 15 ? 's' : '.')
  }
  // The back post, leaning away from the fire, and the crest rail on top.
  for (let y = 0; y < 16; y++) {
    const x = 1 + Math.round((y * 3) / 15)

    g.set(x, y, 'M')
    g.set(x + 1, y, 'W')
  }
  g.set(0, 0, 'M')
  g.set(3, 0, 'W')
  // The arm, from the back to a turned post at the front of the seat.
  for (let x = 4; x < 18; x++) {
    g.set(x, 9, x > 12 ? 'H' : 'W')
    g.set(x, 10, 'M')
  }
  for (let y = 11; y < 16; y++) {
    g.set(16, y, 'M')
    g.set(17, y, 'H')
  }
  // A plaid blanket thrown over the back: it hangs down behind the chair and a
  // little way down the front, with a fringe at the bottom.
  for (let y = 1; y < 13; y++) {
    const post = 1 + Math.round((y * 3) / 15)
    const right = y < 7 ? post + 4 : post + 2

    for (let x = 0; x <= right; x++) {
      const stripe = x === 2 || x === 3 || y % 4 === 0

      g.set(x, y, y === 1 || x === right ? 's' : stripe ? 'J' : 'E')
    }
  }
  for (let x = 0; x < 6; x += 2) {
    g.set(x, 13, 'u')
  }

  return pixels(g.rows())
})()

// A ball of purple yarn with a loose end trailing toward the cat.
const YARN = pixels(['.Vv..', 'VVVV.', 'VVVv.', '.VV.V', '....V'], 0, 0)

// A mouse peeking out of its hole in the wall, 9 wide and 6 tall.
const MOUSE_HOLE = pixels(['..MMMM...', '.MKKKKM..', 'MKKKKKp..', 'MKKKKZZZ.', 'MKKKZZKZp', 'MKKKKZZ..'])

// A tall window, 40 wide and 46 tall, with snow on pines under a moon. The
// panes run from 2 to 37 across and 2 to 40 down, split by a cross of mullions.
const WINDOW_W = 40
const WINDOW_H = 46
const PANES_W = WINDOW_W - 4
const PANES_BOTTOM = WINDOW_H - 6

const windowFrame = (snow: boolean) => {
  const g = grid(WINDOW_W, WINDOW_H)
  const midX = WINDOW_W / 2
  const midY = 1 + PANES_BOTTOM / 2

  for (let y = 0; y < WINDOW_H - 2; y++) {
    for (let x = 0; x < WINDOW_W; x++) {
      const edge = x < 2 || x > WINDOW_W - 3 || y < 2 || y > PANES_BOTTOM
      const mullion = x === midX - 1 || x === midX || y === midY || y === midY + 1

      if (edge || mullion) {
        g.set(x, y, x === 0 || y === 0 || x === midX - 1 || y === midY ? 'f' : 'F')
      }
    }
  }
  for (let x = 2; x < WINDOW_W - 2; x++) {
    g.set(x, PANES_BOTTOM, snow ? 'w' : 'F')
  }
  for (let x = -1; x < WINDOW_W + 1; x++) {
    g.set(x, WINDOW_H - 4, snow ? 'w' : 'f')
    g.set(x, WINDOW_H - 3, 'f')
    g.set(x, WINDOW_H - 2, 'F')
  }

  return g.rows()
}

const PINES = (() => {
  const g = grid(PANES_W, 16)
  const tree = (cx: number, h: number) => {
    for (let i = 0; i < h; i++) {
      const half = Math.floor(i / 2) + (i % 3 === 2 ? 0 : 1)

      for (let x = cx - half; x <= cx + half; x++) {
        g.set(x, 16 - h + i, x === cx - half ? 'n' : 'N')
      }
      // Snow resting on the tip and on the ends of every third row of branches.
      if (i === 0 || i % 3 === 1) {
        g.set(cx - half, 16 - h + i, 'w')
        g.set(cx + half, 16 - h + i, 'w')
      }
    }
  }
  tree(4, 11)
  tree(13, 16)
  tree(23, 10)
  tree(31, 13)

  return g.rows()
})()

// Snowflakes caught mid-fall, scattered over the panes. Every third one is
// fainter, as if farther away.
const FLAKES = Array.from({ length: 36 }, (_, i) => {
  const x = 3 + ((i * 7 + Math.floor(i / 4)) % (PANES_W - 1))
  const y = 3 + ((i * 11) % (PANES_BOTTOM - 4))

  return `<rect x="${x}" y="${y}" width="1" height="1" fill="#efe6d6"${i % 3 === 0 ? ' opacity=".55"' : ''}/>`
}).join('')

// A drift of snow along the bottom of the panes.
const DRIFT = [
  '..ww......www.......ww.......www....',
  'wwwww...wwwwwww...wwwwww...wwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
]

const SNOWMAN = pixels(['.KKK.', 'KKKKK', '.www.', '.kwk.', '.wOO.', 'RRRRR', 'wwwww', 'wwkww', 'wwwww'], 9, PANES_BOTTOM - 11)

// Santa's sleigh and a reindeer, lit by the moon as they fly past below it.
const SLEIGH = pixels(['X.X....X.', '.XX...XX.', 'XXXXXXXXX', 'X..X..X.X'], 23, 13)

// A paper snowflake taped to the glass.
const PAPER_SNOWFLAKES = pixels(['.qq..', 'w.w.w', '.www.', 'ww.ww', '.www.', 'w.w.w'], 4, 4)

// The snowy view: pines and a snowman in a drift, with snow falling. At
// Christmas, Santa's sleigh crosses below the moon at night.
const snowyView = (sleigh: boolean) => (daytime: boolean) => `
    ${!daytime && sleigh ? SLEIGH : ''}
    ${pixels(PINES, 2, PANES_BOTTOM - 16)}
    ${SNOWMAN}
    ${pixels(DRIFT, 2, PANES_BOTTOM - 3)}
    ${FLAKES}`

const CHRISTMAS_WREATH = pixels(
  ['..gGg..', '.GR.GG.', 'gG...Gg', 'G.....G', 'gG...Rg', '.GG.GG.', '..RwR..'],
  WINDOW_W / 2 - 4,
  PANES_BOTTOM / 2 - 2,
)

// The window: the sky, then the season's view and what is taped to the glass,
// then the frame and anything hung on it. By day the sky is pale and the sun
// glows low. By night the moon is up.
const windowWith = (dress: Dress, daytime: boolean) => `
  <g clip-path="url(#panes)">
    <rect x="2" y="2" width="${PANES_W}" height="${PANES_BOTTOM - 1}" fill="url(#${daytime ? 'day' : 'night'})"/>
    ${
      daytime
        ? '<circle cx="31" cy="10" r="12" fill="url(#sunlight)"/>'
        : `<circle cx="32" cy="7" r="9" fill="url(#moonlight)"/>${pixels(['.yyyy.', 'yyyyyy', 'yyyyyy', 'yyyyyy', 'yyyyyy', '.yyyy.'], 29, 4)}`
    }
    ${dress.view(daytime)}
    ${dress.onGlass}
  </g>
  ${pixels(windowFrame(dress.snowySill))}
  ${dress.wreath}`

// Round trees seen through the window, the width of the panes and 22 tall. The
// season picks the colors of the crowns and of the light on their upper right.
const roundTrees = (tones: string[], lit: string) => {
  const g = grid(PANES_W, 22)
  const tree = (cx: number, cy: number, rx: number, ry: number) => {
    for (let y = cy; y < 22; y++) {
      g.set(cx, y, 'k')
    }
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx + 0.5) + (y * y) / (ry * ry + 0.5) <= 1) {
          const edge = x > 0 && y < 0 && (x * x) / (rx * rx) + (y * y) / (ry * ry) > 0.45

          // Leaves in clumps two pixels across, so the crown reads as foliage.
          const clump = Math.floor((x + 20) / 2) * 7 + Math.floor((y + 20) / 2) * 3 + cx

          g.set(cx + x, cy + y, edge ? lit : (tones[clump % tones.length] ?? 'o'))
        }
      }
    }
  }
  tree(5, 12, 5, 5)
  tree(15, 8, 6, 6)
  tree(26, 13, 4, 4)
  tree(32, 9, 5, 6)

  return g.rows()
}

// The autumn view: round trees in reds and golds over grass, with leaves
// falling past the glass. By night the colors darken under the moon.
const autumnTrees = (daytime: boolean) =>
  roundTrees(daytime ? ['o', 'R', 'Q', 't', 'o'] : ['t', 'e', 't', 'd', 'e'], daytime ? 'Q' : 'o')

// Three rows of grass along the bottom of the panes, dotted with what lies in
// it: fallen leaves or flowers.
const ground = (grass: string, dots: string[]) => {
  const g = grid(PANES_W, 3)

  for (let x = 0; x < PANES_W; x++) {
    if (x % 7 === 2 || x % 11 === 5) {
      g.set(x, 0, grass)
    }
    g.set(x, 1, x % 5 === 1 ? (dots[x % dots.length] ?? grass) : grass)
    g.set(x, 2, x % 3 === 0 ? (dots[(x + 1) % dots.length] ?? grass) : grass)
  }

  return g.rows()
}

const AUTUMN_GROUND = ground('x', AUTUMN_LEAVES)

// Bits of color drifting down past the glass, fainter at night.
const drifting = (colors: string[], count: number) => (daytime: boolean) =>
  Array.from({ length: count }, (_, i) => {
    const x = 3 + ((i * 9 + Math.floor(i / 3)) % (PANES_W - 2))
    const y = 4 + ((i * 13) % (PANES_BOTTOM - 8))
    const fill = PALETTE[colors[i % colors.length] ?? 'o']

    return `<rect x="${x}" y="${y}" width="${i % 2 ? 2 : 1}" height="1" fill="${fill}"${daytime ? '' : ' opacity=".6"'}/>`
  }).join('')

const FALLING_LEAVES = drifting(AUTUMN_LEAVES, 16)

// Geese flying south in a V, dark against the day sky and lit by the moon at
// night.
const geese = (daytime: boolean) =>
  pixels(['.....k', '...k..', '.k....', '...k..', '.....k'].map(row => (daytime ? row : row.replace(/k/g, 'X'))), 22, 14)

// A handprint turkey made at school, taped to the glass.
const HAND_TURKEY = pixels(['..qq...', 'R.o.Q..', 'R.o.Q.c', 'RooQQcc', '.cccccD', '.cccc..', '..d.d..'], 4, 4)

const AUTUMN_WREATH = ['..gGg..', '.GR.GG.', 'gG...Gg', 'G.....G', 'gG...Rg', '.GG.GG.', '..RwR..'].map(row =>
  row.replace(/[gGRw]/g, c => ({ g: 'R', G: 'o', R: 'Q', w: 't' })[c] ?? c),
)

const autumnView = (daytime: boolean) => `
    ${geese(daytime)}
    ${pixels(autumnTrees(daytime), 2, PANES_BOTTOM - 22)}
    ${pixels(AUTUMN_GROUND, 2, PANES_BOTTOM - 3)}
    ${FALLING_LEAVES(daytime)}`

// Corn stalks tied in a bundle behind a hay bale, with pumpkins and a gourd
// on the bale and more pumpkins on the floor. It stands where the Christmas
// tree goes, in the same 46 by 44.
const HARVEST = (() => {
  const g = grid(46, 44)
  const cx = 14
  const tie = 24
  const put = (rows: string[], x0: number, y0: number) =>
    rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && g.set(x0 + x, y0 + y, c)))

  for (let k = -4; k <= 4; k++) {
    const top = 2 + Math.abs(k) + (k % 2 === 0 ? 0 : 2)
    const color = k % 2 === 0 ? 'I' : 'i'
    const side = k < 0 ? -1 : 1

    for (let y = top; y < 44; y++) {
      const x =
        y < tie
          ? Math.round(cx + (k * 0.5) + ((k * 1.6) * (tie - y)) / (tie - top))
          : Math.round(cx + (k * 0.5) + (k * 0.6 * (y - tie)) / (43 - tie))

      g.set(x, y, color)

      // A leaf curling out and down from the stalk.
      if (k !== 0 && Math.abs(k) % 2 === 0 && y - top === 7) {
        g.set(x + side, y, 'i')
        g.set(x + 2 * side, y + 1, 'i')
        g.set(x + 3 * side, y + 1, 'i')
        g.set(x + 4 * side, y + 2, 'i')
      }
    }
    g.set(Math.round(cx + k * 2.1), top - 1, 'z')
  }
  for (let x = cx - 4; x <= cx + 4; x++) {
    g.set(x, tie, 'd')
    g.set(x, tie + 1, 'L')
  }
  for (let y = 35; y < 44; y++) {
    for (let x = 0; x < 28; x++) {
      const band = x === 7 || x === 20
      const shade = y === 43 || (x * 3 + y * 2) % 7 === 0

      g.set(x, y, band ? 'd' : y === 35 ? 'D' : shade ? 'D' : 'z')
    }
  }
  put(BIG_PUMPKIN, 9, 29)
  put(SMALL_PUMPKIN, 20, 31)
  put(GOURD, 2, 31)
  put(BIG_PUMPKIN, 30, 38)
  put(SMALL_PUMPKIN, 40, 40)
  put(['R.', '.Q'], 28, 42)
  put(['t'], 44, 39)

  return g.rows()
})()

// The winter corner, where the tree stood, in the same 46 by 44: a coat rack
// with a knitted hat and a striped scarf, ice skates hanging from a peg by
// their laces, snow boots by the door and a basket of firewood.
const WINTER_CORNER = (() => {
  const g = grid(46, 44)
  const put = (rows: string[], x0: number, y0: number) =>
    rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && g.set(x0 + x, y0 + y, c)))

  // The coat rack: a turned pole on a foot, with pegs near the top.
  for (let y = 5; y < 42; y++) {
    g.set(8, y, 'L')
    g.set(9, y, 'l')
  }
  put(['l........l', '.llllllll.'], 4, 8)
  put(['..LLLLLL..', 'LLLLLLLLLL'], 4, 42)
  put(['...w..', '.UUUU.', 'UUUUUU', 'UwUUwU', 'wwwwww'], 6, 1)
  for (let y = 9; y < 31; y++) {
    put([(y - 9) % 5 === 4 ? 'www' : 'RRR'], 3, y)
  }
  put(['u.u.u', '.u.u.'], 2, 31)

  // A peg on the wall, and the skates hanging from it by their laces.
  put(['LL'], 21, 4)
  put(['.w...w', 'w.....w', 'w......w', 'w.......w'], 17, 5)
  const skate = ['wwww..', 'wwww..', 'wwwwww', 'wwwwww', 'X.X.X.', 'XXXXXX']

  put(skate, 13, 9)
  put(skate.map(row => [...row].reverse().join('')), 23, 9)

  // A pair of snow boots with fur cuffs.
  const boot = ['uuuu..', 'cccc..', 'cccc..', 'cccc..', 'cccccc', 'ccccCC', 'kkkkkk']

  put(boot, 14, 37)
  put(boot, 21, 37)

  // A woven basket of split logs.
  for (let y = 36; y < 44; y++) {
    for (let x = 30; x < 44; x++) {
      g.set(x, y, y === 36 || y === 43 ? 'd' : (x + y) % 3 === 0 ? 'd' : 'D')
    }
  }
  put(['..LlL.LlL...', '.LlLLlLLlLL.', 'LlLLLlLLlLlL'], 31, 33)

  return g.rows()
})()

// Paper snowflakes hung on threads from the ceiling, at different heights.
const SNOWFLAKE_MOBILE = (() => {
  let out = ''

  for (let x = 6, i = 0; x < 400; x += 22, i++) {
    const drop = 1 + ((i * 5) % 4)

    out += `<rect x="${x + 2.25}" y="0" width=".5" height="${drop}" fill="#6e4426"/>`
    out += pixels(i % 2 ? ['..w..', 'w.w.w', '.www.', 'w.w.w', '..w..'] : ['w.w.w', '.www.', 'ww.ww', '.www.', 'w.w.w'], x, drop)
  }

  return out
})()

// A Christmas tree with a glowing star and lit ornaments, a skirt, and
// presents piled beside it. 46 wide and 44 tall. From Christmas Day the
// presents are open, a teddy bear sits up in one, and ribbon lies on the floor.
const tree = (opened: boolean) => {
  const g = grid(46, 44)
  const cx = 14
  const tiers: [number, number, number, number][] = [
    [4, 10, 1, 6],
    [11, 12, 3, 10],
    [19, 15, 5, 13],
  ]

  for (const [top, h, from, to] of tiers) {
    for (let i = 0; i < h; i++) {
      const half = Math.round(from + ((to - from) * i) / (h - 1))

      for (let x = cx - half; x <= cx + half; x++) {
        g.set(x, top + i, i === h - 1 ? 'N' : x >= cx + half - 1 || (x + i) % 7 === 0 ? 'g' : 'G')
      }
    }
  }
  for (let y = 34; y < 38; y++) {
    for (let x = 12; x < 17; x++) {
      g.set(x, y, 'L')
    }
  }
  for (let x = 4; x < 25; x++) {
    g.set(x, 38, 'R')
    g.set(x, 39, 'R')
    g.set(x, 40, x % 2 ? 'w' : 'R')
  }
  const present = (x0: number, y0: number, w: number, h: number, box: string, ribbon: string) => {
    const mid = x0 + Math.floor(w / 2)

    if (opened) {
      // The lid is off: the box is two rows shorter, dark inside at the top.
      for (let y = y0 + 2; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
          g.set(x, y, y === y0 + 2 && x > x0 && x < x0 + w - 1 ? 'K' : box)
        }
      }

      return
    }
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        g.set(x, y, x === mid || y === y0 + Math.floor(h / 2) ? ribbon : box)
      }
    }
    g.set(mid - 1, y0 - 1, ribbon)
    g.set(mid + 1, y0 - 1, ribbon)
  }
  present(0, 37, 8, 7, 'R', 'Q')
  present(20, 36, 10, 8, 'U', 'Q')
  present(30, 39, 7, 5, 'P', 'R')
  present(37, 34, 8, 10, 'V', 'Q')

  if (opened) {
    const put = (rows: string[], x0: number, y0: number) =>
      rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && g.set(x0 + x, y0 + y, c)))

    // A teddy bear sitting up in the blue box.
    put(['C..C', 'CCCC', 'CkkC', 'CCCC', 'CCCC'], 23, 34)
    // Loose ribbon on the floor.
    put(['Q.Q', '.Q.'], 9, 42)
    put(['RR.R'], 31, 43)
  }

  return g.rows()
}

const ORNAMENTS = ([
  [12, 8],
  [16, 11],
  [9, 15],
  [15, 17],
  [19, 20],
  [8, 23],
  [13, 24],
  [18, 26],
  [22, 29],
  [5, 30],
  [11, 31],
  [16, 32],
  [23, 32],
] as [number, number][])
  .map(([x, y], i) => bulb(x, y, 1, 1, i, 1.6))
  .join('')

const christmasTree = (opened: boolean) => `
  <circle cx="14.5" cy="2.5" r="7" fill="url(#warm)"/>
  ${pixels(tree(opened))}
  ${ORNAMENTS}
  ${pixels(['..Q..', '.QQQ.', 'QQyQQ', '.QQQ.', '.Q.Q.'], 12, 0)}`

// An orange tabby curled up asleep by the fire, 16 wide and 8 tall: ears up,
// eyes shut, a white chin, stripes along its back and its tail wrapped round.
const CAT = pixels([
  '.c..c...........',
  '.CccC...cccc....',
  'CkCCkC.cCCcCCc..',
  'CCCCCCcCCCCCCCc.',
  'pwCCCCCCcCCCcCCc',
  '.wwCCCCCCCCCCCCc',
  '..ccCCCCCCCCCcc.',
  '...ccccccccccc..',
])

// The room around everything. The wall has wainscot panels below a chair rail
// and a baseboard, and the floor recedes: each row of boards is shorter and its
// planks shorter the farther back it is, the way a floor looks in perspective.
// Above the chair rail is a striped wallpaper with a small diamond. Each piece
// is drawn far to the left and far up so it fills any shape of window.
const FLOOR_ROWS: [number, number, number, number][] = [
  // top, height, plank length, where the first seam falls
  [126, 1, 9, 3],
  [127, 1, 10, 8],
  [128, 2, 12, 2],
  [130, 2, 14, 10],
  [132, 3, 17, 5],
  [135, 3, 20, 15],
  [138, 4, 24, 6],
]
const FLOOR_TONES = ['#2a1810', '#301c13']

const roomDefs = () => `
  <pattern id="wall" x="1" y="2" width="6" height="8" patternUnits="userSpaceOnUse">
    <rect width="6" height="8" fill="#1a1210"/><rect width="3" height="8" fill="#1c1311"/>
    <rect x="4" y="3" width="1" height="3" fill="#201612"/><rect x="3" y="4" width="3" height="1" fill="#201612"/>
  </pattern>
  <pattern id="panel" y="100" width="24" height="21" patternUnits="userSpaceOnUse">
    <rect width="24" height="21" fill="#1b120e"/>
    <rect x="3" y="3" width="18" height="1" fill="#130b08"/><rect x="3" y="3" width="1" height="15" fill="#130b08"/>
    <rect x="3" y="17" width="18" height="1" fill="#2a1b14"/><rect x="20" y="3" width="1" height="15" fill="#2a1b14"/>
  </pattern>
  ${FLOOR_ROWS.map(
    ([top, height, length, seam], i) =>
      `<pattern id="boards${i}" x="${seam}" y="${top}" width="${length}" height="${height}" patternUnits="userSpaceOnUse"><rect width="${length}" height="${height}" fill="${FLOOR_TONES[i % 2]}"/><rect width="1" height="${height}" fill="#160d09"/>${height > 2 ? `<rect x="1" width="${length - 1}" height="1" fill="#3a2318"/>` : ''}</pattern>`,
  ).join('')}
  <pattern id="boardsNear" x="6" y="142" width="24" height="8" patternUnits="userSpaceOnUse">
    <rect width="24" height="8" fill="${FLOOR_TONES[0]}"/><rect y="4" width="24" height="4" fill="${FLOOR_TONES[1]}"/>
    <rect width="1" height="4" fill="#160d09"/><rect x="12" y="4" width="1" height="4" fill="#160d09"/>
    <rect x="1" width="23" height="1" fill="#3a2318"/><rect y="4" width="12" height="1" fill="#3a2318"/><rect x="13" y="4" width="11" height="1" fill="#3a2318"/>
  </pattern>
  <radialGradient id="spill">
    <stop offset="0" stop-color="#ff9a3a" stop-opacity=".24"/>
    <stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/>
  </radialGradient>`

const ROOM_LEFT = -1600
const ROOM_WIDTH = 1820

const room = (withPanels: boolean) => `
  <rect x="${ROOM_LEFT}" y="-700" width="${ROOM_WIDTH}" height="${withPanels ? 798 : 821}" fill="url(#wall)"/>
  ${withPanels ? `<rect x="${ROOM_LEFT}" y="100" width="${ROOM_WIDTH}" height="21" fill="url(#panel)"/>
  <rect x="${ROOM_LEFT}" y="98" width="${ROOM_WIDTH}" height="1" fill="#3a2417"/>
  <rect x="${ROOM_LEFT}" y="99" width="${ROOM_WIDTH}" height="1" fill="#24160f"/>` : ''}
  <rect x="${ROOM_LEFT}" y="121" width="${ROOM_WIDTH}" height="1" fill="#3a2417"/>
  <rect x="${ROOM_LEFT}" y="122" width="${ROOM_WIDTH}" height="3" fill="#24160f"/>
  <rect x="${ROOM_LEFT}" y="125" width="${ROOM_WIDTH}" height="1" fill="#120a07"/>
  ${FLOOR_ROWS.map(
    ([top, height], i) => `<rect x="${ROOM_LEFT}" y="${top}" width="${ROOM_WIDTH}" height="${height}" fill="url(#boards${i})"/>`,
  ).join('')}
  <rect x="${ROOM_LEFT}" y="142" width="${ROOM_WIDTH}" height="320" fill="url(#boardsNear)"/>`

// A rag rug in front of the fire, wider toward the viewer: a green border
// round a red field with two cream stripes, and a fringe at the near edge.
const rug = (cx: number, top: number, half: number) => {
  let out = ''

  for (let row = 0; row < 10; row++) {
    const left = cx - half - 2 * row
    const width = 2 * (half + 2 * row)

    out += `<rect x="${left}" y="${top + row}" width="${width}" height="1" fill="#2c4a33"/>`

    if (row > 0 && row < 9) {
      const fill = row === 3 || row === 6 ? '#b39c7c' : '#7a2a22'

      out += `<rect x="${left + 2}" y="${top + row}" width="${width - 4}" height="1" fill="${fill}"/>`
    }
  }
  for (let x = cx - half - 18; x < cx + half + 18; x += 2) {
    out += `<rect x="${x + 1}" y="${top + 10}" width="1" height="1" fill="#b39c7c"/>`
  }

  return out
}

// The shadow the fire throws to the left of something standing on the floor,
// from its left edge, its width and the row its base rests on.
const shadow = (x: number, width: number, base: number) =>
  `<rect x="${x - 3}" y="${base}" width="${width}" height="1" fill="#000" fill-opacity=".4"/>` +
  `<rect x="${x - 7}" y="${base + 1}" width="${width}" height="1" fill="#000" fill-opacity=".22"/>`

// Everything round the fire: the hearth, the rug, the rocking chair, the yarn
// and the cat, with their shadows. The hearth's left edge is at x 136 and the
// floor it stands on starts at y 125.
const fireside = () => `
  <use href="#hearth" transform="translate(136 91)"/>
  ${rug(134, 127, 22)}
  <ellipse cx="156" cy="128" rx="62" ry="11" fill="url(#spill)"/>
  ${shadow(97, 20, 131)}${shadow(120, 5, 131)}${shadow(123, 16, 131)}
  <g transform="translate(97 106)">${ROCKER}</g>
  <g transform="translate(118 127)">${YARN}</g>
  <use href="#cat" transform="translate(123 124)"/>`

// The back of a wingback armchair close to the viewer, facing the fire, with a
// plaid blanket over it. It is dark and cut off by the edges of the screen,
// which puts it in front of everything else. The fire, up and to its left,
// rims its top and left edges with light. 54 wide and 30 tall.
const ARMCHAIR = (() => {
  const W = 54
  const H = 30
  const g = grid(W, H)
  const span = (y: number): [number, number] => {
    if (y < 12) {
      const inset = [5, 3, 2, 1][y] ?? 0

      return [12 + inset, 41 - inset]
    }

    return y === 12 ? [3, 50] : y === 13 ? [1, 52] : [0, W - 1]
  }

  for (let y = 0; y < H; y++) {
    const [from, to] = span(y)

    for (let x = from; x <= to; x++) {
      g.set(x, y, x > to - 8 || y > 22 ? 'A' : 'a')
    }
  }
  // Seams down the back, and the line where each arm rolls over.
  for (let y = 4; y < 12; y++) {
    g.set(18, y, 'A')
    g.set(35, y, 'A')
  }
  for (const x of [11, 42]) {
    for (let y = 14; y < 24; y++) {
      g.set(x, y, 'A')
    }
  }
  // Firelight along the top edge and down the left side.
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (span(y)[0] <= x && x <= span(y)[1]) {
        g.set(x, y, x < 30 ? 'H' : 'j')
        break
      }
    }
  }
  for (let y = 1; y < H; y++) {
    g.set(span(y)[0], y, y < 18 ? 'H' : 'j')
  }
  // A plaid blanket over the back, its fringe hanging below.
  for (let y = 0; y < 21; y++) {
    for (let x = 20; x <= 33; x++) {
      const [from, to] = span(y)

      if (x < from || x > to) {
        continue
      }
      const stripe = x === 25 || x === 26 || x === 30 || y % 6 === 4

      g.set(x, y, y === 0 ? 's' : x === 20 ? 's' : stripe ? 'J' : 'E')
    }
  }
  for (let x = 20; x <= 33; x += 2) {
    g.set(x, 21, 'u')
  }

  return g.rows()
})()

// The ceiling, seen from below: rows of boards that get thinner toward the
// back wall, and a crown moulding where it meets the wall. It is drawn at the
// same size as the string of lights, which hangs from the moulding.
const CEILING_ROWS: [number, number, number, number][] = [
  // top, height, plank length, where the first seam falls
  [0, 4, 26, 9],
  [4, 3, 21, 3],
  [7, 2, 17, 12],
  [9, 2, 14, 6],
  [11, 1, 11, 2],
]
const CEILING_TONES = ['#1c110c', '#21150e']

const ceilingDefs = () =>
  CEILING_ROWS.map(
    ([top, height, length, seam], i) =>
      `<pattern id="ceiling${i}" x="${seam}" y="${top}" width="${length}" height="${height}" patternUnits="userSpaceOnUse"><rect width="${length}" height="${height}" fill="${CEILING_TONES[i % 2]}"/><rect width="1" height="${height}" fill="#100906"/>${height > 2 ? `<rect x="1" y="${height - 1}" width="${length - 1}" height="1" fill="#2a1a12"/>` : ''}</pattern>`,
  ).join('')

const CEILING = `${CEILING_ROWS.map(
  ([top, height], i) => `<rect y="${top}" width="800" height="${height}" fill="url(#ceiling${i})"/>`,
).join('')}
  <rect y="12" width="800" height="1" fill="#120a07"/>
  <rect y="13" width="800" height="1" fill="#2e1c12"/>
  <rect y="14" width="800" height="1" fill="#4a2c1a"/>`

// Lights strung along the top edge: a sagging wire, a bulb at each low point.
const LIGHTS = (() => {
  const span = 16
  let wire = ''
  let bulbs = ''

  for (let x = 0; x < 400; x++) {
    const t = ((x % span) - span / 2) / (span / 2)
    const y = 1 + Math.round(3 * (1 - t * t))

    wire += `${x === 0 ? 'M' : 'L'}${x} ${y + 0.5}H${x + 1}`
  }
  for (let x = span / 2, i = 0; x < 400; x += span, i++) {
    bulbs += `<rect x="${x - 0.5}" y="5" width="2" height="1" fill="#1c1410"/>${bulb(x - 0.5, 6, 2, 3, i, 4)}`
  }

  // A sprig of mistletoe on a thread from a high point of the wire.
  const mistletoe = `<rect x="112.25" y="1.5" width=".5" height="3.5" fill="#1f3a26"/>${pixels(['.R.R.', 'gGRGg', 'GwGwG', '.GgG.', '..w..'], 110, 5)}`

  return `<path d="${wire}" fill="none" stroke="#1f3a26" stroke-width="1"/>${bulbs}${mistletoe}`
})()

// The other seasons hang a string in the same sags as the lights, with
// something tied on every few pixels. The charm gets its x, its count along
// the string and the height of the string there.
const sag = (x: number) => {
  const t = ((x % 16) - 8) / 8

  return 1 + Math.round(3 * (1 - t * t))
}

const strung = (string: string, from: number, every: number, charm: (x: number, i: number, y: number) => string) => {
  let wire = ''
  let charms = ''

  for (let x = 0; x < 400; x++) {
    wire += `${x === 0 ? 'M' : 'L'}${x} ${sag(x) + 0.5}H${x + 1}`
  }
  for (let x = from, i = 0; x < 400; x += every, i++) {
    charms += charm(x, i, sag(x))
  }

  return `<path d="${wire}" fill="none" stroke="${string}" stroke-width="1"/>${charms}`
}

// In autumn a twine garland, strung with leaves.
const LEAF_GARLAND = strung('#6e4426', 2, 4, (x, i, y) => {
  const c = AUTUMN_LEAVES[i % 4] ?? 'o'

  return pixels(i % 2 ? [`${c}${c}`, `.${c}`] : [`${c}${c}`, `${c}.`], x, y + 1)
})

// In spring, cloth bunting on a cord: three pennants to each sag, in the
// colors of the spring flowers and leaves.
const BUNTING = strung('#b39c7c', 3, 4, (x, i, y) => {
  if (x % 16 === 15) {
    return ''
  }
  const c = ['3', 'Y', '4', '2', '1'][i % 5] ?? '3'

  return pixels([`${c}${c}${c}`, `${c}${c}${c}`, `.${c}.`], x - 1, y + 1)
})

// In summer, round paper lanterns, lit, one at the bottom of each sag.
const LANTERNS = strung('#3a2418', 8, 16, (x, i) => {
  const c = ['R', 'o', 'Q', '3'][i % 4] ?? 'R'
  const rows = ['..k..', '.###.', '##Y##', '##Y##', '.###.', '..k..'].map(row => row.replace(/#/g, c))

  return `<circle cx="${x + 0.5}" cy="9.5" r="6" fill="url(#warm)"/>${pixels(rows, x - 2, 5)}`
})

// A pixel font, 5 rows tall, for the New Year banner.
const LETTERS: Record<string, string[]> = {
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  A: ['###', '#.#', '###', '#.#', '#.#'],
  P: ['###', '#.#', '###', '#..', '#..'],
  Y: ['#.#', '#.#', '###', '.#.', '.#.'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  E: ['###', '#..', '###', '#..', '###'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  R: ['###', '#.#', '##.', '#.#', '#.#'],
}

// "HAPPY NEW YEAR" on pennants along a cord, 120 wide and 11 tall.
const BANNER = (() => {
  const flags = ['R', 'P', 'Q', 'U']
  let out = '<rect x="2" y="0" width="116" height="1" fill="#1f3a26"/>'
  let slot = 0

  for (const ch of 'HAPPY NEW YEAR') {
    const x0 = 4 + slot * 8
    const glyph = LETTERS[ch]

    slot++
    if (glyph === undefined) {
      continue
    }
    const flag = flags[slot % 4] ?? 'R'
    const ink = flag === 'Q' ? 'k' : 'w'
    const width = glyph[0]?.length ?? 3
    const pad = Math.floor((7 - width) / 2)

    out += pixels([...Array(7).fill(flag.repeat(7)), `.${flag.repeat(5)}.`, `..${flag.repeat(3)}..`, `...${flag}...`], x0, 1)
    out += pixels(
      glyph.map(row => row.replace(/#/g, ink)),
      x0 + pad,
      2,
    )
  }

  return out
})()

const put = (g: ReturnType<typeof grid>, rows: string[], x0: number, y0: number) =>
  rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && g.set(x0 + x, y0 + y, c)))

// Spring flowers: pink, pale pink, yellow and lilac.
const SPRING_FLOWERS = ['3', '2', 'Y', 'v']

// Strands of ivy trailing from the mantel, each ending in a blossom.
const IVY_SHORT = ['G.', 'gG', '.g', '.3']
const IVY_LONG = ['.G', 'Gg', 'g.', 'gG', '.g', 'G.', '2.']

// On the mantel in spring: a seedling in a clay pot, a glass vase of tulips and
// a bird's nest with three blue eggs.
const SPRING_MANTEL = [
  pixels(['11.1', '.1g1', '..g.', '9999', '.90.'], 0, -5),
  pixels(
    [
      '...Y.Y...',
      '3.3YYY2.2',
      '333YYY222',
      '333.g.222',
      '.g..g..g.',
      '..g.g.g..',
      '..UUUUU..',
      '..U4UUU..',
      '..U4UUU..',
      '...UUU...',
    ],
    11,
    -10,
  ),
  pixels(['..4.4...', '.44444..', 'DdDdDdDd', 'dDdDdDdD', '.dDdDdD.'], 21, -5),
].join('')

// A green watering can on the hearth, its long spout reaching up to a brass
// rose on the right.
const WATERING_CAN = pixels(
  ['..PPP......', '.P...P...QQ', 'PPPPPPP..QQ', 'PgPPPPP.P..', 'PgPPPPPP...', 'PPPPPPP....', 'GGGGGGG....'],
  29,
  23,
)

// Swallows over the blossom by day.
const SWALLOWS = `${pixels(['k...k', '.k.k.', '..k..'], 19, 12)}${pixels(['k.k', '.k.'], 11, 8)}`

const FALLING_PETALS = drifting(['2', '3'], 12)

// The spring view: trees in blossom over new grass dotted with flowers, petals
// drifting past and swallows in the day sky.
const springView = (daytime: boolean) => `
    ${daytime ? SWALLOWS : ''}
    ${pixels(roundTrees(daytime ? ['3', '2', '3', '1', '2'] : ['5', 'N', '5', 'n', '5'], daytime ? '2' : 'p'), 2, PANES_BOTTOM - 22)}
    ${pixels(ground(daytime ? '1' : 'J', daytime ? SPRING_FLOWERS : ['5', 'i']), 2, PANES_BOTTOM - 3)}
    ${FALLING_PETALS(daytime)}`

// A paper butterfly taped to the glass.
const PAPER_BUTTERFLY = pixels(['...q...', '33.k.33', '323k323', '.33k33.', '.3.k.3.'], 4, 4)

// A wreath of leaves and flowers on the window's crossbar.
const SPRING_WREATH = pixels(
  ['..gGg..', '.GR.GG.', 'gG...Gg', 'G.....G', 'gG...Rg', '.GG.GG.', '..RwR..'].map(row =>
    row.replace(/[gGRw]/g, c => ({ g: '1', G: 'g', R: '3', w: 'Y' })[c] ?? c),
  ),
  WINDOW_W / 2 - 4,
  PANES_BOTTOM / 2 - 2,
)

// The spring corner, in the same 46 by 44 as the tree: a furled umbrella in a
// stoneware stand, yellow rain boots, and a big leafy plant in a clay pot.
const SPRING_CORNER = (() => {
  const g = grid(46, 44)

  // The umbrella's hooked handle, its shaft, and the furled canopy.
  put(g, ['.LL.', 'L..L', 'L..L', '...L'], 4, 4)
  for (let y = 8; y < 13; y++) {
    g.set(7, y, 'L')
  }
  for (let y = 13; y < 38; y++) {
    const half = y < 20 ? Math.round((y - 13) / 2.5) : Math.round((37 - y) / 6)

    for (let x = 7 - half; x <= 7 + half; x++) {
      g.set(x, y, x === 7 + half || (x === 7 - half + 1 && half > 1) ? 'v' : 'V')
    }
  }
  put(g, ['vvvvvvv'], 4, 24)

  // The stand.
  for (let y = 29; y < 44; y++) {
    for (let x = 2; x < 13; x++) {
      g.set(x, y, y === 29 ? 'Z' : y === 32 || y === 40 ? 'S' : x === 12 ? 'S' : 'T')
    }
  }

  // A pair of rain boots.
  const boot = ['YYYY...', 'YQYY...', 'YYYY...', 'YYYY...', 'YYYY...', 'YYYYYY.', 'YYYYYYY', 'QQQQQQQ', 'kkkkkkk']

  put(g, boot, 15, 35)
  put(g, boot, 23, 35)

  // The plant: stems up from the pot to broad leaves.
  const leaves: [number, number, number, number][] = [
    [34, 22, 3, 2],
    [41, 20, 3, 2],
    [38, 14, 2, 3],
    [34, 29, 3, 2],
    [42, 27, 3, 2],
    [38, 23, 2, 2],
  ]

  for (const [lx, ly] of leaves) {
    const steps = Math.max(Math.abs(lx - 38), Math.abs(ly - 34))

    for (let s = 0; s <= steps; s++) {
      g.set(Math.round(38 + ((lx - 38) * s) / steps), Math.round(34 + ((ly - 34) * s) / steps), 'G')
    }
  }
  for (const [lx, ly, rx, ry] of leaves) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        const d = (x * x) / (rx * rx + 0.5) + (y * y) / (ry * ry + 0.5)

        if (d <= 1) {
          g.set(lx + x, ly + y, d > 0.6 ? 'G' : x < 0 && y < 0 ? '1' : 'g')
        }
      }
    }
  }
  for (let y = 34; y < 44; y++) {
    for (let x = 33; x < 44; x++) {
      const inset = y > 35 ? Math.floor((y - 35) / 4) : 0

      if (x >= 33 + inset && x <= 43 - inset) {
        g.set(x, y, y < 36 ? '9' : x >= 41 - inset ? '0' : '9')
      }
    }
  }

  return g.rows()
})()

// Summer things on the mantel: a starfish, a model sailboat on a stand and a
// jar of shells.
const SUMMER_MANTEL = [
  pixels(['..o..', 'ooooo', '.o.o.'], 0, -3),
  pixels(
    ['....R....', '....k....', '...wk....', '..wwk....', '.wwwkw...', 'wwwwkww..', '....k....', 'LLLLLLLLL', '.LlLLlLL.', '...MMM...'],
    12,
    -10,
  ),
  pixels(['.MMMM.', 'X....X', 'X.w..X', 'X2u3wX', 'Xwu2uX', '.XXXX.'], 23, -6),
].join('')

// A straw hat hung from the mantel, its ribbon trailing below the brim, and a
// string of shells.
const STRAW_HAT = ['....zzz....', '...zzzzz...', '...RRRRR...', 'zzzzzzzzzzz', '.IIIIIIRII.', '.......R...', '......R.R..']
const SHELL_STRING = ['.d.', 'www', '.w.', '.d.', '222', '.2.', '.d.', 'uuu', '.u.']

// A pitcher of lemonade and a glass on the hearth.
const LEMONADE = `${pixels(['XXXXX..', 'XYYYXX.', 'XYYYX.X', 'XYwYX.X', 'XYYYXX.', 'XYYYX..', 'XXXXX..'], 29, 23)}${pixels(['X.X', 'XYX', 'XYX', 'XXX'], 37, 26)}`

// Sunflowers standing in front of the trees, the width of the panes and 20 tall.
const sunflowers = (daytime: boolean) => {
  const g = grid(PANES_W, 20)
  const stem = daytime ? 'G' : 'N'
  const leaf = daytime ? 'g' : 'n'
  const head = ['.PPP.', 'PPdPP', 'PdddP', 'PPdPP', '.PPP.'].map(row => row.replace(/P/g, daytime ? 'Y' : 'i'))
  const flower = (x: number, top: number) => {
    for (let y = top + 5; y < 20; y++) {
      g.set(x, y, stem)
    }
    put(g, [`${leaf}${leaf}.`, `..${leaf}`], x - 2, top + 8)
    put(g, [`.${leaf}${leaf}`, `${leaf}..`], x, top + 11)
    put(g, head, x - 2, top)
  }
  flower(4, 4)
  flower(10, 8)
  flower(32, 6)

  return g.rows()
}

// Butterflies by day.
const BUTTERFLIES = `${pixels(['oo.oo', 'ookoo', '.o.o.'], 23, 15)}${pixels(['v.v', 'vkv'], 11, 16)}`

// Fireflies at night, each a speck with a soft glow.
const FIREFLIES = Array.from({ length: 9 }, (_, i) => {
  const x = 4 + ((i * 11) % 30)
  const y = 16 + ((i * 7) % 20)

  return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="2" fill="url(#firefly)"/><rect x="${x}" y="${y}" width="1" height="1" fill="#e6f57a"/>`
}).join('')

// The summer view: full green trees with sunflowers in front, butterflies by
// day and fireflies at night.
const summerView = (daytime: boolean) => `
    ${daytime ? BUTTERFLIES : ''}
    ${pixels(roundTrees(daytime ? ['g', '1', 'G', '1', 'g'] : ['N', 'n', 'J', 'N', 'n'], daytime ? '7' : 'n'), 2, PANES_BOTTOM - 22)}
    ${pixels(sunflowers(daytime), 2, PANES_BOTTOM - 20)}
    ${pixels(ground(daytime ? '1' : 'J', daytime ? ['Y', 'w', '3'] : ['i']), 2, PANES_BOTTOM - 3)}
    ${daytime ? '' : FIREFLIES}`

// A round stained-glass suncatcher stuck to the glass.
const SUNCATCHER = pixels(['..w..', '..k..', '.QQQ.', 'QR4RQ', 'Q4Y4Q', 'QR4RQ', '.QQQ.'], 6, 4)

// The summer corner, in the same 46 by 44: a fishing rod leaning on the wall
// with its float hanging from the tip, a tackle box, a beach ball and a picnic
// basket with a gingham cloth.
const SUMMER_CORNER = (() => {
  const g = grid(46, 44)

  for (let y = 3; y < 43; y++) {
    g.set(Math.round(12 - ((y - 3) * 6) / 40), y, y > 33 ? 'D' : y > 18 ? 'L' : 'M')
  }
  put(g, ['XX', 'XZ'], 9, 30)
  for (let y = 4; y < 12; y++) {
    g.set(13, y, 'Z')
  }
  put(g, ['.R.', 'RRR', 'www', '.w.'], 12, 12)
  put(
    g,
    ['...kkkkk....', '...k...k....', 'PPPPPPPPPPPP', 'PPPPPQQPPPPP', 'PPPPPPPPPPPP', 'GGGGGGGGGGGG', 'GGGGGGGGGGGG'],
    0,
    37,
  )

  // The beach ball, in six stripes round its pole, with a shine.
  for (let y = 33; y < 44; y++) {
    for (let x = 17; x < 30; x++) {
      const dx = x - 23
      const dy = y - 38

      if (dx * dx + dy * dy <= 30) {
        const sector = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 6) % 6
        const shine = Math.hypot(x - 21, y - 35) < 1.3

        g.set(x, y, shine ? 'w' : (['R', 'w', 'U', 'w', 'Y', 'w'][sector] ?? 'R'))
      }
    }
  }

  // The basket: a handle over a gingham lid and a woven body.
  for (let y = 26; y < 33; y++) {
    for (let x = 31; x < 46; x++) {
      if (Math.abs(Math.hypot(x - 38, y - 33) - 6) < 0.6) {
        g.set(x, y, 'D')
      }
    }
  }
  for (let y = 33; y < 36; y++) {
    for (let x = 30; x < 46; x++) {
      g.set(x, y, (x % 4 < 2) !== (y % 2 === 0) ? 'R' : 'w')
    }
  }
  for (let y = 36; y < 44; y++) {
    for (let x = 31; x < 45; x++) {
      g.set(x, y, y === 36 ? 'D' : y === 43 ? 'd' : (x + y) % 3 === 0 ? 'D' : 'z')
    }
  }

  return g.rows()
})()

// What a season puts in each spot of the room. Everything else, the walls,
// floor, ceiling, fireplace, clock, window frame and furniture, stays all year.
type Dress = {
  // The front edge of the mantel, one pixel for each x from 0 to 39.
  garland: (x: number) => string
  // Things hung from the mantel: their rows and the x they hang at.
  hung: [string[], number][]
  // What stands on the mantel, in fireplace coordinates (the mantel top is y 0).
  mantel: string
  // What sits on the hearth to the right of the fire.
  hearthside: string
  // What is outside the window, drawn over the sky inside the panes.
  view: (daytime: boolean) => string
  // What is taped to the glass.
  onGlass: string
  // Whether snow lies on the sill.
  snowySill: boolean
  // What hangs on the window's crossbar.
  wreath: string
  // The 46 by 44 corner by the window.
  corner: string
  // What hangs from the ceiling moulding, 400 wide and 14 tall.
  ceiling: string
}

const AUTUMN: Dress = {
  garland: x => AUTUMN_LEAVES[Math.floor(x / 2) % 4] ?? 'o',
  // A few leaves trail down from the garland.
  hung: [
    [['o', '.', 'R'], 7],
    [['.', 'Q'], 15],
    [['t', '.', '.', 'o'], 24],
    [['Q', '.', 'R'], 33],
  ],
  mantel: `${pixels(BIG_PUMPKIN, 12, -6)}${pixels(SMALL_PUMPKIN, 23, -4)}${pixels(GOURD, 1, -4)}`,
  hearthside: PIE,
  view: autumnView,
  onGlass: HAND_TURKEY,
  snowySill: false,
  wreath: pixels(AUTUMN_WREATH, WINDOW_W / 2 - 4, PANES_BOTTOM / 2 - 2),
  corner: pixels(HARVEST),
  ceiling: LEAF_GARLAND,
}

const christmasDress = (opened: boolean): Dress => ({
  garland: x => (x % 4 < 2 ? 'G' : 'g'),
  hung: [
    [STOCKING, 5],
    [STOCKING.map(row => [...row].reverse().join('').replace(/R/g, 'P')), 28],
  ],
  mantel: GARLAND_BULBS,
  hearthside: forSanta(opened),
  view: snowyView(true),
  onGlass: PAPER_SNOWFLAKES,
  snowySill: true,
  wreath: CHRISTMAS_WREATH,
  corner: christmasTree(opened),
  ceiling: LIGHTS,
})

const WINTER: Dress = {
  garland: () => 'M',
  hung: [
    [MITTEN, 5],
    [MITTEN.map(row => [...row].reverse().join('').replace(/R/g, 'U')), 29],
  ],
  mantel: SNOW_GLOBE,
  hearthside: WOODPILE,
  view: snowyView(false),
  onGlass: PAPER_SNOWFLAKES,
  snowySill: true,
  wreath: '',
  corner: pixels(WINTER_CORNER),
  ceiling: SNOWFLAKE_MOBILE,
}

const SPRING: Dress = {
  garland: x => (x % 6 === 3 ? (SPRING_FLOWERS[Math.floor(x / 6) % 4] ?? '3') : x % 3 === 1 ? 'g' : 'G'),
  hung: [
    [IVY_LONG, 3],
    [IVY_SHORT, 12],
    [IVY_SHORT, 26],
    [IVY_LONG, 35],
  ],
  mantel: SPRING_MANTEL,
  hearthside: WATERING_CAN,
  view: springView,
  onGlass: PAPER_BUTTERFLY,
  snowySill: false,
  wreath: SPRING_WREATH,
  corner: pixels(SPRING_CORNER),
  ceiling: BUNTING,
}

const SUMMER: Dress = {
  garland: () => 'M',
  hung: [
    [STRAW_HAT, 1],
    [SHELL_STRING, 34],
  ],
  mantel: SUMMER_MANTEL,
  hearthside: LEMONADE,
  view: summerView,
  onGlass: SUNCATCHER,
  snowySill: false,
  wreath: '',
  corner: pixels(SUMMER_CORNER),
  ceiling: LANTERNS,
}

const dressFor = (moment: Moment): Dress => {
  switch (moment.season) {
    case 'spring':
      return SPRING
    case 'summer':
      return SUMMER
    case 'autumn':
      return AUTUMN
    case 'winter':
      return WINTER
    case 'christmas':
      return christmasDress(moment.afterChristmas)
  }
}

// What the room shows depends on the local date and time when it is drawn.
export type Moment = {
  // Between 7 in the morning and 5 in the evening: a daytime sky.
  daytime: boolean
  // From Christmas Day on: presents open, cookies eaten.
  afterChristmas: boolean
  // New Year's Eve and New Year's Day: the banner is up.
  newYear: boolean
  // How the room is dressed. Spring runs from March 20 to June 20, and summer
  // from June 21 to September 21. Autumn runs from September 22 through
  // Thanksgiving, with pumpkins, leaves and a pie. Christmas starts the day
  // after Thanksgiving and runs through New Year's Day. Winter runs from
  // January 2 to March 19, with snow outside and nothing of Christmas left.
  season: Season
}

export type Season = 'spring' | 'summer' | 'autumn' | 'christmas' | 'winter'

// Thanksgiving is the fourth Thursday of November.
const thanksgivingDay = (year: number) => {
  const firstWeekday = new Date(year, 10, 1).getDay()

  return 1 + ((4 - firstWeekday + 7) % 7) + 21
}

export const momentAt = (date: Date): Moment => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()

  // The date as a number, so March 20 is 320.
  const md = month * 100 + day
  const season: Season =
    md >= 102 && md <= 319
      ? 'winter'
      : md >= 320 && md <= 620
        ? 'spring'
        : md >= 621 && md <= 921
          ? 'summer'
          : md >= 922 && md <= 1100 + thanksgivingDay(date.getFullYear())
            ? 'autumn'
            : 'christmas'

  return {
    season,
    daytime: hour >= 7 && hour < 17,
    afterChristmas: (month === 12 && day >= 25) || (month === 1 && day === 1),
    newYear: (month === 12 && day === 31) || (month === 1 && day === 1),
  }
}

// The room is laid out three ways, chosen by the shape of the scene's box.
// Wide, for a desktop window: the fireside is pinned to the bottom right and
// the window wall to the bottom left, 300px in to clear the sidebar, with the
// middle left clear for the conversation. Medium, for a squarer window: the
// whole room is drawn as one picture, so nothing can slide into anything else.
// Narrow, for a phone: the room is stacked to fit a tall screen.
export const scene = (moment: Moment) => {
  const dress = dressFor(moment)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" shape-rendering="crispEdges">
<style>
  .medium, .narrow { display: none }
  @media (max-aspect-ratio: 7/4) { .wide { display: none } .medium { display: inline } }
  @media (max-aspect-ratio: 4/5) { .medium { display: none } .narrow { display: inline } }
</style>
<defs>
  <radialGradient id="glow">
    <stop offset="0" stop-color="#ff9a3a" stop-opacity=".38"/>
    <stop offset=".5" stop-color="#e2672a" stop-opacity=".14"/>
    <stop offset="1" stop-color="#e2672a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="day" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6f9fcf"/><stop offset="1" stop-color="#c9dcea"/>
  </linearGradient>
  <radialGradient id="sunlight">
    <stop offset="0" stop-color="#fff6d8" stop-opacity=".8"/>
    <stop offset="1" stop-color="#fff6d8" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b1424"/><stop offset="1" stop-color="#1f3350"/>
  </linearGradient>
  <radialGradient id="firebox">
    <stop offset="0" stop-color="#ff8a2a" stop-opacity=".55"/>
    <stop offset="1" stop-color="#c2451f" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="warm">
    <stop offset="0" stop-color="#ffd35a" stop-opacity=".45"/>
    <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="firefly">
    <stop offset="0" stop-color="#e6f57a" stop-opacity=".55"/>
    <stop offset="1" stop-color="#e6f57a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moonlight">
    <stop offset="0" stop-color="#f3e3a1" stop-opacity=".3"/>
    <stop offset="1" stop-color="#f3e3a1" stop-opacity="0"/>
  </radialGradient>
  ${BULB_COLORS.map(
    (color, i) =>
      `<radialGradient id="halo${i}"><stop offset="0" stop-color="${color}" stop-opacity=".5"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
  ).join('')}
  <radialGradient id="dim" cx=".5" cy=".45" r=".75">
    <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/>
  </radialGradient>
  <clipPath id="panes"><rect x="2" y="2" width="${PANES_W}" height="${PANES_BOTTOM - 1}"/></clipPath>
  ${roomDefs()}
  ${ceilingDefs()}
  <g id="hearth">${hearth(dress)}</g>
  <g id="window">${windowWith(dress, moment.daytime)}</g>
  <g id="corner">${dress.corner}</g>
  <g id="cat">${CAT}</g>
  <g id="room">${room(true)}</g>
  <g id="fireside">${fireside()}</g>
  <g id="windowWall">
    <use href="#window" transform="translate(2 32)"/>
    <use href="#corner" transform="translate(0 81)"/>
    <g transform="translate(52 119)">${MOUSE_HOLE}</g>
  </g>
  <g id="armchair">${pixels(ARMCHAIR)}</g>
</defs>
<rect width="100%" height="100%" fill="#1a1210"/>
<svg class="wide" width="100%" height="100%" viewBox="0 0 200 140" preserveAspectRatio="xMaxYMax meet" overflow="visible">
  <use href="#room"/>
  <use href="#fireside"/>
</svg>
<svg class="wide" x="300" width="100%" height="100%" viewBox="0 0 200 140" preserveAspectRatio="xMinYMax meet" overflow="visible">
  <use href="#windowWall" transform="translate(6 0)"/>
</svg>
<svg class="wide" width="100%" height="100%" viewBox="0 0 200 140" preserveAspectRatio="xMaxYMax meet" overflow="visible">
  <use href="#armchair" transform="translate(160 116)"/>
</svg>
<svg class="medium" width="100%" height="100%" viewBox="0 0 200 140" preserveAspectRatio="xMaxYMax meet" overflow="visible">
  <use href="#room"/>
  <use href="#fireside"/>
  <use href="#windowWall" transform="translate(6 0)"/>
  <use href="#armchair" transform="translate(160 116)"/>
</svg>
<svg class="narrow" width="100%" height="100%" viewBox="0 0 120 260" preserveAspectRatio="xMidYMin meet" overflow="visible">
  <g transform="translate(0 20)">${room(false)}</g>
  <use href="#window" transform="translate(2 65)"/>
  <use href="#corner" transform="translate(32 101)"/>
  <use href="#hearth" transform="translate(79 111)"/>
  ${rug(64, 147, 16)}
  <ellipse cx="96" cy="150" rx="50" ry="10" fill="url(#spill)"/>
  ${shadow(6, 20, 150)}${shadow(66, 16, 150)}
  <g transform="translate(6 125)">${ROCKER}</g>
  <g transform="translate(58 145)">${YARN}</g>
  <use href="#cat" transform="translate(66 143)"/>
</svg>
<rect width="100%" height="100%" fill="url(#dim)"/>
<svg width="100%" height="90" viewBox="0 0 800 15" preserveAspectRatio="xMinYMin slice">${CEILING}</svg>
<svg y="84" width="100%" height="84" viewBox="0 0 400 14" preserveAspectRatio="xMinYMin slice">${dress.ceiling}</svg>
${moment.newYear ? `<svg y="150" width="100%" height="66" viewBox="0 0 120 11" preserveAspectRatio="xMaxYMin meet">${BANNER}</svg>` : ''}
</svg>`
}
