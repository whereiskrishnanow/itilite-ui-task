import { ICONS, type IconName } from './iconPaths'

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

/** Material Symbols Rounded glyph, coloured with currentColor. */
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

type SparkleProps = { size?: number; gradientId?: string; className?: string }

/**
 * Iris mark: an outlined four-point star with a small solid one tucked at its lower right.
 * Pass gradientId to paint it with a <linearGradient> defined elsewhere on the page.
 */
export function Sparkle({ size = 16, gradientId, className }: SparkleProps) {
  const paint = gradientId ? `url(#${gradientId})` : 'currentColor'
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="sparkle-big"
        d="M5.4 .45Q6.56 3.94 10.05 5.1 6.56 6.26 5.4 9.75 4.24 6.26.75 5.1 4.24 3.94 5.4.45Z"
        stroke={paint}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        className="sparkle-small"
        d="M12.3 8.7Q13.13 11.17 15.6 12 13.13 12.83 12.3 15.3 11.47 12.83 9 12 11.47 11.17 12.3 8.7Z"
        fill={paint}
        stroke={paint}
        strokeWidth=".7"
        strokeLinejoin="round"
      />
    </svg>
  )
}
