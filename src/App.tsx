import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Icon } from './Icon'
import { ICONS, type IconName } from './iconPaths'
import { playOnce } from './playOnce'
import { HelpPopover } from './HelpPopover'
import { NavFlyout } from './NavFlyout'
import { IrisBanner } from './IrisBanner'
import { QuickActionIcon, type QuickActionKind } from './QuickActionIcons'
import { RollingNumber } from './RollingNumber'
import { SPEND, SPEND_CATEGORIES, formatK, type SpendRange } from './spendData'

type NavItem = { label: string; icon: IconName; badge?: number; children?: string[] }

const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Approvals', icon: 'verified', badge: 3 },
]

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Suite',
    items: [
      { label: 'Travel', icon: 'travel', children: ['Book travel', 'Upcoming trips', 'Trip history'] },
      { label: 'Expense', icon: 'receipt', children: ['My expenses', 'Expense reports', 'Reimbursements'] },
      { label: 'Cards', icon: 'card', children: ['All cards', 'Transactions', 'Limits & funding'] },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Reports', icon: 'assignment' },
      { label: 'People', icon: 'group' },
      { label: 'Policies', icon: 'privacy' },
      { label: 'Settings', icon: 'settings' },
    ],
  },
]

const QUICK_ACTIONS: { title: string; subtitle: string; kind: QuickActionKind }[] = [
  { title: 'Plan a trip', subtitle: 'Book flights, hotels etc.', kind: 'trip' },
  { title: 'Create expense', subtitle: 'Or a new report', kind: 'expense' },
  { title: 'Issue card', subtitle: 'Physical or virtual', kind: 'card' },
  { title: 'Add user', subtitle: 'Expand your team', kind: 'user' },
]


type Todo = { title: string; meta: string; action: string; alert?: boolean }

const TODOS: Todo[] = [
  { title: 'Card program at 81% of its limit', meta: 'Add funds to avoid declines', action: 'Add Funds', alert: true },
  { title: '3 trips awaiting approval', meta: 'Parth MG and 2 others', action: 'Review' },
  { title: '1 expense report to approve', meta: 'Submitted 8h ago', action: 'Approve' },
  { title: '$48,920 ready to reimburse', meta: 'Pranav L and 16 others', action: 'Review' },
  { title: '12 card transactions missing receipts', meta: 'Reminders sent', action: 'Review' },
]

type GlanceColumn = {
  title: string
  icon: IconName
  /** space after the icon; the glyphs carry different side bearings */
  gap: number
  rows: { label: string; value: string; alert?: boolean }[]
}

const GLANCE: GlanceColumn[] = [
  {
    title: 'Travel',
    icon: 'travel',
    gap: 7.5,
    rows: [
      { label: 'Ongoing', value: '3' },
      { label: 'Upcoming', value: '5' },
      { label: 'Completed', value: '13' },
    ],
  },
  {
    title: 'Expense',
    icon: 'receipt',
    gap: 5,
    rows: [
      { label: 'Awaiting Reimbursment', value: '$48.9K' },
      { label: 'Awaiting approval', value: '2' },
      { label: 'Draft reports', value: '1' },
    ],
  },
  {
    title: 'Cards',
    icon: 'card',
    gap: 6.6,
    rows: [
      { label: 'Limit used', value: '81%', alert: true },
      { label: 'Total Allotment', value: '$27.9K' },
      { label: 'Active cards', value: '57' },
    ],
  },
]

function Badge({ count }: { count: number }) {
  return <span className="badge">{count}</span>
}

type RailHint = { onShow: (el: HTMLElement) => void; onHide: () => void }

