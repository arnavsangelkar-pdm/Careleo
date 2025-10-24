// Propensity scoring functions for member outreach optimization
// All calculations are deterministic and mocked for demo purposes

import { RISK_THRESHOLDS, TIME_PERIODS, type Purpose } from './constants'
import type { Member, Outreach } from './mock'

// Deterministic seeded random number generator
function seededRng(seed: number): () => number {
  let current = seed
  return () => {
    current = (current * 9301 + 49297) % 233280
    return current / 233280
  }
}

// Helper function to get member age from DOB
function getMemberAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Helper function to check if member has relevant condition for purpose
function hasRelevantCondition(member: Member, purpose: Purpose): boolean {
  const conditionMap: Record<Purpose, string[]> = {
    'HEDIS - A1c': ['Diabetes'],
    'HEDIS - Mammogram': [], // Will check age and gender separately
    'AWV': [], // All members eligible
    'Medication Adherence': ['Diabetes', 'Hypertension', 'Heart Disease', 'High Cholesterol'],
    'RAF/Chart Retrieval': ['Diabetes', 'Hypertension', 'Heart Disease', 'COPD', 'Depression'],
    'Care Transition Follow-up': ['Heart Disease', 'COPD', 'Diabetes'],
    'SDOH—Food': [], // All members potentially eligible
    'SDOH—Transport': [], // All members potentially eligible
    'SDOH—Utilities': [], // All members potentially eligible
    'SDOH—BH': ['Depression', 'Anxiety'] // Members with mental health conditions
  }
  
  const relevantConditions = conditionMap[purpose] || []
  return relevantConditions.some(condition => member.conditions.includes(condition))
}

// Helper function to get outreach in time window
function getOutreachInWindow(outreach: Outreach[], memberId: string, days: number): Outreach[] {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return outreach.filter(o => 
    o.memberId === memberId && 
    new Date(o.timestamp) >= cutoffDate
  )
}

// Calculate nudge propensity score (0-100)
export function scoreNudgePropensity(member: Member, outreach: Outreach[]): number {
  const memberOutreach = outreach.filter(o => o.memberId === member.id)
  const rng = seededRng(parseInt(member.id.replace('M', '')))
  
  let score = 50 // Base score
  
  // +15 if member has chronic condition relevant to common purposes
  const hasDiabetes = member.conditions.includes('Diabetes')
  const hasHypertension = member.conditions.includes('Hypertension')
  const hasHeartDisease = member.conditions.includes('Heart Disease')
  
  if (hasDiabetes || hasHypertension || hasHeartDisease) {
    score += 15
  }
  
  // +10 if last completed outreach was 14-90 days ago
  const completedOutreach = memberOutreach.filter(o => o.status === 'Completed')
  if (completedOutreach.length > 0) {
    const lastCompleted = new Date(completedOutreach[0].timestamp)
    const daysSinceLastCompleted = (Date.now() - lastCompleted.getTime()) / (24 * 60 * 60 * 1000)
    if (daysSinceLastCompleted >= 14 && daysSinceLastCompleted <= 90) {
      score += 10
    }
  }
  
  // -10 if touches in last 7d >= 3
  const recentTouches = getOutreachInWindow(memberOutreach, member.id, TIME_PERIODS.RECENT_TOUCHES)
  if (recentTouches.length >= 3) {
    score -= 10
  }
  
  // Add some deterministic randomness based on member ID
  score += (rng() - 0.5) * 10
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

// Calculate negative sentiment risk score (0-100)
export function scoreNegativeSentiment(member: Member, outreach: Outreach[]): number {
  const memberOutreach = outreach.filter(o => o.memberId === member.id)
  const rng = seededRng(parseInt(member.id.replace('M', '')) + 1000)
  
  let score = 30 // Base score
  
  // +25 if touches in last 7d >= 3 AND completion rate in last 30d < 30%
  const recentTouches = getOutreachInWindow(memberOutreach, member.id, TIME_PERIODS.RECENT_TOUCHES)
  const last30DaysOutreach = getOutreachInWindow(memberOutreach, member.id, TIME_PERIODS.COMPLETION_RATE_WINDOW)
  
  if (recentTouches.length >= 3) {
    const completedIn30Days = last30DaysOutreach.filter(o => o.status === 'Completed').length
    const completionRate = last30DaysOutreach.length > 0 ? (completedIn30Days / last30DaysOutreach.length) * 100 : 0
    
    if (completionRate < 30) {
      score += 25
    }
  }
  
  // +15 if >=2 consecutive Failed/In-Progress without a Completed in between
  let consecutiveFailed = 0
  let hasCompletedInBetween = false
  
  for (const entry of memberOutreach.slice(0, 5)) { // Check last 5 entries
    if (entry.status === 'Completed') {
      hasCompletedInBetween = true
      break
    } else if (entry.status === 'Failed' || entry.status === 'In-Progress') {
      consecutiveFailed++
    }
  }
  
  if (consecutiveFailed >= 2 && !hasCompletedInBetween) {
    score += 15
  }
  
  // -10 if a recent completed exists in last 7d
  const recentCompleted = recentTouches.filter(o => o.status === 'Completed')
  if (recentCompleted.length > 0) {
    score -= 10
  }
  
  // Add some deterministic randomness based on member ID
  score += (rng() - 0.5) * 8
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

// Calculate channel preference based on completion rates
export function calculateChannelPreference(member: Member, outreach: Outreach[]): string {
  const memberOutreach = outreach.filter(o => o.memberId === member.id)
  const channelStats: Record<string, { total: number; completed: number }> = {}
  
  // Initialize channel stats
  const channels = ['Call', 'SMS', 'Email', 'Portal']
  channels.forEach(channel => {
    channelStats[channel] = { total: 0, completed: 0 }
  })
  
  // Count total and completed outreach by channel
  memberOutreach.forEach(entry => {
    channelStats[entry.channel].total++
    if (entry.status === 'Completed') {
      channelStats[entry.channel].completed++
    }
  })
  
  // Calculate completion rates and find best channel
  let bestChannel = 'Call' // Default
  let bestRate = 0
  
  channels.forEach(channel => {
    const stats = channelStats[channel]
    if (stats.total > 0) {
      const rate = stats.completed / stats.total
      if (rate > bestRate) {
        bestRate = rate
        bestChannel = channel
      }
    }
  })
  
  return bestChannel
}

// Calculate member signals (nudge propensity, negative sentiment, channel preference)
export function calculateMemberSignals(member: Member, outreach: Outreach[]) {
  return {
    nudgePropensity: scoreNudgePropensity(member, outreach),
    negSentimentRisk: scoreNegativeSentiment(member, outreach),
    channelPreference: calculateChannelPreference(member, outreach)
  }
}
