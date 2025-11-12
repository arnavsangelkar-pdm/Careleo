// Member selectors for filtering members by various criteria
// Phase 1: Clickable KPI tiles with filtered lists

import type { Member, Outreach } from './types'

export function filterMembersByPreset(list: Member[], preset?: string) {
  // Placeholder for future preset filters
  return list
}

export function filterMembersByAbrasion(
  list: Member[],
  bucket?: 'low' | 'med' | 'high'
) {
  if (!bucket) return list
  const ranges = { low: [0, 39], med: [40, 69], high: [70, 100] } as const
  const [min, max] = ranges[bucket]
  return list.filter(m => {
    const risk = m.abrasionRisk ?? m.risk ?? -1
    return risk >= min && risk <= max
  })
}

export function filterMembersByRecentOutreach(
  list: Member[],
  outreach: Outreach[],
  days?: number
) {
  if (!days) return list
  const cutoff = Date.now() - days * 86400000
  const recentSet = new Set(
    outreach
      .filter(o => {
        const timestamp = o.occurredAt || o.timestamp
        return new Date(timestamp).getTime() >= cutoff
      })
      .map(o => o.memberId)
  )
  return list.filter(m => recentSet.has(m.id) || recentSet.has(m.memberId))
}

