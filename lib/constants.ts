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

// Data as-of date (Through Date)
export const DATA_AS_OF = "2025-09-30"

// Program types
export type Program = "Stars" | "Medicaid"

// HEDIS/Program measure codes
export type MeasureCode =
  | "BCS" // Breast Cancer Screening
  | "CCS" // Cervical Cancer Screening
  | "COL" // Colorectal Cancer Screening
  | "CBP" // Controlling High Blood Pressure
  | "HBD" // Hemoglobin A1c Control for Patients With Diabetes
  | "W30" // Well-child, first 30 months (Medicaid withhold)

export const MEASURE_LABEL: Record<MeasureCode, string> = {
  BCS: "Breast Cancer Screening",
  CCS: "Cervical Cancer Screening",
  COL: "Colorectal Cancer Screening",
  CBP: "Controlling High Blood Pressure",
  HBD: "A1c Control for Diabetes",
  W30: "Well-Child Visits (0–30mo)",
}

// Map common conditions -> program measures (illustrative, mock-only)
export const CONDITION_TO_MEASURES: Record<string, { code: MeasureCode; program: Program }[]> = {
  "Breast Cancer Risk": [{ code: "BCS", program: "Stars" }],
  "Cervical Cancer Risk": [{ code: "CCS", program: "Stars" }],
  "Colorectal Cancer Risk": [{ code: "COL", program: "Stars" }],
  "Hypertension": [{ code: "CBP", program: "Stars" }],
  "Diabetes": [{ code: "HBD", program: "Stars" }],
  "Pediatrics": [{ code: "W30", program: "Medicaid" }],
}

// SDOH scales (mock reference ranges)
export const SDOH_SCALES: Record<string, string> = {
  "Food Security": "0–25 low need, 26–60 moderate, 61–100 high",
  "Food Insecurity": "0–25 low need, 26–60 moderate, 61–100 high",
  "Housing": "0–25 low need, 26–60 moderate, 61–100 high",
  "Housing and Neighborhood": "0–25 low need, 26–60 moderate, 61–100 high",
  "Transportation": "0–25 low need, 26–60 moderate, 61–100 high",
  "Financial": "0–25 low need, 26–60 moderate, 61–100 high",
  "Economic Instability": "0–25 low need, 26–60 moderate, 61–100 high",
  "ADI": "1–10 decile; 1=least deprived, 10=most",
  "SVI": "0–1 index; higher indicates greater vulnerability",
  "Social Risk Score": "0–25 low need, 26–60 moderate, 61–100 high",
  "Healthcare Access": "0–25 low need, 26–60 moderate, 61–100 high",
  "Education": "0–25 low need, 26–60 moderate, 61–100 high",
  "Social and Community": "0–25 low need, 26–60 moderate, 61–100 high",
}

// HEDIS purpose codes for dropdown display
export const PURPOSE_CODES = [
  { code: 'AWV', label: 'Annual Wellness Visit' },
  { code: 'BCS', label: 'Breast Cancer Screening' },
  { code: 'CCS', label: 'Cervical Cancer Screening' },
  { code: 'COL', label: 'Colorectal Cancer Screening' },
  { code: 'CBP', label: 'Controlling High Blood Pressure' },
  { code: 'CTFU', label: 'Care Transition Follow-up' },
  { code: 'HBD', label: 'A1c Control for Diabetes' },
  { code: 'HRA-C', label: 'HRA Completion' },
  { code: 'HRA-R', label: 'HRA Reminder' },
  { code: 'MA', label: 'Medication Adherence' },
  { code: 'RAF', label: 'RAF/Chart Retrieval' },
  { code: 'SDOH-EC', label: 'SDOH—Economic Instability' },
  { code: 'SDOH-ED', label: 'SDOH—Education' },
  { code: 'SDOH-FI', label: 'SDOH—Food Insecurity' },
  { code: 'SDOH-HA', label: 'SDOH—Healthcare Access' },
  { code: 'SDOH-HN', label: 'SDOH—Housing and Neighborhood' },
  { code: 'SDOH-SC', label: 'SDOH—Social and Community' },
] as const

// Map purpose strings to codes for display
export const PURPOSE_TO_CODE: Record<string, string> = {
  'AWV': 'AWV',
  'HEDIS - Mammogram': 'BCS',
  'HEDIS - A1c': 'HBD',
  'HRA Completion': 'HRA-C',
  'HRA Reminder': 'HRA-R',
  'Medication Adherence': 'MA',
  'RAF/Chart Retrieval': 'RAF',
  'Care Transition Follow-up': 'CTFU',
  'SDOH—Economic Instability': 'SDOH-EC',
  'SDOH—Food Insecurity': 'SDOH-FI',
  'SDOH—Housing and Neighborhood': 'SDOH-HN',
  'SDOH—Healthcare Access': 'SDOH-HA',
  'SDOH—Education': 'SDOH-ED',
  'SDOH—Social and Community': 'SDOH-SC',
}

// Map codes back to purpose strings
export const CODE_TO_PURPOSE: Record<string, string> = {
  'AWV': 'AWV',
  'BCS': 'HEDIS - Mammogram',
  'HBD': 'HEDIS - A1c',
  'HRA-C': 'HRA Completion',
  'HRA-R': 'HRA Reminder',
  'MA': 'Medication Adherence',
  'RAF': 'RAF/Chart Retrieval',
  'CTFU': 'Care Transition Follow-up',
  'SDOH-EC': 'SDOH—Economic Instability',
  'SDOH-FI': 'SDOH—Food Insecurity',
  'SDOH-HN': 'SDOH—Housing and Neighborhood',
  'SDOH-HA': 'SDOH—Healthcare Access',
  'SDOH-ED': 'SDOH—Education',
  'SDOH-SC': 'SDOH—Social and Community',
}

// Status definitions for tooltips
export const STATUS_DEFINITIONS: Record<string, string> = {
  'Completed': 'Action or contact fully completed and documented.',
  'In-Progress': 'Contact started or pending member response.',
  'In Progress': 'Contact started or pending member response.',
  'Planned': 'Scheduled for future outreach or pending trigger.',
  'Failed': 'Attempt failed due to member unreachable, invalid number, or system issue.',
}

// Vendor teams (external partners)
export const VENDOR_TEAMS = [
  'Acme Outreach Co.',
  'HealthEngage Partners',
  'WellReach Communications',
] as const

// Cohort categories
export type CohortCategory = 'hedis' | 'risk' | 'sdoh'

export const COHORT_CATEGORY_LABEL: Record<CohortCategory, string> = {
  hedis: 'HEDIS Gaps',
  risk: 'Risk Gaps',
  sdoh: 'SDOH Needs',
}

// Member type codes (behavioral classification)
export type MemberTypeCode = 'nudge' | 'fatigue' | 'receptive'

export const MEMBER_TYPE_LABEL: Record<MemberTypeCode, string> = {
  nudge: 'Nudge',
  fatigue: 'Fatigue',
  receptive: 'Receptive',
}

export const MEMBER_TYPE_HELP: Record<MemberTypeCode, string> = {
  nudge: 'Open care gap with moderate abrasion risk and low recent engagement — likely to respond to a gentle reminder.',
  fatigue: 'High outreach attempts in recent 14 days or repeated declines — reduce frequency or channel-switch.',
  receptive: 'Recent positive engagement and open gap — good candidate for targeted conversion.',
}

// Display label parity for UTC
export const STATUS_LABELS: Record<string, string> = {
  unreached: 'Unable to Contact (UTC)',
}
