// Outreach selectors for filtering and summarizing outreach data
// Phase 1: Team drill-in with timeframe filters

import { TIMEFRAMES } from './constants'
import type { Outreach } from './types'

export function filterByTeam(rows: Outreach[], teamId?: string) {
  if (!teamId) return rows
  // Support both teamId and team name for backward compatibility
  return rows.filter(r => r.teamId === teamId || r.team === teamId)
}

export function filterByDays(rows: Outreach[], days?: number) {
  if (!days) return rows
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return rows.filter(r => {
    const timestamp = r.occurredAt || r.timestamp
    return new Date(timestamp).getTime() >= cutoff
  })
}

export function summarizeOutreach(rows: Outreach[]) {
  const total = rows.length
  const byStatus = rows.reduce<Record<string, number>>((a, r) => {
    a[r.status] = (a[r.status] || 0) + 1
    return a
  }, {})
  const utc = byStatus['Failed'] || 0 // Using Failed as UTC proxy
  return { 
    total, 
    utcRate: total ? Math.round((utc / total) * 100) : 0, 
    byStatus 
  }
}

