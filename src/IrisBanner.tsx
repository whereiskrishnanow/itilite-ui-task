import { useLayoutEffect, useRef, useState } from 'react'
import { Sparkle } from './Icon'
import { playOnce } from './playOnce'

/** The CTA sparkle twinkles once per hover/focus; 800ms covers the move. */
const playSparkle = playOnce(800)

/** The panel's top edge sits this far below the tab's; the tab's outline flows into it here. */
const PANEL_TOP = 22

/**
 * Outline of the blue "Iris noticed" tab for a given size, traced from the design (where it
 * is 376 × 130): continuous left corners, a small convex top-right corner, a concave sweep down
 * into the light panel's top edge, a straight right side, and a convex corner where it meets
 * the panel's floor. Everything on the right is placed relative to the right edge, so the
 * same shape holds at any width or height.
 */
/** Left corners are continuous (squircle) curves: this long, with handles this close in. */
const CORNER = 54
const HANDLE = CORNER * 0.0909 // puts the 45° point where a superellipse (n = 4) has it

function tabPath(w: number, h: number) {
  const r = w - 2 // furthest right point, at the top-right corner
  const side = r - 27.5 // the straight right side under the concave sweep
  const c = Math.min(CORNER, h / 2)
  const k = c * (HANDLE / CORNER)
  return (
    `M${c} 0H${r - 36}C${r - 14} 0 ${r} 8 ${r} ${PANEL_TOP}` +
    `C${r - 18} ${PANEL_TOP} ${side} 35.5 ${side} 65.5V${h - 30}` +
    `C${side} ${h - 12} ${r - 36} ${h} ${r - 56} ${h}` +
    `H${c}C${k} ${h} 0 ${h - k} 0 ${h - c}V${c}C0 ${k} ${k} 0 ${c} 0Z`
  )
}

/** Keeps the tab outline matched to the tab's rendered size as the banner reflows. */
function useBoxSize(initial: { w: number; h: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(initial)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

/**
 * The streak reflections as one seamless tile: stretched fractal noise thresholded into thin
 * light lines. The tile is 600 × 200 so both noise frequencies (0.005, 0.17) fit a whole
 * number of periods and stitchTiles joins the edges, which lets the texture loop forever.
 */
const STREAK_TILE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200">' +
  '<filter id="s" x="0" y="0" width="100%" height="100%">' +
  '<feTurbulence type="fractalNoise" baseFrequency="0.005 0.17" numOctaves="2" seed="11" stitchTiles="stitch"/>' +
  '<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.6 -1.3"/>' +
  '</filter><rect width="600" height="200" filter="url(#s)"/></svg>'
const STREAK_TILE = `url("data:image/svg+xml,${encodeURIComponent(STREAK_TILE_SVG)}")`

export function IrisBanner() {
  const [tabRef, tab] = useBoxSize({ w: 376, h: 130 })
  return (
    <section className="iris" aria-label="Iris, your AI travel analyst">
      <div className="iris-grid">
        <div className="iris-panel">
          <div className="iris-copy">
            <h2 className="iris-title">
              This is <span className="iris-name">Iris</span>, your AI travel analyst
            </h2>
            <p className="iris-sub">No spreadsheets, no waiting – just insights in seconds.</p>
          </div>
          <a href="#" className="iris-cta" onPointerEnter={playSparkle} onFocus={playSparkle}>
            <Sparkle size={16} gradientId="iris-ink" className="iris-cta-sparkle" />
            <span>Drilldown with Iris</span>
          </a>
        </div>
        <div ref={tabRef} className="iris-tab" style={{ clipPath: `path('${tabPath(tab.w, tab.h)}')` }}>
          {/* The existing streaks, tilted to their angle and flowing across the card in a
              seamless loop (transform-only, so the compositor moves it without repainting). */}
          <div className="iris-streaks" aria-hidden="true">
            <div className="iris-streaks-flow" style={{ backgroundImage: STREAK_TILE }} />
          </div>
          <svg className="iris-grain" width="376" height="130" aria-hidden="true">
            <filter id="iris-noise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" stitchTiles="stitch" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.2" />
            </filter>
            <rect width="100%" height="100%" filter="url(#iris-noise)" opacity="0.35" />
          </svg>
          <div className="iris-tab-copy">
            <div className="iris-kicker">
              <Sparkle size={13.3} />
              <span>Iris noticed</span>
            </div>
            <p className="iris-insight">
              August had the most
              <br />
              out-of-policy spend this quater
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
