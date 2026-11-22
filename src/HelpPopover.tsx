import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './iconPaths'

const SUPPORT_EMAIL = 'support@itilite.com'
const SUPPORT_PHONE = '+1833 460 5669'
const FAQ_URL = '#' // replace with the help-centre address

function Row({ icon, href, children }: { icon: IconName; href: string; children: ReactNode }) {
  return (
    <li>
      <a className="help-row" href={href}>
        <span className="help-row-icon">
          <Icon name={icon} size={20} />
        </span>
        <span className="help-row-text">{children}</span>
      </a>
    </li>
  )
}

/**
 * "Need help?" in the top bar: toggles a small card with the support email, phone line and
 * FAQs. Closes on a click outside, on Escape (returning focus to the trigger), or when a row
 * is used.
 */
export function HelpPopover() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="help" ref={root}>
      <button
        ref={trigger}
        type="button"
        className="help-link"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Need help?
      </button>
      <div
        id={panelId}
        className={`help-pop${open ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Help and support"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false)
        }}
      >
        <ul className="help-list">
          <Row icon="mail" href={`mailto:${SUPPORT_EMAIL}`}>
            Email us at <b>{SUPPORT_EMAIL}</b>
          </Row>
          <Row icon="call" href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>
            Talk to us 24/7 on <b>{SUPPORT_PHONE}</b>
          </Row>
          <Row icon="help" href={FAQ_URL}>
            Find your queries in <b className="help-faq">FAQs</b>
          </Row>
        </ul>
      </div>
    </div>
  )
}
