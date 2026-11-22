import type { SyntheticEvent } from 'react'

/**
 * Hover/focus handler that sets data-playing on the element for `ms`, so CSS can run a
 * one-shot icon animation that finishes even if the pointer leaves early and doesn't
 * restart while it is still running.
 */
export function playOnce(ms: number) {
  return (e: SyntheticEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (el.dataset.playing !== undefined) return
    el.dataset.playing = ''
    window.setTimeout(() => delete el.dataset.playing, ms)
  }
}
