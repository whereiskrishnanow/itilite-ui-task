import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from 'react'

type Props = {
  id: string
  title: string
  items: string[]
  /** `${title}/${item}` of the page currently picked, if any */
  current: string | null
  top: number
  left: number
  /** opened from the keyboard: move focus into the list */
  focusFirst: boolean
  anchor: HTMLElement | null
  onPick: (key: string) => void
  onClose: (returnFocus: boolean) => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}

/**
 * Sub-pages of a section, shown beside its icon on the collapsed sidebar rail. Fixed-positioned
 * so it escapes the rail's clipping; nudged up if it would run off the bottom of the window.
 * Closes on a pick, a click outside, or Escape (which hands focus back to the rail icon).
 */
export function NavFlyout({
  id,
  title,
  items,
  current,
  top,
  left,
  focusFirst,
  anchor,
  onPick,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // keep it inside the window
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const max = window.innerHeight - el.offsetHeight - 8
    el.style.top = `${Math.max(8, Math.min(top, max))}px`
  }, [top])

  useEffect(() => {
    if (focusFirst) ref.current?.querySelector<HTMLElement>('a')?.focus()
  }, [focusFirst, title])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !anchor?.contains(t)) onClose(false)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose(true)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [anchor, onClose])

  // arrow keys move between the pages
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const links = [...(ref.current?.querySelectorAll<HTMLElement>('a') ?? [])]
    const i = links.indexOf(document.activeElement as HTMLElement)
    const next = links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length]
    next?.focus()
  }

  return (
    <div
      ref={ref}
      id={id}
      className="nav-flyout"
      role="group"
      aria-label={title}
      style={{ top, left }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <div className="nav-flyout-title">{title}</div>
      {items.map((item) => {
        const key = `${title}/${item}`
        return (
          <a
            key={item}
            href="#"
            className={`nav-flyout-item${current === key ? ' is-current' : ''}`}
            aria-current={current === key ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault()
              onPick(key)
            }}
          >
            {item}
          </a>
        )
      })}
    </div>
  )
}
