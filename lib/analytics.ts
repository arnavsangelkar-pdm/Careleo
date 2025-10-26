// Analytics utilities for the unified Analytics dashboard
// All calculations are deterministic and based on mocked data

import type { Outreach, Member } from './mock'

export interface TimeWindow {
  from: Date
  to: Date
}

export interface TouchesOverTimeData {
  weekLabel: string
  hra: number
  all: number
}

export interface TeamCountData {
  team: string
  count: number
}

export interface PurposeCountData {
  purpose: string
  count: number
  isHRA: boolean
}

export interface ChannelSuccessData {
  channel: string
  completed: number
  total: number
  rate: number
}

export interface TouchesPerMemberData {
  bin: string
  count: number
}

export interface AnalyticsFilters {
  window?: 'last30d' | 'last60d' | 'last90d' | 'week:1' | 'week:2' | 'week:3' | 'week:4' | 'week:5' | 'week:6' | 'week:7' | 'week:8' | 'week:9' | 'week:10' | 'week:11' | 'week:12'
  memberType?: 'Member' | 'Prospect' | 'Both'
  team?: string
  purpose?: string
  channel?: string
}

/**
 * Convert time window string to date range
 */
export function timeWindowRange(window: AnalyticsFilters['window']): TimeWindow {
  const now = new Date()
  const to = new Date(now)
  
  if (!window || window === 'last30d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 30)
    return { from, to }
  }
  
  if (window === 'last60d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 60)
    return { from, to }
  }
  
  if (window === 'last90d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 90)
    return { from, to }
  }
  
  if (window.startsWith('week:')) {
    const weekNum = parseInt(window.split(':')[1])
    const from = new Date(now)
    from.setDate(from.getDate() - (weekNum * 7))
    const to = new Date(from)
    to.setDate(to.getDate() + 7)
    return { from, to }
  }
  
  // Default to 30 days
  const from = new Date(now)
  from.setDate(from.getDate() - 30)
  return { from, to }
}

/**
 * Filter outreach data based on criteria
 */
export function subsetOutreach(
  outreach: Outreach[], 
  filters: {
    from?: Date
    to?: Date
    team?: string
    purpose?: string
    channel?: string
    memberType?: string
  },
  members?: Member[]
): Outreach[] {
  return outreach.filter(o => {
    // Date filtering
    if (filters.from || filters.to) {
      const touchDate = new Date(o.timestamp)
      if (filters.from && touchDate < filters.from) return false
      if (filters.to && touchDate > filters.to) return false
    }
    
    // Team filtering
    if (filters.team && o.team !== filters.team) return false
    
    // Purpose filtering
    if (filters.purpose && o.purpose !== filters.purpose) return false
    
    // Channel filtering
    if (filters.channel && o.channel !== filters.channel) return false
    
    // Member type filtering
    if (filters.memberType && filters.memberType !== 'Both' && members) {
      const member = members.find(m => m.id === o.memberId)
      if (!member || member.memberType !== filters.memberType) return false
    }
    
    return true
  })
}

/**
 * Generate touches over time data for the last 12 weeks
 * Returns HRA touches and all touches by week
 */
export function seriesTouchesOverTime(outreach: Outreach[], weeks: number = 12): TouchesOverTimeData[] {
  const data: TouchesOverTimeData[] = []
  const now = new Date()
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    const weekOutreach = outreach.filter(o => {
      const touchDate = new Date(o.timestamp)
      return touchDate >= weekStart && touchDate < weekEnd
    })
    
    const hraTouches = weekOutreach.filter(o => 
      o.purpose === 'HRA Completion' || o.purpose === 'HRA Reminder'
    ).length
    
    const weekLabel = `Week ${weeks - i}`
    
    data.push({
      weekLabel,
      hra: hraTouches,
      all: weekOutreach.length
    })
  }
  
  return data
}

/**
 * Count touches by team within time window
 */
export function countsByTeam(outreach: Outreach[]): TeamCountData[] {
  const teamCounts: Record<string, number> = {}
  
  outreach.forEach(o => {
    const team = o.team || 'Unknown'
    teamCounts[team] = (teamCounts[team] || 0) + 1
  })
  
  return Object.entries(teamCounts)
    .map(([team, count]) => ({ team, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Count touches by purpose within time window
 * Marks HRA purposes for highlighting
 */
export function countsByPurpose(outreach: Outreach[]): PurposeCountData[] {
  const purposeCounts: Record<string, number> = {}
  
  outreach.forEach(o => {
    purposeCounts[o.purpose] = (purposeCounts[o.purpose] || 0) + 1
  })
  
  return Object.entries(purposeCounts)
    .map(([purpose, count]) => ({
      purpose,
      count,
      isHRA: purpose === 'HRA Completion' || purpose === 'HRA Reminder'
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Calculate channel success rate (Completed / Total)
 */
export function channelSuccessRate(outreach: Outreach[]): ChannelSuccessData[] {
  const channelData: Record<string, { completed: number; total: number }> = {}
  
  outreach.forEach(o => {
    if (!channelData[o.channel]) {
      channelData[o.channel] = { completed: 0, total: 0 }
    }
    channelData[o.channel].total++
    if (o.status === 'Completed') {
      channelData[o.channel].completed++
    }
  })
  
  return Object.entries(channelData).map(([channel, data]) => ({
    channel,
    completed: data.completed,
    total: data.total,
    rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
  }))
}

/**
 * Generate histogram of touches per member distribution
 * Only includes members with memberType="Member"
 */
export function touchesPerMemberHistogram(outreach: Outreach[], members: Member[]): TouchesPerMemberData[] {
  // Filter to only Members (exclude Prospects)
  const memberIds = members
    .filter(m => m.memberType === 'Member')
    .map(m => m.id)
  
  // Count touches per member
  const memberTouchCounts: Record<string, number> = {}
  memberIds.forEach(id => {
    memberTouchCounts[id] = 0
  })
  
  outreach.forEach(o => {
    if (memberTouchCounts.hasOwnProperty(o.memberId)) {
      memberTouchCounts[o.memberId]++
    }
  })
  
  // Create histogram bins
  const bins = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4-5': 0,
    '6-7': 0,
    '8+': 0
  }
  
  Object.values(memberTouchCounts).forEach(count => {
    if (count === 0) bins['0']++
    else if (count === 1) bins['1']++
    else if (count === 2) bins['2']++
    else if (count === 3) bins['3']++
    else if (count >= 4 && count <= 5) bins['4-5']++
    else if (count >= 6 && count <= 7) bins['6-7']++
    else bins['8+']++
  })
  
  return Object.entries(bins).map(([bin, count]) => ({ bin, count }))
}

/**
 * Get week number from week string (e.g., "week:5" -> 5)
 */
export function getWeekNumber(weekStr: string): number {
  if (weekStr.startsWith('week:')) {
    return parseInt(weekStr.split(':')[1])
  }
  return 0
}

/**
 * Get display label for time window
 */
export function getTimeWindowLabel(window: AnalyticsFilters['window']): string {
  if (!window || window === 'last30d') return '30d'
  if (window === 'last60d') return '60d'
  if (window === 'last90d') return '90d'
  if (window.startsWith('week:')) {
    const weekNum = getWeekNumber(window)
    return `Week ${weekNum}`
  }
  return '30d'
}
