/**
 * Quick-action glyphs (Material Symbols Rounded, filled) split into parts so each can ease into
 * its own pose while the card is hovered or focused. At rest they render exactly like the
 * single-path icons. The motion lives in styles.css under "Quick action icons".
 */

import type { ReactNode } from 'react'

export type QuickActionKind = 'trip' | 'expense' | 'card' | 'user'

const VIEWBOX = '0 -960 960 960'

function Glyph({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      className="qa-glyph"
      width={size}
      height={size}
      viewBox={VIEWBOX}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function QuickActionIcon({ kind, size = 22 }: { kind: QuickActionKind; size?: number }) {
  switch (kind) {
    // The plane dips, lifts off nose-up and floats while the runway falls away.
    case 'trip':
      return (
        <Glyph size={size}>
          {/* outer group takes the lift-off pose; the path inside floats while airborne */}
          <g className="qa-plane">
            <path
              className="qa-plane-air"
              d="M822-501 230-342q-20 5-38-2.5T163-369L66-530q-8-14-2-29.5T86-580l19-5q8-2 16.5-.5T136-579l103 87 165-45-177-236q-13-17-6-38.5t28-26.5l18-5q10-2 19.5 0t17.5 9l294 246 184-50q29-7 53.5 8t32.5 44q8 28-5.5 52.5T822-501Z"
            />
          </g>
          <path
            className="qa-runway"
            d="M150-120q-13 0-21.5-8.5T120-150q0-13 8.5-21.5T150-180h660q13 0 21.5 8.5T840-150q0 13-8.5 21.5T810-120H150Z"
          />
        </Glyph>
      )
    // The page lifts and its short first line writes itself out to full width.
    case 'expense':
      return (
        <Glyph size={size}>
          <g className="qa-doc">
            <path d="M180-120q-24.75 0-42.37-17.63Q120-155.25 120-180v-600q0-24.75 17.63-42.38Q155.25-840 180-840h375q12.44 0 23.72 5T598-822l224 224q8 8 13 19.28 5 11.28 5 23.72v375q0 24.75-17.62 42.37Q804.75-120 780-120H180Z" />
            <rect className="qa-doc-line" x="279" y="-669" width="276" height="60" rx="30" />
            <rect className="qa-doc-line" x="279" y="-510" width="402" height="60" rx="30" />
            <rect className="qa-doc-line" x="279" y="-351" width="402" height="60" rx="30" />
          </g>
        </Glyph>
      )
    // The card slides up out of the slot, then its plus pops.
    case 'card':
      return (
        <Glyph size={size}>
          <path
            className="qa-card-body"
            d="M140-501h680v-139H140v139Zm0 341q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v270q0 12.75-8.62 21.37Q862.75-440 850-440h-70q-74.7 0-127.35 52.65Q600-334.7 600-260v70q0 12.75-8.62 21.37Q582.75-160 570-160H140Z"
          />
          <path
            className="qa-card-plus"
            d="M780-200h-90q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h90v-90q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v90h90q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5h-90v90q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63Q780-97.25 780-110v-90Z"
          />
        </Glyph>
      )
    // The person perks up: a small dip, then the head lifts and the shoulders square up.
    case 'user':
      return (
        <Glyph size={size}>
          <path
            className="qa-user-body"
            d="M160-220v-34q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v34q0 25-17.5 42.5T740-160H220q-25 0-42.5-17.5T160-220Z"
          />
          <path
            className="qa-user-head"
            d="M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42Z"
          />
        </Glyph>
      )
  }
}
