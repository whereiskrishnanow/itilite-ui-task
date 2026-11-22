/** Company spend for the two ranges behind the "This month" / "This quarter" tabs. Values in $K. */

export type SpendRange = 'month' | 'quarter'

export const SPEND_CATEGORIES = [
  { label: 'Travel', color: '#2c6bfe' },
  { label: 'Card', color: '#742ed4' },
  { label: 'Reimbursed', color: '#11a088' },
  { label: 'Awaiting reimbursement', color: '#000000' },
  { label: 'Others', color: '#9a9a9a' },
] as const

export type SpendSnapshot = {
  /** shown after "Company spend ·" */
  period: string
  total: number
  /** % change against the comparison period */
  change: number
  compareLabel: string
  /** per category, in SPEND_CATEGORIES order */
  pct: number[]
  value: number[]
  /** relative widths of the stacked bar segments */
  bar: number[]
}

export const SPEND: Record<SpendRange, SpendSnapshot> = {
  // November. Total, trend, Travel and Card are as in the design; the design's other three
  // categories didn't add up, so they are rebalanced to make the legend sum to $313.4K and
  // the percentages to 100. The bar is drawn to the values.
  month: {
    period: 'November',
    total: 313.4,
    change: 6.8,
    compareLabel: 'vs. last month',
    pct: [52, 17, 20, 8, 3],
    value: [164.2, 52.4, 62.4, 25.8, 8.6],
    bar: [164.2, 52.4, 62.4, 25.8, 8.6],
  },
  // Q4 to date (1 Oct – 22 Nov): October $287.6K + November, category by category
  // (October: 142.3 / 55.8 / 63.8 / 16.3 / 9.4). The bar is drawn to the values.
  quarter: {
    period: 'Q4 2026',
    total: 601.0,
    change: 4.1,
    compareLabel: 'vs. last quarter',
    pct: [51, 18, 21, 7, 3],
    value: [306.5, 108.2, 126.2, 42.1, 18.0],
    bar: [306.5, 108.2, 126.2, 42.1, 18.0],
  },
}

export const formatK = (v: number) => `$${v.toFixed(1)}K`
