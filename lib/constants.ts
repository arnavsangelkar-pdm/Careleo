// Constants for the Careleo CRM demo
// All data and actions are mocked for demonstration purposes

import type { Plan } from './types'

export const PLANS: Plan[] = [
  'MA HMO',
  'MA PPO',
  'MA PFFS',
  'MA SNP',
  'Medicaid-NY',
  'Medicaid-KY',
  'Medicaid-FL',
  'Medicaid-GA',
  'Medicaid-NV',
  'Medicaid-NC',
  'D-SNP',
];

export const OUTREACH_TEAMS = ['Care Coordination', 'Eligibility & Benefits'] as const;
export type OutreachTeam = typeof OUTREACH_TEAMS[number];

export const LOB = [
  "Medicare Advantage", 
  "Medicaid", 
  "Commercial"
] as const

export const TEAMS = [
  'Risk Adjustment',
  'Quality', 
  'Member Services',
  'Case Management',
  'Pharmacy',
  'Community Partnerships'
] as const

export const PURPOSES = [
  'HRA Completion',
  'HRA Reminder',
  'AWV',
  'HEDIS - A1c',
  'HEDIS - Mammogram', 
  'Medication Adherence',
  'RAF/Chart Retrieval',
  'Care Transition Follow-up',
  'SDOH—Economic Instability',
  'SDOH—Food Insecurity',
  'SDOH—Housing and Neighborhood',
  'SDOH—Healthcare Access',
  'SDOH—Education',
  'SDOH—Social and Community'
] as const

export const CHANNELS = [
  'Call',
  'SMS', 
  'Email',
  'Portal'
] as const

export const MEMBER_TYPES = [
  'Member',
  'Prospect'
] as const

export const STATUS = [
  'Planned',
  'In-Progress',
  'Completed',
  'Failed'
] as const

// Risk thresholds for cohort identification
export const RISK_THRESHOLDS = {
  NUDGE_PROPENSITY_HIGH: 65,
  NUDGE_PROPENSITY_MEDIUM: 60,
  NEGATIVE_SENTIMENT_HIGH: 70,
  NEGATIVE_SENTIMENT_MEDIUM: 50,
  FATIGUE_RISK_TOUCHES: 4,
  FATIGUE_RISK_COMPLETION_RATE: 25
} as const

// Time periods in days
export const TIME_PERIODS = {
  RECENT_TOUCHES: 7,
  COMPLETION_RATE_WINDOW: 30,
  A1C_LOOKBACK: 180,
  MAMMOGRAM_LOOKBACK: 180,
  AWV_LOOKBACK: 365,
  UNREACHED_THRESHOLD: 30
} as const

export type Lob = typeof LOB[number]
export type Team = typeof TEAMS[number]
export type Purpose = typeof PURPOSES[number] 
export type Channel = typeof CHANNELS[number]
export type Status = typeof STATUS[number]
export type MemberType = typeof MEMBER_TYPES[number]

// SDOH Constants
export const SDOH_NEEDS = [
  'Economic Instability',
  'Food Insecurity', 
  'Housing and Neighborhood Issues',
  'Healthcare Access',
  'Education',
  'Social and Community Context'
] as const

export type SdohNeed = typeof SDOH_NEEDS[number]