function NavLink({
  item,
  active,
  hint,
}: {
  item: NavItem
  active?: boolean
  /** collapsed rail: show the name in a tooltip on hover/focus */
  hint: RailHint
}) {
  return (
    <a
      href="#"
      className={`nav-item${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onPointerEnter={(e) => hint.onShow(e.currentTarget)}
      onPointerLeave={hint.onHide}
      onFocus={(e) => hint.onShow(e.currentTarget)}
      onBlur={hint.onHide}
    >
      <Icon name={item.icon} size={item.icon === 'home' ? 20 : 19} className="nav-icon" />
      <span className="nav-label">{item.label}</span>
      {item.badge ? (
        <>
          <Badge count={item.badge} />
          {/* stands in for the count badge on the collapsed rail */}
          <span className="nav-dot" aria-hidden="true" />
        </>
      ) : null}
    </a>
  )
}

/**
 * A nav item with sub-pages: the row toggles a text-only list under it (no icons), which
 * opens with a height animation. A faint chevron shows on hover and while open.
 */
function NavTree({
  item,
  open,
  onToggle,
  current,
  onPick,
  collapsed,
  flyoutOpen,
  onRailHover,
  onRailLeave,
}: {
  item: NavItem
  open: boolean
  onToggle: (button: HTMLElement, viaKeyboard: boolean) => void
  current: string | null
  onPick: (key: string) => void
  collapsed: boolean
  flyoutOpen: boolean
  onRailHover: (button: HTMLElement) => void
  onRailLeave: () => void
}) {
  const listId = `nav-sub-${item.label.toLowerCase()}`
  const children = item.children ?? []
  return (
    <div className={`nav-tree${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="nav-item nav-parent"
        data-flyout={flyoutOpen ? '' : undefined}
        aria-expanded={collapsed ? flyoutOpen : open}
        aria-controls={collapsed ? `nav-fly-${item.label.toLowerCase()}` : listId}
        onClick={(e) => onToggle(e.currentTarget, e.detail === 0)}
        onPointerEnter={(e) => onRailHover(e.currentTarget)}
        onPointerLeave={onRailLeave}
      >
        <Icon name={item.icon} size={19} className="nav-icon" />
        <span className="nav-label">{item.label}</span>
        <Icon name="chevron" size={18} className="nav-chevron" />
      </button>
      <div className="nav-sub" id={listId} role="group" aria-label={item.label}>
        <div className="nav-sub-inner">
          {children.map((child) => {
            const key = `${item.label}/${child}`
            return (
              <a
                key={child}
                href="#"
                className={`nav-subitem${current === key ? ' is-current' : ''}`}
                aria-current={current === key ? 'page' : undefined}
                tabIndex={open ? undefined : -1}
                onClick={(e) => {
                  e.preventDefault()
                  onPick(key)
                }}
              >
                {child}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Sidebar({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (c: boolean) => void }) {
  // one section open at a time; clicking the open one closes it
  const [openTree, setOpenTree] = useState<string | null>(null)
  const [currentSub, setCurrentSub] = useState<string | null>(null)

  // On the collapsed rail a section's pages show in a flyout beside its icon: on hover (after a
  // short pause, or instantly when moving from one open flyout to the next) or on click/Enter.
  const [flyout, setFlyout] = useState<{ label: string; top: number; left: number; viaKeyboard: boolean; anchor: HTMLElement } | null>(null)
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)
  const stopTimers = () => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
  }
  const showFlyout = (label: string, button: HTMLElement, viaKeyboard = false) => {
    stopTimers()
    const r = button.getBoundingClientRect()
    setFlyout({ label, top: r.top - 6, left: r.right + 16, viaKeyboard, anchor: button })
  }
  const closeFlyout = useCallback((returnFocus: boolean) => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
    setFlyout((f) => {
      if (returnFocus) f?.anchor.focus()
      return null
    })
  }, [])
  const railHover = (label: string, button: HTMLElement) => {
    if (!collapsed) return
    stopTimers()
    setTip(null) // a section shows its flyout instead of a name tooltip
    if (flyout) showFlyout(label, button)
    else openTimer.current = window.setTimeout(() => showFlyout(label, button), 90)
  }
  const railLeave = () => {
    if (!collapsed) return
    window.clearTimeout(openTimer.current)
    closeTimer.current = window.setTimeout(() => setFlyout(null), 200)
  }
  // the flyout belongs to the rail only
  useEffect(() => {
    if (!collapsed) closeFlyout(false)
  }, [collapsed, closeFlyout])

  const toggleTree = (label: string, button: HTMLElement, viaKeyboard: boolean) => {
    if (collapsed) {
      if (flyout?.label === label) closeFlyout(false)
      else showFlyout(label, button, viaKeyboard)
      return
    }
    setOpenTree((o) => (o === label ? null : label))
  }
  const flyoutItem = flyout ? NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.label === flyout.label) : undefined

  // Collapsed rail: items without sub-pages get a small name tooltip. The first one waits a
  // moment; moving straight on to the next icon switches it instantly.
  const [tip, setTip] = useState<{ label: string; badge?: number; top: number; left: number } | null>(null)
  const tipTimer = useRef<number | undefined>(undefined)
  const tipHideTimer = useRef<number | undefined>(undefined)
  const hintFor = (item: NavItem): RailHint => ({
    onShow: (el) => {
      if (!collapsed) return
      window.clearTimeout(tipTimer.current)
      window.clearTimeout(tipHideTimer.current)
      if (flyout) closeFlyout(false)
      const place = () => {
        const r = el.getBoundingClientRect()
        setTip({ label: item.label, badge: item.badge, top: r.top + r.height / 2, left: r.right + 14 })
      }
      if (tip) place()
      else tipTimer.current = window.setTimeout(place, 120)
    },
    onHide: () => {
      window.clearTimeout(tipTimer.current)
      tipHideTimer.current = window.setTimeout(() => setTip(null), 60)
    },
  })
  useEffect(() => {
    if (!collapsed) setTip(null)
  }, [collapsed])

  return (
    <aside className="sidebar" id="sidebar" aria-label="Sidebar">
      <div className="brand">
        <a href="#" className="logo" aria-label="itilite home" tabIndex={collapsed ? -1 : undefined}>
          <img src={`${import.meta.env.BASE_URL}itilite-logo.png`} alt="itilite" width={93} height={24} />
        </a>
        {/* collapsed: the plane mark, which turns into an expand arrow on hover */}
        <button
          type="button"
          className="brand-mark"
          aria-label="Expand sidebar"
          aria-controls="sidebar"
          aria-expanded={false}
          tabIndex={collapsed ? undefined : -1}
          onClick={() => onCollapsedChange(false)}
        >
          <img src={`${import.meta.env.BASE_URL}itilite-mark.png`} alt="" width={24} height={24} />
          <Icon name="expand" size={20} className="brand-mark-arrow" />
        </button>
        <button
          type="button"
          className="collapse-btn"
          aria-label="Collapse sidebar"
          aria-controls="sidebar"
          aria-expanded={true}
          title="Collapse sidebar"
          tabIndex={collapsed ? -1 : undefined}
          onClick={() => onCollapsedChange(true)}
        >
          <Icon name="collapse" size={20} />
        </button>
      </div>
      <nav className="nav" aria-label="Main">
        {PRIMARY_NAV.map((item, i) => (
          <NavLink key={item.label} item={item} active={i === 0} hint={hintFor(item)} />
        ))}
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="nav-group">
            <div className="nav-section" aria-label={section.title}>
              <span className="nav-section-text">{section.title}</span>
              <span className="nav-section-dot" aria-hidden="true" />
            </div>
            {section.items.map((item) =>
              item.children ? (
                <NavTree
                  key={item.label}
                  item={item}
                  open={openTree === item.label}
                  onToggle={(button, viaKeyboard) => toggleTree(item.label, button, viaKeyboard)}
                  current={currentSub}
                  onPick={setCurrentSub}
                  collapsed={collapsed}
                  flyoutOpen={flyout?.label === item.label}
                  onRailHover={(button) => railHover(item.label, button)}
                  onRailLeave={railLeave}
                />
              ) : (
                <NavLink key={item.label} item={item} hint={hintFor(item)} />
              ),
            )}
          </div>
        ))}
      </nav>
      {tip ? (
        <div className="nav-tip" aria-hidden="true" style={{ top: tip.top, left: tip.left }}>
          {tip.label}
          {tip.badge ? <span className="nav-tip-count">{tip.badge}</span> : null}
        </div>
      ) : null}
      {flyout && flyoutItem?.children ? (
        <NavFlyout
          id={`nav-fly-${flyout.label.toLowerCase()}`}
          title={flyout.label}
          items={flyoutItem.children}
          current={currentSub}
          top={flyout.top}
          left={flyout.left}
          focusFirst={flyout.viaKeyboard}
          anchor={flyout.anchor}
          onPick={(key) => {
            setCurrentSub(key)
            closeFlyout(false)
          }}
          onClose={closeFlyout}
          onPointerEnter={stopTimers}
          onPointerLeave={railLeave}
        />
      ) : null}
      <div className="profile" title={collapsed ? 'Jay Majethiya · Super Admin' : undefined}>
        <span className="avatar">
          <Icon name="person" size={22} />
        </span>
        <span className="profile-text">
          <span className="profile-name">Jay Majethiya</span>
          <span className="profile-role">Super Admin</span>
        </span>
      </div>
    </aside>
  )
}

/** The bell rings once per hover/focus; 1s covers the swing. */
const ringBell = playOnce(1000)

function TopBar() {
  return (
    <header className="topbar">
      <label className="search">
        <Icon name="search" size={20} className="search-icon" />
        <input type="search" placeholder="Search anything" aria-label="Search anything" />
        <kbd>⌘K</kbd>
      </label>
      <div className="topbar-actions">
        <HelpPopover />
        <button
          type="button"
          className="bell"
          aria-label="Notifications, 9 unread"
          onPointerEnter={ringBell}
          onFocus={ringBell}
        >
          {/* body and clapper are separate so the clapper can lag behind the swing */}
          <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" focusable="false">
            <path className="bell-body" d={ICONS.bellBody} />
            <path className="bell-clapper" d={ICONS.bellClapper} />
          </svg>
          <Badge count={9} />
        </button>
      </div>
    </header>
  )
}

function QuickActions() {
  return (
    <section className="quick-actions" aria-label="Quick actions">
      {QUICK_ACTIONS.map((qa) => (
        <a
          key={qa.title}
          href="#"
          className="qa-card"
          data-kind={qa.kind}
        >
          <span className="qa-icon">
            <QuickActionIcon kind={qa.kind} />
          </span>
          <span className="qa-text">
            <span className="qa-title">{qa.title}</span>
            <span className="qa-sub">{qa.subtitle}</span>
          </span>
        </a>
      ))}
    </section>
  )
}

function Dot() {
  return <span className="sep" aria-hidden="true">·</span>
}

const RANGE_TABS: { id: SpendRange; label: string }[] = [
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: 'This quarter' },
]

