// Cohort identification functions for member segmentation
// All calculations are deterministic and mocked for demo purposes

import { RISK_THRESHOLDS, TIME_PERIODS } from './constants'
import { calculateMemberSignals } from './propensity'
import type { Member, Outreach } from './mock'

export interface CohortMember {
  memberId: string
  member: Member
  signals: {
    nudgePropensity: number
    negSentimentRisk: number
    channelPreference: string
  }
  metadata?: Record<string, any>
}

export interface Cohort {
  id: string
  name: string
  description: string
  members: CohortMember[]
  count: number
  recommendedAction: string
  sparklineData?: number[]
}

// Helper function to get outreach in time window
function getOutreachInWindow(outreach: Outreach[], memberId: string, days: number): Outreach[] {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return outreach.filter(o => 
    o.memberId === memberId && 
    new Date(o.timestamp) >= cutoffDate
  )
}

// Helper function to check if member has purpose in time window
function hasPurposeInWindow(outreach: Outreach[], memberId: string, purpose: string, days: number): boolean {
  const windowOutreach = getOutreachInWindow(outreach, memberId, days)
  return windowOutreach.some(o => o.purpose === purpose)
}

// Helper function to calculate completion rate
function calculateCompletionRate(outreach: Outreach[], memberId: string, days: number): number {
  const windowOutreach = getOutreachInWindow(outreach, memberId, days)
  if (windowOutreach.length === 0) return 0
  
  const completed = windowOutreach.filter(o => o.status === 'Completed').length
  return (completed / windowOutreach.length) * 100
}

// 1. Receptive: A1c Nudge cohort
export function getA1cNudgeReceptiveCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    // Check if member meets A1c nudge criteria
    const hasDiabetes = member.conditions.includes('Diabetes')
    const hasCompletedOutreach = hasPurposeInWindow(outreach, member.id, 'HEDIS - A1c', TIME_PERIODS.A1C_LOOKBACK)
    const notRecentlyContacted = getOutreachInWindow(outreach, member.id, TIME_PERIODS.RECENT_TOUCHES).length === 0
    
    if (signals.nudgePropensity >= RISK_THRESHOLDS.NUDGE_PROPENSITY_HIGH && 
        (hasDiabetes || (hasCompletedOutreach && notRecentlyContacted))) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          hasDiabetes,
          lastA1cOutreach: hasCompletedOutreach,
          daysSinceLastContact: notRecentlyContacted ? '7+' : '0-7'
        }
      })
    }
  })
  
  return cohortMembers
}

// 2. Receptive: Mammogram Nudge cohort
export function getMammogramNudgeReceptiveCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    // Check if member meets mammogram nudge criteria (simplified - assume all members are eligible)
    const noRecentMammogram = !hasPurposeInWindow(outreach, member.id, 'HEDIS - Mammogram', TIME_PERIODS.MAMMOGRAM_LOOKBACK)
    
    if (signals.nudgePropensity >= RISK_THRESHOLDS.NUDGE_PROPENSITY_HIGH && noRecentMammogram) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          lastMammogram: noRecentMammogram ? '6+ months ago' : 'Recent'
        }
      })
    }
  })
  
  return cohortMembers
}

// 3. Receptive: AWV cohort
export function getAWVReceptiveCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    // Check if member meets AWV criteria
    const noRecentAWV = !hasPurposeInWindow(outreach, member.id, 'AWV', TIME_PERIODS.AWV_LOOKBACK)
    
    if (signals.nudgePropensity >= RISK_THRESHOLDS.NUDGE_PROPENSITY_MEDIUM && noRecentAWV) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          lastAWV: noRecentAWV ? '12+ months ago' : 'Recent'
        }
      })
    }
  })
  
  return cohortMembers
}

// 4. Negative Sentiment Risk (High) cohort
export function getNegativeSentimentRiskCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    if (signals.negSentimentRisk >= RISK_THRESHOLDS.NEGATIVE_SENTIMENT_HIGH) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          riskLevel: 'High',
          recentTouches: getOutreachInWindow(outreach, member.id, TIME_PERIODS.RECENT_TOUCHES).length,
          completionRate: calculateCompletionRate(outreach, member.id, TIME_PERIODS.COMPLETION_RATE_WINDOW)
        }
      })
    }
  })
  
  return cohortMembers
}

// 5. Fatigue Risk (Multi-channel) cohort
export function getFatigueRiskCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    const recentTouches = getOutreachInWindow(outreach, member.id, TIME_PERIODS.RECENT_TOUCHES)
    const completionRate = calculateCompletionRate(outreach, member.id, TIME_PERIODS.COMPLETION_RATE_WINDOW)
    
    if (recentTouches.length >= RISK_THRESHOLDS.FATIGUE_RISK_TOUCHES && 
        completionRate < RISK_THRESHOLDS.FATIGUE_RISK_COMPLETION_RATE) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          recentTouches: recentTouches.length,
          completionRate: Math.round(completionRate),
          channels: Array.from(new Set(recentTouches.map(o => o.channel)))
        }
      })
    }
  })
  
  return cohortMembers
}

