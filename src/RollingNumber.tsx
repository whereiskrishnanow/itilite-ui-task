import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const BASE_MS = 620 // roll time of the leftmost digit
const STEP_MS = 120 // each digit to the right rolls this much longer, so they land left to right
const BASE_SPINS = 5 // digits passed by the leftmost reel
const STEP_SPINS = 2 // extra digits per reel to the right
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)' // fast spin-up, long soft landing

const isDigit = (c: string) => c >= '0' && c <= '9'
const randomDigit = () => String(Math.floor(Math.random() * 10))
const numeric = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0

type Slot =
  | { kind: 'static'; ch: string }
  | { kind: 'digit'; to: string; strip: string[]; up: boolean }

type Box = { x: number; w: number }

/**
 * Lines the old and new strings up by digit from the right (units under units), and gives
 * each new digit a reel: old digit → a run of random digits → new digit. Reels roll up when
 * the value grows and down when it shrinks; a digit with no counterpart rolls in from blank.
 */
function buildSlots(from: string, to: string): Slot[] {
  const oldDigits = [...from].filter(isDigit)
  const newCount = [...to].filter(isDigit).length
  const up = numeric(to) >= numeric(from)
  let reel = 0
  return [...to].map((ch) => {
    if (!isDigit(ch)) return { kind: 'static', ch }
    const fromRight = newCount - 1 - reel
    const start = oldDigits[oldDigits.length - 1 - fromRight] ?? ''
    const spins = Array.from({ length: BASE_SPINS + reel++ * STEP_SPINS }, randomDigit)
    const run = [start, ...spins, ch]
    return { kind: 'digit', to: ch, strip: up ? run : run.reverse(), up }
  })
}

/**
 * Shows `text`; when it changes, each digit rolls vertically through a reel of numbers and
 * lands on its new value, slot-machine / odometer style, while symbols ($ . K %) stay put.
 *
 * The real text stays in the layout (transparent), so the line keeps its exact kerned width
 * and screen readers read the final value. Each glyph's box is measured from that text and
 * the visible characters and reels are drawn on top at those exact positions, so nothing
 * shifts when the roll lands and the plain text returns. `delay` offsets the whole roll so
 * several numbers can cascade. Instant under reduced motion or in a background tab.
 */
export function RollingNumber({ text, delay = 0 }: { text: string; delay?: number }) {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [boxes, setBoxes] = useState<Box[] | null>(null)
  const shown = useRef(text)
  const host = useRef<HTMLSpanElement>(null)
  const ghost = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const from = shown.current
    if (from === text) return
    shown.current = text
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    setBoxes(null)
    setSlots(reduce || document.visibilityState === 'hidden' ? null : buildSlots(from, text))
  }, [text])

  // 1. Measure where every character of the real (transparent) text sits.
  useLayoutEffect(() => {
    if (!slots || boxes || !host.current || !ghost.current?.firstChild) return
    const node = ghost.current.firstChild
    const left = host.current.getBoundingClientRect().left
    const range = document.createRange()
    setBoxes(
      slots.map((_, i) => {
        range.setStart(node, i)
        range.setEnd(node, i + 1)
        const r = range.getBoundingClientRect()
        return { x: r.left - left, w: r.width }
      }),
    )
  }, [slots, boxes])

  // 2. Roll every reel, then hand back to plain text.
  useLayoutEffect(() => {
    if (!slots || !boxes || !host.current) return
    const reels = [...host.current.querySelectorAll<HTMLElement>('.roll-strip')]
    const anims = reels.map((strip, i) => {
      const h = (strip.parentElement as HTMLElement).offsetHeight
      const travel = -(strip.children.length - 1) * h
      const [a, b] = strip.dataset.dir === 'up' ? [0, travel] : [travel, 0]
      return strip.animate(
        [{ transform: `translate(-50%, ${a}px)` }, { transform: `translate(-50%, ${b}px)` }],
        { duration: BASE_MS + i * STEP_MS, delay, easing: EASE, fill: 'both' },
      )
    })
    let live = true
    Promise.all(anims.map((a) => a.finished))
      .then(() => {
        if (!live) return
        setSlots(null)
        setBoxes(null)
      })
      .catch(() => {}) // cancelled by a newer change
    return () => {
      live = false
      anims.forEach((a) => a.cancel())
    }
  }, [slots, boxes, delay])

  if (!slots) return <>{text}</>

  return (
    <span ref={host} className="roll-host">
      <span ref={ghost} className="roll-ghost">
        {text}
      </span>
      {boxes ? (
        <span className="roll-layer" aria-hidden="true">
          {slots.map((s, i) => (
            <span
              key={i}
              className={s.kind === 'digit' ? 'roll-char roll-window' : 'roll-char'}
              style={{ left: boxes[i].x, width: boxes[i].w }}
            >
              {s.kind === 'static' ? (
                s.ch
              ) : (
                <span className="roll-strip" data-dir={s.up ? 'up' : 'down'}>
                  {s.strip.map((d, j) => {
                    const lands = s.up ? j === s.strip.length - 1 : j === 0
                    return (
                      <span key={j} className={lands ? undefined : 'roll-mid'}>
                        {d || ' '}
                      </span>
                    )
                  })}
                </span>
              )}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  )
}
