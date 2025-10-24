// Metrics and analytics helpers for the Careleo CRM demo
// All calculations are based on mocked data for demonstration purposes

import type { Outreach, Member } from './mock'

export interface MoMResult {
  deltaPct: number
  direction: "up" | "down" | "flat"
}

export interface OutreachFilter {
  memberId?: string
  team?: string
  purpose?: string
  channel?: string
  from?: string
  to?: string
}

/**
 * Count touches within a specified time window (in days)
 */
export function touchesInWindow(outreach: Outreach[], days: number): number {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return outreach.filter(o => {
    const touchDate = new Date(o.timestamp)
    return touchDate >= cutoffDate
  }).length
}

/**
 * Calculate average touches per member within a time window
 */
export function touchesPerMember(outreach: Outreach[], memberCount: number, days: number): number {
  const touches = touchesInWindow(outreach, days)
  return memberCount > 0 ? Math.round((touches / memberCount) * 10) / 10 : 0
}

/**
 * Calculate month-over-month percentage change
 * Returns signed percentage; snaps to "flat" for |delta| < 1%
 */
export function monthOverMonth(current: number, previous: number): MoMResult {
  if (previous === 0) {
    return { deltaPct: current > 0 ? 100 : 0, direction: current > 0 ? "up" : "flat" }
  }
  
  const deltaPct = Math.round(((current - previous) / previous) * 100)
  
  if (Math.abs(deltaPct) < 1) {
    return { deltaPct: 0, direction: "flat" }
  }
  
  return {
    deltaPct,
    direction: deltaPct > 0 ? "up" : "down"
  }
}

/**
 * Filter outreach based on various criteria
 */
export function filterOutreach(outreach: Outreach[], filter: OutreachFilter): Outreach[] {
  return outreach.filter(o => {
    if (filter.memberId && o.memberId !== filter.memberId) return false
    if (filter.team && o.team !== filter.team) return false
    if (filter.purpose && o.purpose !== filter.purpose) return false
    if (filter.channel && o.channel !== filter.channel) return false
    
    if (filter.from || filter.to) {
      const touchDate = new Date(o.timestamp)
      if (filter.from && touchDate < new Date(filter.from)) return false
      if (filter.to && touchDate > new Date(filter.to)) return false
    }
    
    return true
  })
}

/**
 * Get HRA-focused outreach (HRA Completion + HRA Reminder)
 */
export function getHraOutreach(outreach: Outreach[]): Outreach[] {
  return outreach.filter(o => 
    o.purpose === 'HRA Completion' || o.purpose === 'HRA Reminder'
  )
}

/**
 * Calculate touches by team within a time window
 */
export function getTouchesByTeam(outreach: Outreach[], days: number = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const teamCounts: Record<string, number> = {}
  
  outreach.forEach(o => {
    const touchDate = new Date(o.timestamp)
    if (touchDate >= cutoffDate) {
      teamCounts[o.team] = (teamCounts[o.team] || 0) + 1
    }
  })
  
  return Object.entries(teamCounts).map(([team, count]) => ({
    team,
    count
  })).sort((a, b) => b.count - a.count)
}

/**
 * Calculate touches by purpose within a time window
 */
export function getTouchesByPurpose(outreach: Outreach[], days: number = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const purposeCounts: Record<string, number> = {}
  
  outreach.forEach(o => {
    const touchDate = new Date(o.timestamp)
    if (touchDate >= cutoffDate) {
      purposeCounts[o.purpose] = (purposeCounts[o.purpose] || 0) + 1
    }
  })
  
  return Object.entries(purposeCounts).map(([purpose, count]) => ({
    purpose,
    count,
    isHra: purpose === 'HRA Completion' || purpose === 'HRA Reminder'
  })).sort((a, b) => b.count - a.count)
}

/**
 * Get top performing channel within a time window
 */
export function getTopChannel(outreach: Outreach[], days: number = 30): string {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const channelCounts: Record<string, number> = {}
  
  outreach.forEach(o => {
    const touchDate = new Date(o.timestamp)
    if (touchDate >= cutoffDate) {
      channelCounts[o.channel] = (channelCounts[o.channel] || 0) + 1
    }
  })
  
  return Object.entries(channelCounts).reduce((prev, current) => 
    prev[1] > current[1] ? prev : current
  )[0]
}

/**
 * Generate MoM trend data for the last 6 time windows
 */
export function getMoMTrendData(outreach: Outreach[], days: number = 30) {
  const windows = []
  
  for (let i = 5; i >= 0; i--) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - (i * days))
    
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)
    
    const windowOutreach = outreach.filter(o => {
      const touchDate = new Date(o.timestamp)
      return touchDate >= startDate && touchDate < endDate
    })
    
    windows.push({
      period: `Period ${6 - i}`,
      touches: windowOutreach.length,
      date: endDate.toISOString().split('T')[0]
    })
  }
  
  return windows
}