function CompanySpend() {
  const [range, setRange] = useState<SpendRange>('month')
  const data = SPEND[range]
  // The total and trend roll to their new values digit by digit; the bar eases via CSS.

  // Sliding tab highlight: measure the selected tab and move one pill there. Re-measured when
  // the tab list resizes (e.g. once the web font loads) so it always hugs the label.
  const tabsRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
  // transitions switch on only after the first placement, so the pill never slides in from 0
  const [pillLive, setPillLive] = useState(false)
  useEffect(() => {
    if (!pill || pillLive) return
    const id = requestAnimationFrame(() => setPillLive(true))
    return () => cancelAnimationFrame(id)
  }, [pill, pillLive])
  useLayoutEffect(() => {
    const list = tabsRef.current
    if (!list) return
    const measure = () => {
      const tab = list.querySelector<HTMLElement>(`#spend-tab-${range}`)
      if (!tab) return
      // sub-pixel boxes (offsetLeft/Width round to whole pixels)
      const t = tab.getBoundingClientRect()
      const l = list.getBoundingClientRect()
      setPill({ x: t.left - l.left, w: t.width })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [range])

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const i = RANGE_TABS.findIndex((t) => t.id === range)
    const next = RANGE_TABS[(i + (e.key === 'ArrowRight' ? 1 : -1) + RANGE_TABS.length) % RANGE_TABS.length]
    setRange(next.id)
    document.getElementById(`spend-tab-${next.id}`)?.focus()
  }

  return (
    <div className="spend">
      <div className="card-head">
        <h2 className="eyebrow">
          Company spend <Dot /> {data.period}
        </h2>
        <div ref={tabsRef} className="tabs" role="tablist" aria-label="Spend range" onKeyDown={onTabKey}>
          {/* one pill that glides to the selected tab */}
          <span
            className="tab-indicator"
            aria-hidden="true"
            data-placed={pill ? '' : undefined}
            data-live={pillLive ? '' : undefined}
            style={pill ? ({ '--pill-x': `${pill.x}px`, '--pill-w': `${pill.w}px` } as CSSProperties) : undefined}
          />
          {RANGE_TABS.map((t) => (
            <button
              key={t.id}
              id={`spend-tab-${t.id}`}
              role="tab"
              aria-selected={range === t.id}
              aria-controls="spend-panel"
              tabIndex={range === t.id ? 0 : -1}
              className="tab"
              onClick={() => setRange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div id="spend-panel" role="tabpanel" aria-labelledby={`spend-tab-${range}`}>
        <div className="amount">
          <RollingNumber text={formatK(data.total)} />
        </div>
        <div className="trend">
          <Icon name="trending" size={16} className="trend-icon" />
          <span className="trend-pct">
            <RollingNumber text={`${data.change.toFixed(1)}%`} delay={80} />
          </span>
          <span className="trend-label">{data.compareLabel}</span>
        </div>
        <div className="spend-bar" aria-hidden="true">
          {SPEND_CATEGORIES.map((c, i) => (
            <span key={c.label} style={{ flexGrow: data.bar[i], background: c.color }} />
          ))}
        </div>
        <ul className="legend">
          {SPEND_CATEGORIES.map((c, i) => (
            <li key={c.label}>
              <span className="legend-dot">
                <i style={{ background: c.color }} />
              </span>
              <span className="legend-label">{c.label}</span>
              {/* legend figures switch instantly; only the total and trend roll */}
              <span className="legend-pct">{data.pct[i]}%</span>
              <span className="legend-value">{formatK(data.value[i])}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ThingsToDo() {
  return (
    <div className="todo">
      <div className="card-head">
        <h2 className="eyebrow">
          Things to do <Dot /> 12
        </h2>
        <a href="#" className="view-all">
          View all
        </a>
      </div>
      <ul className="todo-list">
        {TODOS.map((t) => (
          <li key={t.title} className="todo-row">
            {t.alert ? (
              <span className="alert-dot" aria-hidden="true">
                <i />
              </span>
            ) : null}
            <span className="todo-title">{t.title}</span>
            <Dot />
            <span className="todo-meta">{t.meta}</span>
            <a href="#" className={`todo-action${t.alert ? ' is-alert' : ''}`}>
              <span className="todo-label">{t.action}</span>
              <span className="todo-arrow" aria-hidden="true">
                <Icon name="arrow" size={20} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AtAGlance() {
  return (
    <section className="card glance">
      <div className="card-head">
        <h2 className="eyebrow">At a glance</h2>
      </div>
      <div className="glance-cols">
        {GLANCE.map((col) => (
          <div key={col.title} className="glance-col">
            <div className="glance-title" style={{ '--title-gap': `${col.gap}px` } as CSSProperties}>
              <Icon name={col.icon} size={17} />
              <span>{col.title}</span>
            </div>
            {col.rows.map((r) => (
              <div key={r.label} className={`glance-row${r.alert ? ' is-alert' : ''}`}>
                <span>{r.label}</span>
                <b>{r.value}</b>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

const SIDEBAR_KEY = 'itilite.sidebar.collapsed'

/** Remembers the rail state per browser; storage can be unavailable (private mode), so guard it. */
function useCollapsedSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1'
    } catch {
      return false
    }
  })
  const update = (c: boolean) => {
    setCollapsed(c)
    try {
      localStorage.setItem(SIDEBAR_KEY, c ? '1' : '0')
    } catch {
      /* not persisted; fine */
    }
  }
  return [collapsed, update] as const
}

export default function App() {
  const [collapsed, setCollapsed] = useCollapsedSidebar()
  return (
    <div className={`app${collapsed ? ' is-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <TopBar />
      <main className="panel">
        <div className="content">
          <h1 className="hello">Hello Jay,</h1>
          <p className="hello-sub">Here’s an overview of your company</p>
          <IrisBanner />
          <QuickActions />
          <section className="card overview">
            <CompanySpend />
            <ThingsToDo />
          </section>
          <AtAGlance />
        </div>
      </main>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="iris-ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6a9cc4" />
            <stop offset="1" stopColor="#0a2a78" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
