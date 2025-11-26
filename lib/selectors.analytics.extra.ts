// Analytics selectors for the 5 new charts
// HEDIS Gap Closure Trend, Claims Cost Distribution, Outreach Funnel,
// Member Interaction Volume by Team, High-Cost Claimants Pareto

import type { ClaimLine, HedisGapEvent, MemberClaimsSummary, Outreach } from '@/lib/types'

// 1) HEDIS Gap Closure Trend - Improved version
export function hedisClosureTrend(events: HedisGapEvent[], monthsBack = 8) {
  const months: { name: string; opened: number; closed: number; closureRate: number }[] = []
  const now = new Date()
  
  for (let i = monthsBack; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    
    const openedInMonth = events.filter(e => {
      const d = new Date(e.at)
      return e.status === 'opened' && d >= start && d < end
    }).length
    
    const closedInMonth = events.filter(e => {
      const d = new Date(e.at)
      return e.status === 'closed' && d >= start && d < end
    }).length
    
    // Calculate closure rate: closed / (opened + closed) for this month
    const total = openedInMonth + closedInMonth
    const closureRate = total > 0 ? Math.round((closedInMonth / total) * 100) : 0
    
    months.push({
      name: start.toLocaleString(undefined, { month: 'short', year: '2-digit' }),
      opened: openedInMonth,
      closed: closedInMonth,
      closureRate,
    })
  }
  return months
}

// 2) Claims Cost Distribution - Improved with better binning
export function claimsHistogram(summaries: MemberClaimsSummary[], binSize = 1000, maxBins = 15) {
  if (!summaries.length) return []
  
  const values = summaries.map(s => s.totalPaid)
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  // Use adaptive binning: ensure we have meaningful distribution
  const range = max - min
  const adaptiveBinSize = Math.max(binSize, Math.ceil(range / maxBins))
  const bins = Math.min(Math.ceil(range / adaptiveBinSize) + 1, maxBins)
  
  const counts = Array.from({ length: bins }, () => 0)
  for (const s of summaries) {
    const idx = Math.min(Math.floor((s.totalPaid - min) / adaptiveBinSize), bins - 1)
    counts[idx]++
  }
  
  return counts.map((value, i) => {
    const binStart = min + (i * adaptiveBinSize)
    const binEnd = min + ((i + 1) * adaptiveBinSize)
    return {
      name: `$${Math.round(binStart / 1000)}k-$${Math.round(binEnd / 1000)}k`,
      value,
      range: `${Math.round(binStart)}-${Math.round(binEnd)}`,
    }
  }).filter(bin => bin.value > 0) // Only show bins with data
}

// 3) Outreach Funnel (pseudo-derived)
export function outreachFunnel(outreach: Outreach[]) {
  const stages = ['sent', 'delivered', 'reached', 'scheduled', 'completed'] as const
  const total = outreach.length
  const delivered = Math.round(total * 0.92)
  const reached = Math.round(delivered * 0.55)
  const scheduled = Math.round(reached * 0.6)
  const completed = Math.round(scheduled * 0.7)
  const values = [total, delivered, reached, scheduled, completed]
  return stages.map((stage, i) => ({ stage, value: values[i] }))
}

// 4) Member Interaction Volume by Team
export function interactionsByTeam(outreach: Outreach[], weeksBack = 12) {
  const teams = Array.from(new Set(outreach.map(o => o.teamId || o.team || 'Unknown')))
  const now = new Date()
  const rows: any[] = []
  for (let i = weeksBack; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i - 1) * 7)
    const label = `${start.getMonth() + 1}/${start.getDate()}`
    const row: any = { week: label }
    for (const t of teams) row[t] = 0
    for (const o of outreach) {
      const d = new Date(o.occurredAt || o.timestamp)
      if (d >= start && d < end) {
        const teamKey = o.teamId || o.team || 'Unknown'
        row[teamKey] = (row[teamKey] || 0) + 1
      }
    }
    rows.push(row)
  }
  return { teams, rows }
}

// 5) High-Cost Claimants Pareto
export function paretoHighCost(summaries: MemberClaimsSummary[], topN = 20) {
  const sorted = [...summaries].sort((a, b) => b.totalPaid - a.totalPaid).slice(0, topN)
  const total = sorted.reduce((s, x) => s + x.totalPaid, 0) || 1
  let cum = 0
  return sorted.map(s => {
    cum += s.totalPaid
    return {
      name: s.memberId,
      cost: Math.round(s.totalPaid),
      cumPct: Math.round((cum / total) * 100),
    }
  })
}

