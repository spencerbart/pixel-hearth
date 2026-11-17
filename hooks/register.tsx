import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { momentAt, scene, type Season } from './scene'

// A dim room lit by the fire. Surfaces are warm dark browns and text is
// candlelight cream. The accent is candle gold, with holly green, berry red and
// ember orange for success, danger and warning.
const { theme, problems } = makeColors({
  label: 'Pixel hearth',
  only: 'dark',
  roles: { accent: '#d9a441', danger: '#c8443a', success: '#4f9a5c', warning: '#e07a2e', pro: '#a274b8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#18110f',
        'surface-1': '#1f1613',
        'surface-2': '#261b17',
        'surface-3': '#2a1e1a',
        'text-primary': '#f3e6cf',
        'text-secondary': '#d6c4a7',
        'text-muted': '#b09d82',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  // A light veil so the pixels stay sharp behind the panels.
  backdrop: { scene: 'pixel-hearth', glass: { blur: 4, opacity: 0.72 } },
}

const ALT: Record<Season, string> = {
  spring:
    "A pixel-art living room in spring: a fire with tulips and a bird's nest on the mantel and ivy trailing from it, a rocking chair and a sleeping cat, an umbrella, rain boots and a potted plant, and trees in blossom through the window",
  summer:
    'A pixel-art living room in summer: a fire with a model sailboat on the mantel and a straw hat hung below it, a rocking chair and a sleeping cat, a fishing rod, a beach ball and a picnic basket, paper lanterns, and sunflowers through the window',
  autumn:
    'A pixel-art living room in autumn: a fire with pumpkins on the mantel, a rocking chair and a sleeping cat, corn stalks and a hay bale, and autumn trees through the window',
  christmas:
    'A pixel-art living room at Christmas: a fire with stockings, a rocking chair and a sleeping cat, a tree with presents, and a snowy window',
  winter:
    'A pixel-art living room in winter: a fire with mittens drying on the mantel, a rocking chair and a sleeping cat, a coat rack with ice skates and snow boots, and a snowy window',
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    // No timed redraws: the desktop app flashes when the backdrop is redrawn.
    // The room picks up the time of day and the date when it is next drawn,
    // such as at the start of a session.

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'pixel-hearth') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const moment = momentAt(new Date(await $.clock.now()))

    return (
      <Svg
        source={scene(moment)}
        alt={ALT[moment.season]}
        isInteractive
      />
    )
  })
}