// 6. Unreached (Recently Added) cohort
export function getUnreachedCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    const recentTouches = getOutreachInWindow(outreach, member.id, TIME_PERIODS.UNREACHED_THRESHOLD)
    
    if (recentTouches.length === 0) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          daysSinceLastTouch: '30+',
          totalOutreach: outreach.filter(o => o.memberId === member.id).length
        }
      })
    }
  })
  
  return cohortMembers
}

// SDOH Cohorts

// 7. Food Support Likely cohort
export function getFoodSupportLikelyCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    if (member.sdoh && member.sdoh.needs.food >= 65) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          foodNeed: member.sdoh.needs.food,
          socialRisk: member.sdoh.socialRiskScore,
          recommendedResources: member.sdoh.recommendedResources.filter(r => r.type === 'Food').length
        }
      })
    }
  })
  
  return cohortMembers
}

// 8. Transportation Support Likely cohort
export function getTransportationSupportLikelyCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    if (member.sdoh && member.sdoh.needs.transportation >= 65) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          transportNeed: member.sdoh.needs.transportation,
          socialRisk: member.sdoh.socialRiskScore,
          recommendedResources: member.sdoh.recommendedResources.filter(r => r.type === 'Transportation').length
        }
      })
    }
  })
  
  return cohortMembers
}

// 9. Utilities Assistance Likely cohort
export function getUtilitiesAssistanceLikelyCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    if (member.sdoh && member.sdoh.needs.utilities >= 65) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          utilitiesNeed: member.sdoh.needs.utilities,
          socialRisk: member.sdoh.socialRiskScore,
          recommendedResources: member.sdoh.recommendedResources.filter(r => r.type === 'Utilities').length
        }
      })
    }
  })
  
  return cohortMembers
}

// 10. BH Support Likely cohort
export function getBHSupportLikelyCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    
    if (member.sdoh && member.sdoh.needs.behavioralHealth >= 65) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          bhNeed: member.sdoh.needs.behavioralHealth,
          socialRisk: member.sdoh.socialRiskScore,
          recommendedResources: member.sdoh.recommendedResources.filter(r => r.type === 'Behavioral Health').length
        }
      })
    }
  })
  
  return cohortMembers
}

// 11. Nudge-Receptive for AWV (SDOH context)
export function getNudgeReceptiveAWVCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    const recentTouches = getOutreachInWindow(outreach, member.id, TIME_PERIODS.RECENT_TOUCHES)
    
    if (signals.nudgePropensity >= RISK_THRESHOLDS.NUDGE_PROPENSITY_HIGH && 
        recentTouches.length <= 1 && 
        member.sdoh && 
        member.sdoh.socialRiskScore <= 60) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          nudgePropensity: signals.nudgePropensity,
          recentTouches: recentTouches.length,
          socialRisk: member.sdoh.socialRiskScore
        }
      })
    }
  })
  
  return cohortMembers
}

// 12. Negative Sentiment Risk (SDOH context)
export function getNegativeSentimentRiskSdohCohort(members: Member[], outreach: Outreach[]): CohortMember[] {
  const cohortMembers: CohortMember[] = []
  
  members.forEach(member => {
    const signals = calculateMemberSignals(member, outreach)
    const recentTouches = getOutreachInWindow(outreach, member.id, TIME_PERIODS.RECENT_TOUCHES)
    
    if (signals.negSentimentRisk >= RISK_THRESHOLDS.NEGATIVE_SENTIMENT_HIGH && 
        recentTouches.length >= 3 &&
        member.sdoh &&
        member.sdoh.socialRiskScore >= 70) {
      cohortMembers.push({
        memberId: member.id,
        member,
        signals,
        metadata: {
          negSentimentRisk: signals.negSentimentRisk,
          recentTouches: recentTouches.length,
          socialRisk: member.sdoh.socialRiskScore,
          topNeed: Object.entries(member.sdoh.needs).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
        }
      })
    }
  })
  
  return cohortMembers
}

