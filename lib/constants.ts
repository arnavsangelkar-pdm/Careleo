// Constants for the Careleo CRM demo
// All data and actions are mocked for demonstration purposes

export const TEAMS = [
  'Risk Adjustment',
  'Quality', 
  'Member Services',
  'Case Management',
  'Pharmacy',
  'Community Partnerships'
] as const

export const PURPOSES = [
  'AWV',
  'HEDIS - A1c',
  'HEDIS - Mammogram', 
  'Medication Adherence',
  'RAF/Chart Retrieval',
  'Care Transition Follow-up',
  'SDOH—Food',
  'SDOH—Transport',
  'SDOH—Utilities',
  'SDOH—BH'
] as const

export const CHANNELS = [
  'Call',
  'SMS', 
  'Email',
  'Portal'
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

export type Team = typeof TEAMS[number]
export type Purpose = typeof PURPOSES[number] 
export type Channel = typeof CHANNELS[number]
export type Status = typeof STATUS[number]

// SDOH Constants
export const SDOH_NEEDS = [
  'Food',
  'Housing', 
  'Transportation',
  'Utilities',
  'Behavioral Health'
] as const

export type SdohNeed = typeof SDOH_NEEDS[number]
