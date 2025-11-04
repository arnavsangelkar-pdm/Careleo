// Analytics selectors for centralized channel and outreach analysis
// Shared between Analytics and Outreach views to ensure parity

import type { Outreach } from './types'

export type ChannelCounts = Record<string, number>

/**
 * Count outreach records by channel
 */
export function countByChannel(rows: Outreach[]): ChannelCounts {
  return rows.reduce<ChannelCounts>((acc, r) => {
    acc[r.channel] = (acc[r.channel] || 0) + 1
    return acc
  }, {})
}

/**
 * Get top and bottom channels by volume
 */
export function topAndBottomChannel(rows: Outreach[]): { top: string; bottom: string } {
  const counts = countByChannel(rows)
  const entries = Object.entries(counts)
  if (entries.length === 0) return { top: 'N/A', bottom: 'N/A' }
  entries.sort((a, b) => b[1] - a[1])
  return { top: entries[0][0], bottom: entries[entries.length - 1][0] }
}

/**
 * Convert channel counts to chart series format
 */
export function seriesFromCounts(counts: ChannelCounts): Array<{ name: string; value: number }> {
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