// Generate all cohorts
export function generateAllCohorts(members: Member[], outreach: Outreach[]): Cohort[] {
  const cohorts: Cohort[] = []
  
  // Generate mock sparkline data (7 days)
  const generateSparkline = (baseValue: number, variance: number = 0.2): number[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayValue = baseValue + (Math.sin(i * 0.5) * variance * baseValue)
      return Math.max(0, Math.round(dayValue))
    })
  }
  
  const a1cCohort = getA1cNudgeReceptiveCohort(members, outreach)
  cohorts.push({
    id: 'a1c-nudge',
    name: 'Receptive: A1c Nudge',
    description: 'Members with high nudge propensity for A1c testing',
    members: a1cCohort,
    count: a1cCohort.length,
    recommendedAction: 'Prefer SMS for diabetes management',
    sparklineData: generateSparkline(a1cCohort.length * 0.1, 0.3)
  })
  
  const mammogramCohort = getMammogramNudgeReceptiveCohort(members, outreach)
  cohorts.push({
    id: 'mammogram-nudge',
    name: 'Receptive: Mammogram Nudge',
    description: 'Members due for mammogram screening',
    members: mammogramCohort,
    count: mammogramCohort.length,
    recommendedAction: 'Use Email for screening reminders',
    sparklineData: generateSparkline(mammogramCohort.length * 0.08, 0.4)
  })
  
  const awvCohort = getAWVReceptiveCohort(members, outreach)
  cohorts.push({
    id: 'awv-nudge',
    name: 'Receptive: AWV',
    description: 'Members due for Annual Wellness Visit',
    members: awvCohort,
    count: awvCohort.length,
    recommendedAction: 'Call for comprehensive care planning',
    sparklineData: generateSparkline(awvCohort.length * 0.12, 0.25)
  })
  
  const negativeSentimentCohort = getNegativeSentimentRiskCohort(members, outreach)
  cohorts.push({
    id: 'negative-sentiment',
    name: 'Negative Sentiment Risk (High)',
    description: 'Members at high risk of negative sentiment',
    members: negativeSentimentCohort,
    count: negativeSentimentCohort.length,
    recommendedAction: 'Pause outreach 7 days, review approach',
    sparklineData: generateSparkline(negativeSentimentCohort.length * 0.15, 0.5)
  })
  
  const fatigueCohort = getFatigueRiskCohort(members, outreach)
  cohorts.push({
    id: 'fatigue-risk',
    name: 'Fatigue Risk (Multi-channel)',
    description: 'Members showing outreach fatigue across channels',
    members: fatigueCohort,
    count: fatigueCohort.length,
    recommendedAction: 'Reduce frequency, focus on preferred channel',
    sparklineData: generateSparkline(fatigueCohort.length * 0.2, 0.6)
  })
  
  const unreachedCohort = getUnreachedCohort(members, outreach)
  cohorts.push({
    id: 'unreached',
    name: 'Unreached (Recently Added)',
    description: 'Members with no outreach in last 30 days',
    members: unreachedCohort,
    count: unreachedCohort.length,
    recommendedAction: 'Initiate welcome sequence',
    sparklineData: generateSparkline(unreachedCohort.length * 0.05, 0.8)
  })
  
  // SDOH Cohorts
  const foodCohort = getFoodSupportLikelyCohort(members, outreach)
  cohorts.push({
    id: 'food-support',
    name: 'Food Support Likely',
    description: 'Members with high food insecurity needs (≥65)',
    members: foodCohort,
    count: foodCohort.length,
    recommendedAction: 'Connect with food assistance programs',
    sparklineData: generateSparkline(foodCohort.length * 0.1, 0.3)
  })
  
  const transportCohort = getTransportationSupportLikelyCohort(members, outreach)
  cohorts.push({
    id: 'transport-support',
    name: 'Transportation Support Likely',
    description: 'Members with high transportation needs (≥65)',
    members: transportCohort,
    count: transportCohort.length,
    recommendedAction: 'Provide transportation assistance options',
    sparklineData: generateSparkline(transportCohort.length * 0.08, 0.4)
  })
  
  const utilitiesCohort = getUtilitiesAssistanceLikelyCohort(members, outreach)
  cohorts.push({
    id: 'utilities-support',
    name: 'Utilities Assistance Likely',
    description: 'Members with high utilities assistance needs (≥65)',
    members: utilitiesCohort,
    count: utilitiesCohort.length,
    recommendedAction: 'Connect with energy assistance programs',
    sparklineData: generateSparkline(utilitiesCohort.length * 0.12, 0.35)
  })
  
  const bhCohort = getBHSupportLikelyCohort(members, outreach)
  cohorts.push({
    id: 'bh-support',
    name: 'BH Support Likely',
    description: 'Members with high behavioral health needs (≥65)',
    members: bhCohort,
    count: bhCohort.length,
    recommendedAction: 'Connect with mental health resources',
    sparklineData: generateSparkline(bhCohort.length * 0.15, 0.5)
  })
  
  const nudgeReceptiveCohort = getNudgeReceptiveAWVCohort(members, outreach)
  cohorts.push({
    id: 'nudge-receptive-awv',
    name: 'Nudge-Receptive for AWV',
    description: 'High nudge propensity, low recent touches, low social risk',
    members: nudgeReceptiveCohort,
    count: nudgeReceptiveCohort.length,
    recommendedAction: 'Schedule AWV with preferred channel',
    sparklineData: generateSparkline(nudgeReceptiveCohort.length * 0.2, 0.25)
  })
  
  const negativeSentimentSdohCohort = getNegativeSentimentRiskSdohCohort(members, outreach)
  cohorts.push({
    id: 'negative-sentiment-sdoh',
    name: 'Negative Sentiment Risk (SDOH)',
    description: 'High sentiment risk with SDOH context and frequent touches',
    members: negativeSentimentSdohCohort,
    count: negativeSentimentSdohCohort.length,
    recommendedAction: 'Pause outreach, review SDOH support approach',
    sparklineData: generateSparkline(negativeSentimentSdohCohort.length * 0.3, 0.7)
  })
  
  return cohorts
}
