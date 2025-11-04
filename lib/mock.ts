// Data generators for the Healthcare CRM
// Deterministic data generation for consistent results

import type { PlanInfo, Plan, Cohort } from './types'
import { LOB, MEMBER_TYPES, PLANS, CONDITION_TO_MEASURES, DATA_AS_OF, VENDOR_TEAMS, type MemberTypeCode } from './constants'
import type { Measure } from './types'

export interface Member {
  id: string
  memberId: string // displayable plan ID
  name: string
  dob: string
  plan: Plan
  vendor: string
  phone: string
  email: string
  address: string
  conditions: string[]
  risk: number // 0-100 (Abrasion Risk Score)
  planInfo: PlanInfo // New field for health plan contract details
  memberType: 'Member' | 'Prospect' // New field for member vs prospect
  sdoh?: import('./types').MemberSdohProfile
  measures?: Measure[] // NEW: program measures derived from conditions
  cohorts?: string[] // array of cohort ids
  behavioralType?: import('./constants').MemberTypeCode // derived behavioral classification
}

export interface Outreach {
  id: string
  memberId: string
  memberName: string
  channel: 'Call' | 'SMS' | 'Email' | 'Portal'
  status: 'Planned' | 'In-Progress' | 'Completed' | 'Failed'
  topic: string
  timestamp: string
  agent: string
  note: string
  team?: string // Optional team field for drill-down views
  purpose: 'HRA Completion' | 'HRA Reminder' | 'AWV' | 'HEDIS - A1c' | 'HEDIS - Mammogram' | 'Medication Adherence' | 'RAF/Chart Retrieval' | 'Care Transition Follow-up' | 'SDOH—Economic Instability' | 'SDOH—Food Insecurity' | 'SDOH—Housing and Neighborhood' | 'SDOH—Healthcare Access' | 'SDOH—Education' | 'SDOH—Social and Community'
}

export interface AuditEntry {
  id: string
  actor: string
  action: string
  objectType: string
  objectId: string
  memberId: string
  timestamp: string
  ip: string
  details: string
}

// Deterministic seed for consistent data generation
const SEED = 12345

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let current = seed
  return () => {
    current = (current * 9301 + 49297) % 233280
    return current / 233280
  }
}

const random = seededRandom(SEED)

// Helper functions
function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + random() * (end.getTime() - start.getTime()))
  return date.toISOString()
}

// Mock data arrays
const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
  'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald',
  'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
]

// Use the PLANS constant from constants.ts instead of PLAN_NAMES

const VENDORS = [
  'BlueCross BlueShield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana',
  'Kaiser Permanente', 'Anthem', 'Molina Healthcare'
]

const COUNTIES = [
  'Los Angeles', 'Orange', 'San Diego', 'Riverside', 'San Bernardino',
  'Santa Clara', 'Alameda', 'Sacramento', 'Contra Costa', 'Fresno'
]

const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'COPD',
  'Arthritis', 'Depression', 'Anxiety', 'High Cholesterol', 'Obesity',
  'Sleep Apnea', 'Chronic Pain', 'Migraine', 'Allergies', 'Thyroid Disorder',
  'Breast Cancer Risk', 'Cervical Cancer Risk', 'Colorectal Cancer Risk' // Added for measure mapping
]

const AGENTS = [
  'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Kim', 'Emma Wilson',
  'James Brown', 'Maria Garcia', 'Robert Taylor', 'Jennifer Lee', 'Christopher Davis'
]

const TOPICS = [
  // Preventive Care & Wellness
  'Annual Checkup Reminder', 'Preventive Care', 'Wellness Program', 'Health Assessment',
  'Flu Shot Reminder', 'Mammogram Screening', 'Colonoscopy Screening', 'Dental Checkup',
  'Vision Exam', 'Hearing Test', 'Bone Density Scan', 'Skin Cancer Screening',
  
  // Disease Management & Chronic Care
  'Medication Adherence', 'Disease Management', 'Chronic Care Management', 'Diabetes Management',
  'Hypertension Monitoring', 'Heart Disease Care', 'COPD Management', 'Asthma Control',
  'Mental Health Check-in', 'Depression Screening', 'Anxiety Management', 'Pain Management',
  
  // Care Coordination & Referrals
  'Care Coordination', 'Specialist Referral', 'Primary Care Follow-up', 'Emergency Room Follow-up',
  'Discharge Planning', 'Care Transition Follow-up', 'Hospital Discharge', 'Rehabilitation Planning',
  'Home Health Services', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy',
  
  // Medication & Pharmacy
  'Prescription Refill', 'Medication Review', 'Drug Interaction Check', 'Side Effect Monitoring',
  'Pharmacy Consultation', 'Medication Adherence Program', 'Prior Authorization', 'Formulary Change',
  
  // Appointments & Scheduling
  'Appointment Scheduling', 'Appointment Reminder', 'Appointment Confirmation', 'Reschedule Request',
  'Provider Availability', 'Telehealth Setup', 'In-Person Visit', 'Virtual Consultation',
  
  // Claims & Coverage
  'Claims Inquiry', 'Coverage Questions', 'Benefits Explanation', 'Prior Authorization',
  'Provider Network', 'Out-of-Network Care', 'Copay Assistance', 'Deductible Information',
  'Coverage Verification', 'Claims Status', 'Appeal Process', 'Grievance Handling',
  
  // Social Determinants & Support
  'Transportation Assistance', 'Social Services', 'Financial Assistance', 'Language Services',
  'Nutrition Counseling', 'Food Assistance', 'Housing Support', 'Utility Assistance',
  'Employment Resources', 'Education Support', 'Community Resources', 'Crisis Intervention',
  
  // Lab & Test Results
  'Lab Results Follow-up', 'Test Results Discussion', 'Abnormal Results', 'Follow-up Testing',
  'Imaging Results', 'Biopsy Results', 'Blood Work Review', 'Vital Signs Monitoring',
  
  // Behavioral Health
  'Behavioral Health Support', 'Mental Health Resources', 'Counseling Services', 'Crisis Support',
  'Substance Use Support', 'Grief Counseling', 'Family Therapy', 'Group Therapy',
  
  // Member Services
  'Member Services', 'Account Update', 'Contact Information', 'Emergency Contacts',
  'ID Card', 'ID Verification', 'Address Change', 'Phone Number Update',
  'Email Update', 'Preferred Language', 'Accessibility Needs', 'Communication Preferences'
]

const TEAMS = [
  'Risk Adjustment', 'Quality', 'Member Services', 'Case Management', 'Pharmacy', 'Community Partnerships'
]

const PURPOSES = [
  'HRA Completion', 'HRA Reminder', 'AWV', 'HEDIS - A1c', 'HEDIS - Mammogram', 
  'Medication Adherence', 'RAF/Chart Retrieval', 'Care Transition Follow-up', 
  'SDOH—Economic Instability', 'SDOH—Food Insecurity', 'SDOH—Housing and Neighborhood', 
  'SDOH—Healthcare Access', 'SDOH—Education', 'SDOH—Social and Community'
]

// Detailed note templates for different purposes
const PURPOSE_NOTES = {
  'HRA Completion': [
    'HRA outreach: Following up on incomplete assessment. Member was responsive and engaged during initial call.',
    'HRA outreach: Following up on incomplete assessment. Left voicemail, no response yet. Will try alternative contact method.',
    'HRA outreach: Following up on incomplete assessment. Member requested callback at more convenient time.',
    'HRA outreach: Following up on incomplete assessment. Member completed assessment over the phone with assistance.',
    'HRA outreach: Following up on incomplete assessment. Member requested paper copy of assessment to complete at home.',
    'HRA outreach: Following up on incomplete assessment. Member needs help understanding some questions, scheduled follow-up call.',
    'HRA outreach: Following up on incomplete assessment. Assessment partially completed, follow-up needed for remaining sections.',
    'HRA outreach: Following up on incomplete assessment. Member expressed concerns about privacy, provided reassurance.',
    'HRA outreach: Following up on incomplete assessment. Member wants to speak with nurse first before completing.',
    'HRA outreach: Following up on incomplete assessment. Assessment completed with family member assistance.',
    'HRA outreach: Following up on incomplete assessment. Member scheduled in-person completion at local office.',
    'HRA outreach: Following up on incomplete assessment. Technical difficulties with online platform, provided alternative.',
    'HRA outreach: Following up on incomplete assessment. Member requested Spanish language version of assessment.',
    'HRA outreach: Following up on incomplete assessment. Member declined to participate, documented reason.',
    'HRA outreach: Following up on incomplete assessment. Member needs assistance with online portal access.'
  ],
  'HRA Reminder': [
    'HRA outreach: Reminding member to complete assessment. Member was responsive and committed to completing soon.',
    'HRA outreach: Reminding member to complete assessment. Left voicemail with clear instructions and deadline.',
    'HRA outreach: Reminding member to complete assessment. Member requested reminder call next week.',
    'HRA outreach: Reminding member to complete assessment. Member completed assessment during this call.',
    'HRA outreach: Reminding member to complete assessment. Member needs assistance with online access.',
    'HRA outreach: Reminding member to complete assessment. Member prefers to complete over the phone.',
    'HRA outreach: Reminding member to complete assessment. Member requested paper copy mailed to home.',
    'HRA outreach: Reminding member to complete assessment. Member has questions about assessment purpose.',
    'HRA outreach: Reminding member to complete assessment. Member scheduled completion for next week.',
    'HRA outreach: Reminding member to complete assessment. Member needs interpreter services.',
    'HRA outreach: Reminding member to complete assessment. Member expressed time constraints, provided flexible options.',
    'HRA outreach: Reminding member to complete assessment. Member wants to review with family member first.',
    'HRA outreach: Reminding member to complete assessment. Member concerned about assessment length, provided reassurance.',
    'HRA outreach: Reminding member to complete assessment. Member needs help with technical setup.',
    'HRA outreach: Reminding member to complete assessment. Member completed partial assessment, follow-up scheduled.'
  ],
  'AWV': [
    'AWV outreach: Scheduling Annual Wellness Visit. Member was responsive and scheduled appointment for next week.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member requested specific provider, checked availability.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member prefers telehealth option, scheduled virtual visit.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member needs transportation assistance, coordinated with community resources.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member has scheduling conflicts, found alternative times.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member completed visit, discussed care plan and goals.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member declined visit, documented reason and offered alternatives.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member needs interpreter services for appointment.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member wants to review benefits coverage first.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member scheduled visit with preferred provider.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member needs help understanding AWV benefits.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member requested reminder call before appointment.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member completed visit, updated care plan based on findings.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member needs assistance with appointment confirmation.',
    'AWV outreach: Scheduling Annual Wellness Visit. Member scheduled follow-up for care plan discussion.'
  ],
  'HEDIS - A1c': [
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member scheduled lab appointment for next week.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member completed recent A1c test, results discussed.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member needs help finding lab location.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member requested home testing kit information.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member scheduled with preferred lab.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member needs transportation to lab.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member completed test, discussed results and care plan.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member declined testing, documented reason.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member needs help understanding test importance.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member scheduled test with endocrinologist.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member requested reminder before test date.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member needs assistance with lab orders.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member completed test, updated diabetes management plan.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member needs help with fasting instructions.',
    'HEDIS A1c outreach: Reminding member about diabetes monitoring. Member scheduled follow-up to discuss results.'
  ],
  'HEDIS - Mammogram': [
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member scheduled mammogram for next month.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member completed recent mammogram, results normal.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member needs help finding imaging center.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member requested 3D mammogram information.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member scheduled with preferred facility.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member needs transportation assistance.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member completed screening, discussed results.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member declined screening, documented reason.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member needs help understanding screening benefits.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member scheduled with women\'s health center.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member requested reminder before appointment.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member needs assistance with coverage verification.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member completed screening, updated care plan.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member needs help with appointment preparation.',
    'HEDIS Mammogram outreach: Reminding member about breast cancer screening. Member scheduled follow-up for results discussion.'
  ],
  'Medication Adherence': [
    'Medication adherence outreach: Discussing medication compliance. Member reported good adherence, reviewed refill schedule.',
    'Medication adherence outreach: Discussing medication compliance. Member experiencing side effects, discussed with provider.',
    'Medication adherence outreach: Discussing medication compliance. Member needs help with medication organization.',
    'Medication adherence outreach: Discussing medication compliance. Member requested pill reminder system information.',
    'Medication adherence outreach: Discussing medication compliance. Member scheduled medication review with pharmacist.',
    'Medication adherence outreach: Discussing medication compliance. Member needs assistance with prescription costs.',
    'Medication adherence outreach: Discussing medication compliance. Member completed medication reconciliation.',
    'Medication adherence outreach: Discussing medication compliance. Member declined medication review, documented reason.',
    'Medication adherence outreach: Discussing medication compliance. Member needs help understanding medication instructions.',
    'Medication adherence outreach: Discussing medication compliance. Member scheduled with medication management program.',
    'Medication adherence outreach: Discussing medication compliance. Member requested reminder system setup.',
    'Medication adherence outreach: Discussing medication compliance. Member needs assistance with pharmacy services.',
    'Medication adherence outreach: Discussing medication compliance. Member completed adherence assessment, updated plan.',
    'Medication adherence outreach: Discussing medication compliance. Member needs help with medication delivery options.',
    'Medication adherence outreach: Discussing medication compliance. Member scheduled follow-up for adherence monitoring.'
  ],
  'RAF/Chart Retrieval': [
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member provided consent, records requested.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member needs help understanding process.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member scheduled with provider for records.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member requested assistance with forms.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member completed authorization, records obtained.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member needs help finding provider contact.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member scheduled records review appointment.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member declined records release, documented.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member needs help understanding RAF process.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member scheduled with care coordinator.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member requested reminder for follow-up.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member needs assistance with provider communication.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member completed records review, updated RAF.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member needs help with multiple provider records.',
    'RAF/Chart retrieval outreach: Requesting medical records for risk adjustment. Member scheduled follow-up for records completion.'
  ],
  'Care Transition Follow-up': [
    'Care transition follow-up: Post-discharge care coordination. Member completed follow-up appointment, care plan updated.',
    'Care transition follow-up: Post-discharge care coordination. Member needs help scheduling follow-up appointments.',
    'Care transition follow-up: Post-discharge care coordination. Member scheduled medication review with pharmacist.',
    'Care transition follow-up: Post-discharge care coordination. Member requested home health services information.',
    'Care transition follow-up: Post-discharge care coordination. Member completed transition assessment, needs identified.',
    'Care transition follow-up: Post-discharge care coordination. Member needs assistance with discharge instructions.',
    'Care transition follow-up: Post-discharge care coordination. Member scheduled with primary care provider.',
    'Care transition follow-up: Post-discharge care coordination. Member declined follow-up services, documented reason.',
    'Care transition follow-up: Post-discharge care coordination. Member needs help understanding care plan changes.',
    'Care transition follow-up: Post-discharge care coordination. Member scheduled with care coordinator.',
    'Care transition follow-up: Post-discharge care coordination. Member requested reminder for medication changes.',
    'Care transition follow-up: Post-discharge care coordination. Member needs assistance with specialist referrals.',
    'Care transition follow-up: Post-discharge care coordination. Member completed transition, care plan implemented.',
    'Care transition follow-up: Post-discharge care coordination. Member needs help with equipment and supplies.',
    'Care transition follow-up: Post-discharge care coordination. Member scheduled follow-up for care plan review.'
  ],
  'SDOH—Economic Instability': [
    'SDOH outreach: Economic instability support. Member needs assistance with utility bills, connected with energy assistance program.',
    'SDOH outreach: Economic instability support. Member experiencing job loss, provided employment resources and job training information.',
    'SDOH outreach: Economic instability support. Member needs help with rent assistance, connected with housing voucher program.',
    'SDOH outreach: Economic instability support. Member struggling with medical bills, provided financial assistance program information.',
    'SDOH outreach: Economic instability support. Member needs help with food costs, connected with SNAP benefits and food banks.',
    'SDOH outreach: Economic instability support. Member experiencing transportation costs, provided transportation assistance options.',
    'SDOH outreach: Economic instability support. Member needs help with prescription costs, connected with medication assistance programs.',
    'SDOH outreach: Economic instability support. Member declined economic support, documented reason and offered future assistance.',
    'SDOH outreach: Economic instability support. Member needs help understanding available resources, provided comprehensive information.',
    'SDOH outreach: Economic instability support. Member scheduled with financial counselor for comprehensive assessment.',
    'SDOH outreach: Economic instability support. Member requested assistance with premium costs.',
    'SDOH outreach: Economic instability support. Member needs help with debt management, connected with credit counseling services.',
    'SDOH outreach: Economic instability support. Member completed economic assessment, support plan implemented.',
    'SDOH outreach: Economic instability support. Member needs help with emergency financial assistance.',
    'SDOH outreach: Economic instability support. Member scheduled follow-up for ongoing economic support coordination.'
  ],
  'SDOH—Food Insecurity': [
    'SDOH outreach: Food insecurity support. Member needs immediate food assistance, connected with local food bank and emergency resources.',
    'SDOH outreach: Food insecurity support. Member needs help with SNAP application, provided assistance with enrollment process.',
    'SDOH outreach: Food insecurity support. Member needs meal delivery services, connected with Meals on Wheels program.',
    'SDOH outreach: Food insecurity support. Member needs help with nutrition education, provided healthy eating resources.',
    'SDOH outreach: Food insecurity support. Member needs assistance with grocery shopping, connected with shopping assistance programs.',
    'SDOH outreach: Food insecurity support. Member needs help with cooking resources, provided cooking classes and equipment information.',
    'SDOH outreach: Food insecurity support. Member needs assistance with dietary restrictions, connected with specialized food programs.',
    'SDOH outreach: Food insecurity support. Member declined food assistance, documented reason and offered future support.',
    'SDOH outreach: Food insecurity support. Member needs help understanding food assistance programs, provided comprehensive information.',
    'SDOH outreach: Food insecurity support. Member scheduled with nutritionist for dietary assessment and planning.',
    'SDOH outreach: Food insecurity support. Member requested assistance with food storage and preparation.',
    'SDOH outreach: Food insecurity support. Member needs help with community garden access, connected with local programs.',
    'SDOH outreach: Food insecurity support. Member completed food security assessment, support plan implemented.',
    'SDOH outreach: Food insecurity support. Member needs help with food transportation, provided delivery options.',
    'SDOH outreach: Food insecurity support. Member scheduled follow-up for ongoing food security support.'
  ],
  'SDOH—Housing and Neighborhood': [
    'SDOH outreach: Housing and neighborhood support. Member needs help with unsafe housing conditions, connected with housing inspection services.',
    'SDOH outreach: Housing and neighborhood support. Member needs assistance with rent increase, connected with tenant rights resources.',
    'SDOH outreach: Housing and neighborhood support. Member needs help with neighborhood safety, connected with community safety programs.',
    'SDOH outreach: Housing and neighborhood support. Member needs assistance with home repairs, connected with home improvement programs.',
    'SDOH outreach: Housing and neighborhood support. Member needs help with accessibility modifications, connected with ADA resources.',
    'SDOH outreach: Housing and neighborhood support. Member needs assistance with utility access, connected with utility assistance programs.',
    'SDOH outreach: Housing and neighborhood support. Member needs help with neighborhood resources, provided community center information.',
    'SDOH outreach: Housing and neighborhood support. Member declined housing assistance, documented reason and offered future support.',
    'SDOH outreach: Housing and neighborhood support. Member needs help understanding housing rights, provided comprehensive information.',
    'SDOH outreach: Housing and neighborhood support. Member scheduled with housing counselor for comprehensive assessment.',
    'SDOH outreach: Housing and neighborhood support. Member requested assistance with emergency housing.',
    'SDOH outreach: Housing and neighborhood support. Member needs help with neighborhood transportation, connected with local services.',
    'SDOH outreach: Housing and neighborhood support. Member completed housing assessment, support plan implemented.',
    'SDOH outreach: Housing and neighborhood support. Member needs help with environmental health concerns.',
    'SDOH outreach: Housing and neighborhood support. Member scheduled follow-up for ongoing housing support coordination.'
  ],
  'SDOH—Healthcare Access': [
    'SDOH outreach: Healthcare access support. Member needs help finding primary care provider, connected with provider network services.',
    'SDOH outreach: Healthcare access support. Member needs assistance with transportation to appointments, connected with medical transport.',
    'SDOH outreach: Healthcare access support. Member needs help with telehealth setup, provided technology assistance and training.',
    'SDOH outreach: Healthcare access support. Member needs assistance with appointment scheduling, provided scheduling support services.',
    'SDOH outreach: Healthcare access support. Member needs help with benefits navigation, connected with benefits counseling.',
    'SDOH outreach: Healthcare access support. Member needs assistance with language barriers, connected with interpreter services.',
    'SDOH outreach: Healthcare access support. Member needs help with after-hours care, provided urgent care and emergency resources.',
    'SDOH outreach: Healthcare access support. Member declined healthcare access assistance, documented reason and offered future support.',
    'SDOH outreach: Healthcare access support. Member needs help understanding healthcare benefits, provided comprehensive information.',
    'SDOH outreach: Healthcare access support. Member scheduled with care coordinator for comprehensive access assessment.',
    'SDOH outreach: Healthcare access support. Member requested assistance with specialist referrals.',
    'SDOH outreach: Healthcare access support. Member needs help with prescription access, connected with pharmacy services.',
    'SDOH outreach: Healthcare access support. Member completed access assessment, support plan implemented.',
    'SDOH outreach: Healthcare access support. Member needs help with medical equipment access.',
    'SDOH outreach: Healthcare access support. Member scheduled follow-up for ongoing healthcare access coordination.'
  ],
  'SDOH—Education': [
    'SDOH outreach: Education support. Member needs help with health literacy, connected with health education programs.',
    'SDOH outreach: Education support. Member needs assistance with digital literacy, connected with computer training programs.',
    'SDOH outreach: Education support. Member needs help with medication education, provided medication management training.',
    'SDOH outreach: Education support. Member needs assistance with disease education, connected with condition-specific programs.',
    'SDOH outreach: Education support. Member needs help with nutrition education, connected with cooking and nutrition classes.',
    'SDOH outreach: Education support. Member needs assistance with exercise education, connected with fitness programs.',
    'SDOH outreach: Education support. Member needs help with mental health education, connected with wellness programs.',
    'SDOH outreach: Education support. Member declined education assistance, documented reason and offered future support.',
    'SDOH outreach: Education support. Member needs help understanding available education resources, provided comprehensive information.',
    'SDOH outreach: Education support. Member scheduled with health educator for comprehensive assessment.',
    'SDOH outreach: Education support. Member requested assistance with language learning.',
    'SDOH outreach: Education support. Member needs help with financial literacy, connected with financial education programs.',
    'SDOH outreach: Education support. Member completed education assessment, support plan implemented.',
    'SDOH outreach: Education support. Member needs help with technology training.',
    'SDOH outreach: Education support. Member scheduled follow-up for ongoing education support coordination.'
  ],
  'SDOH—Social and Community': [
    'SDOH outreach: Social and community support. Member needs help with social isolation, connected with community support groups.',
    'SDOH outreach: Social and community support. Member needs assistance with caregiver support, connected with respite care services.',
    'SDOH outreach: Social and community support. Member needs help with mental health support, connected with counseling services.',
    'SDOH outreach: Social and community support. Member needs assistance with substance use support, connected with recovery programs.',
    'SDOH outreach: Social and community support. Member needs help with grief counseling, connected with bereavement services.',
    'SDOH outreach: Social and community support. Member needs assistance with family support, connected with family therapy services.',
    'SDOH outreach: Social and community support. Member needs help with community engagement, connected with volunteer opportunities.',
    'SDOH outreach: Social and community support. Member declined social support, documented reason and offered future assistance.',
    'SDOH outreach: Social and community support. Member needs help understanding available social resources, provided comprehensive information.',
    'SDOH outreach: Social and community support. Member scheduled with social worker for comprehensive assessment.',
    'SDOH outreach: Social and community support. Member requested assistance with crisis intervention.',
    'SDOH outreach: Social and community support. Member needs help with peer support, connected with peer mentoring programs.',
    'SDOH outreach: Social and community support. Member completed social assessment, support plan implemented.',
    'SDOH outreach: Social and community support. Member needs help with cultural support, connected with cultural programs.',
    'SDOH outreach: Social and community support. Member scheduled follow-up for ongoing social support coordination.'
  ]
}

// Generate mock members
export function generateMockMembers(count: number = 137): Member[] {
  const members: Member[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = randomChoice(FIRST_NAMES)
    const lastName = randomChoice(LAST_NAMES)
    const name = `${firstName} ${lastName}`
    
    // Generate DOB (ages 18-85)
    const age = randomInt(18, 85)
    const dob = new Date()
    dob.setFullYear(dob.getFullYear() - age)
    dob.setMonth(randomInt(0, 11))
    dob.setDate(randomInt(1, 28))
    
    // Generate conditions (0-4 conditions per member)
    const conditionCount = randomInt(0, 4)
    const conditions: string[] = []
    for (let j = 0; j < conditionCount; j++) {
      const condition = randomChoice(CONDITIONS)
      if (!conditions.includes(condition)) {
        conditions.push(condition)
      }
    }
    
    // Generate abrasion risk score based on age and conditions
    let risk = Math.min(20 + age * 0.5 + conditions.length * 15, 100)
    risk = Math.max(risk + randomInt(-10, 10), 0)
    
    // Generate realistic Medicare Advantage plan info
    const contractId = `H${String(randomInt(1000, 9999))}`
    const pbp = String(randomInt(1, 199)).padStart(3, '0')
    const plan = randomChoice(PLANS)
    const lob = randomChoice(LOB) // Skewed to Medicare Advantage for demo
    const county = randomChoice(COUNTIES)
    
    // Generate member type (90% Member, 10% Prospect)
    const memberType = random() < 0.9 ? 'Member' : 'Prospect'
    
    // Generate effective date (within last 2 years)
    const effectiveDate = new Date()
    effectiveDate.setFullYear(effectiveDate.getFullYear() - randomInt(0, 2))
    effectiveDate.setMonth(randomInt(0, 11))
    effectiveDate.setDate(randomInt(1, 28))
    
    const member: Member = {
      id: `M${String(i + 1).padStart(4, '0')}`,
      memberId: String(100000 + i), // displayable plan ID
      name,
      dob: dob.toISOString().split('T')[0],
      plan,
      vendor: randomChoice(VENDORS),
      phone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `${randomInt(100, 9999)} ${randomChoice(['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Maple Dr'])}`,
      conditions,
      risk: Math.round(risk),
      memberType,
      planInfo: {
        contractId,
        pbp,
        lob,
        planName: plan, // Use the plan as planName for backward compatibility
        county,
        effectiveDate: effectiveDate.toISOString()
      }
    }
    
    // Derive measures from conditions
    member.measures = deriveMeasures(member.conditions)
    
    members.push(member)
  }
  
  return members
}

// Derive measures from conditions
function deriveMeasures(conditions: string[]): Measure[] {
  const map = new Map<string, Measure>()
  for (const c of conditions) {
    const entries = CONDITION_TO_MEASURES[c] || []
    for (const { code, program } of entries) {
      const key = `${code}|${program}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, { code, program, relatedConditions: [c], gap: 'open' })
      } else {
        existing.relatedConditions.push(c)
      }
    }
  }
  return Array.from(map.values())
}

// Re-export dataAsOf for convenience
export const dataAsOf = DATA_AS_OF

// Generate SDOH profiles for members (called after outreach generation)
export function addSdohProfiles(members: Member[], outreach: Outreach[]): Member[] {
  const { generateSdohProfile } = require('./sdoh')
  
  return members.map(member => ({
    ...member,
    sdoh: generateSdohProfile(member, outreach)
  }))
}

// Helper function to get condition-specific topics
function getConditionSpecificTopics(conditions: string[]): string[] {
  const conditionTopics: Record<string, string[]> = {
    'Diabetes': ['Diabetes Management', 'A1c Testing', 'Blood Sugar Monitoring', 'Diabetic Eye Exam', 'Foot Care', 'Nutrition Counseling'],
    'Hypertension': ['Blood Pressure Monitoring', 'Heart Health', 'Medication Adherence', 'Stress Management', 'Exercise Program'],
    'Heart Disease': ['Cardiac Care', 'Heart Health', 'Exercise Program', 'Medication Adherence', 'Cardiac Rehabilitation'],
    'COPD': ['Respiratory Care', 'Breathing Exercises', 'Oxygen Therapy', 'Pulmonary Rehabilitation', 'Smoking Cessation'],
    'Asthma': ['Asthma Control', 'Inhaler Technique', 'Trigger Management', 'Emergency Action Plan', 'Allergy Management'],
    'Depression': ['Mental Health Check-in', 'Depression Screening', 'Counseling Services', 'Medication Review', 'Crisis Support'],
    'Anxiety': ['Anxiety Management', 'Stress Reduction', 'Mental Health Resources', 'Relaxation Techniques', 'Counseling Services'],
    'High Cholesterol': ['Cholesterol Management', 'Heart Health', 'Diet Counseling', 'Exercise Program', 'Medication Adherence'],
    'Obesity': ['Weight Management', 'Nutrition Counseling', 'Exercise Program', 'Bariatric Surgery', 'Lifestyle Changes'],
    'Arthritis': ['Pain Management', 'Joint Care', 'Physical Therapy', 'Exercise Program', 'Medication Review']
  }
  
  const topics: string[] = []
  conditions.forEach(condition => {
    if (conditionTopics[condition]) {
      topics.push(...conditionTopics[condition])
    }
  })
  return topics
}

// Helper function to get purpose-specific topic
function getPurposeSpecificTopic(purpose: string): string {
  const purposeTopics: Record<string, string> = {
    'HRA Completion': 'Health Risk Assessment - Follow-up',
    'HRA Reminder': 'Health Risk Assessment - Reminder',
    'AWV': 'Annual Wellness Visit',
    'HEDIS - A1c': 'Diabetes Monitoring - A1c Test',
    'HEDIS - Mammogram': 'Breast Cancer Screening',
    'Medication Adherence': 'Medication Compliance Review',
    'RAF/Chart Retrieval': 'Medical Records Request',
    'Care Transition Follow-up': 'Post-Discharge Care Coordination',
    'SDOH—Economic Instability': 'Financial Assistance Support',
    'SDOH—Food Insecurity': 'Food Assistance Support',
    'SDOH—Housing and Neighborhood': 'Housing Support Services',
    'SDOH—Healthcare Access': 'Healthcare Access Support',
    'SDOH—Education': 'Health Education Support',
    'SDOH—Social and Community': 'Social Support Services'
  }
  
  return purposeTopics[purpose] || randomChoice(TOPICS)
}

// Helper function to get team based on purpose
function getTeamForPurpose(purpose: string): string {
  const teamMapping: Record<string, string[]> = {
    'HRA Completion': ['Care Coordination', 'Eligibility & Benefits'],
    'HRA Reminder': ['Care Coordination', 'Eligibility & Benefits'],
    'AWV': ['Care Coordination', 'Eligibility & Benefits'],
    'HEDIS - A1c': ['Care Coordination', 'Eligibility & Benefits'],
    'HEDIS - Mammogram': ['Care Coordination', 'Eligibility & Benefits'],
    'Medication Adherence': ['Care Coordination', 'Eligibility & Benefits'],
    'RAF/Chart Retrieval': ['Care Coordination', 'Eligibility & Benefits'],
    'Care Transition Follow-up': ['Care Coordination', 'Eligibility & Benefits'],
    'SDOH—Economic Instability': ['Care Coordination', 'Eligibility & Benefits'],
    'SDOH—Food Insecurity': ['Care Coordination', 'Eligibility & Benefits'],
    'SDOH—Housing and Neighborhood': ['Care Coordination', 'Eligibility & Benefits'],
    'SDOH—Healthcare Access': ['Care Coordination', 'Eligibility & Benefits'],
    'SDOH—Education': ['Care Coordination', 'Eligibility & Benefits'],
    'SDOH—Social and Community': ['Care Coordination', 'Eligibility & Benefits']
  }
  
  const teams = teamMapping[purpose] || ['Care Coordination', 'Eligibility & Benefits']
  return randomChoice(teams)
}

// Generate mock outreach entries - ensure every member has outreach
export function generateMockOutreach(members: Member[], count: number = 600): Outreach[] {
  const outreach: Outreach[] = []
  let outreachId = 1
  
  // Ensure every member has exactly 3 outreach entries with variety
  members.forEach(member => {
    // Each member gets exactly 3 outreach records
    const memberOutreachCount = 3
    
    for (let j = 0; j < memberOutreachCount; j++) {
      const timestamp = randomDate(
        new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago for more history
        new Date()
      )
      
      // More sophisticated purpose selection based on member characteristics
      let purpose: string
      const rand = random()
      
      if (rand < 0.4) {
        // HRA purposes (40% weight)
        purpose = randomChoice(['HRA Completion', 'HRA Reminder'])
      } else if (rand < 0.6) {
        // Condition-specific purposes
        if (member.conditions.includes('Diabetes')) {
          purpose = randomChoice(['HEDIS - A1c', 'Medication Adherence', 'AWV'])
        } else if (member.conditions.includes('Depression') || member.conditions.includes('Anxiety')) {
          purpose = randomChoice(['SDOH—Social and Community', 'Medication Adherence', 'AWV'])
        } else if (member.conditions.includes('Heart Disease') || member.conditions.includes('Hypertension')) {
          purpose = randomChoice(['Medication Adherence', 'Care Transition Follow-up', 'AWV'])
        } else {
          purpose = randomChoice(['AWV', 'Medication Adherence', 'RAF/Chart Retrieval'])
        }
      } else if (rand < 0.8) {
        // SDOH purposes (20% weight)
        purpose = randomChoice([
          'SDOH—Economic Instability', 'SDOH—Food Insecurity', 'SDOH—Housing and Neighborhood',
          'SDOH—Healthcare Access', 'SDOH—Education', 'SDOH—Social and Community'
        ])
      } else {
        // Other purposes (20% weight)
        purpose = randomChoice(['RAF/Chart Retrieval', 'Care Transition Follow-up', 'HEDIS - Mammogram'])
      }
      
      const team = getTeamForPurpose(purpose)
      
      // More realistic status distribution based on purpose
      let statusWeights: number[]
      if (purpose.startsWith('HRA')) {
        statusWeights = [0.3, 0.4, 0.2, 0.1] // More in-progress for HRA
      } else if (purpose.startsWith('SDOH')) {
        statusWeights = [0.5, 0.2, 0.2, 0.1] // More completed for SDOH
      } else {
        statusWeights = [0.4, 0.3, 0.2, 0.1] // Standard distribution
      }
      
      const statusRand = random()
      let status: 'Planned' | 'In-Progress' | 'Completed' | 'Failed'
      if (statusRand < statusWeights[0]) status = 'Completed'
      else if (statusRand < statusWeights[0] + statusWeights[1]) status = 'In-Progress'
      else if (statusRand < statusWeights[0] + statusWeights[1] + statusWeights[2]) status = 'Planned'
      else status = 'Failed'
      
      // Channel selection based on purpose and member characteristics
      let channelWeights: number[]
      if (purpose.startsWith('SDOH')) {
        channelWeights = [0.5, 0.2, 0.2, 0.1] // More calls for SDOH
      } else if (purpose.startsWith('HRA')) {
        channelWeights = [0.3, 0.3, 0.3, 0.1] // Balanced for HRA
      } else {
        channelWeights = [0.35, 0.25, 0.25, 0.15] // Standard distribution
      }
      
      const channelRand = random()
      let channel: 'Call' | 'SMS' | 'Email' | 'Portal'
      if (channelRand < channelWeights[0]) channel = 'Call'
      else if (channelRand < channelWeights[0] + channelWeights[1]) channel = 'SMS'
      else if (channelRand < channelWeights[0] + channelWeights[1] + channelWeights[2]) channel = 'Email'
      else channel = 'Portal'
      
      // Get purpose-specific topic or condition-specific topic
      let topic: string
      if (purpose.startsWith('HRA') || purpose.startsWith('HEDIS') || purpose.startsWith('SDOH') || 
          purpose === 'AWV' || purpose === 'Medication Adherence' || purpose === 'RAF/Chart Retrieval' || 
          purpose === 'Care Transition Follow-up') {
        topic = getPurposeSpecificTopic(purpose)
      } else {
        const conditionTopics = getConditionSpecificTopics(member.conditions)
        topic = conditionTopics.length > 0 ? randomChoice(conditionTopics) : randomChoice(TOPICS)
      }
      
      // Get detailed note based on purpose
      const note = PURPOSE_NOTES[purpose as keyof typeof PURPOSE_NOTES] 
        ? randomChoice(PURPOSE_NOTES[purpose as keyof typeof PURPOSE_NOTES])
        : `Outreach regarding ${topic.toLowerCase()}. ${randomChoice([
            'Member was responsive and engaged.',
            'Left voicemail, no response yet.',
            'Member requested callback.',
            'Completed successfully.',
            'Member declined to participate.',
            'Technical issues encountered.',
            'Member needs assistance with online portal.',
            'Language barrier - interpreter needed.',
            'Member prefers text communication.',
            'Follow-up scheduled for next week.'
          ])}`
      
      outreach.push({
        id: `O${String(outreachId).padStart(4, '0')}`,
        memberId: member.id,
        memberName: member.name,
        channel,
        status,
        topic,
        timestamp,
        agent: randomChoice(AGENTS),
        note,
        team: team, // Assign team for drill-down views
        purpose: purpose as 'HRA Completion' | 'HRA Reminder' | 'AWV' | 'HEDIS - A1c' | 'HEDIS - Mammogram' | 'Medication Adherence' | 'RAF/Chart Retrieval' | 'Care Transition Follow-up' | 'SDOH—Economic Instability' | 'SDOH—Food Insecurity' | 'SDOH—Housing and Neighborhood' | 'SDOH—Healthcare Access' | 'SDOH—Education' | 'SDOH—Social and Community'
      })
      outreachId++
    }
  })
  
  // Add additional outreach entries for variety (some members will have more)
  const additionalOutreach = count - outreach.length
  for (let i = 0; i < additionalOutreach; i++) {
    const member = randomChoice(members)
    const timestamp = randomDate(
      new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago for more history
      new Date()
    )
    
    // Use the same sophisticated purpose selection logic
    let purpose: string
    const rand = random()
    
    if (rand < 0.3) {
      // HRA purposes (30% weight for additional outreach)
      purpose = randomChoice(['HRA Completion', 'HRA Reminder'])
    } else if (rand < 0.5) {
      // Condition-specific purposes
      if (member.conditions.includes('Diabetes')) {
        purpose = randomChoice(['HEDIS - A1c', 'Medication Adherence', 'AWV'])
      } else if (member.conditions.includes('Depression') || member.conditions.includes('Anxiety')) {
        purpose = randomChoice(['SDOH—Social and Community', 'Medication Adherence', 'AWV'])
      } else if (member.conditions.includes('Heart Disease') || member.conditions.includes('Hypertension')) {
        purpose = randomChoice(['Medication Adherence', 'Care Transition Follow-up', 'AWV'])
      } else {
        purpose = randomChoice(['AWV', 'Medication Adherence', 'RAF/Chart Retrieval'])
      }
    } else if (rand < 0.7) {
      // SDOH purposes (20% weight)
      purpose = randomChoice([
        'SDOH—Economic Instability', 'SDOH—Food Insecurity', 'SDOH—Housing and Neighborhood',
        'SDOH—Healthcare Access', 'SDOH—Education', 'SDOH—Social and Community'
      ])
    } else {
      // Other purposes (30% weight for additional outreach)
      purpose = randomChoice(['RAF/Chart Retrieval', 'Care Transition Follow-up', 'HEDIS - Mammogram'])
    }
    
    const team = getTeamForPurpose(purpose)
    
    // More realistic status distribution based on purpose
    let statusWeights: number[]
    if (purpose.startsWith('HRA')) {
      statusWeights = [0.3, 0.4, 0.2, 0.1] // More in-progress for HRA
    } else if (purpose.startsWith('SDOH')) {
      statusWeights = [0.5, 0.2, 0.2, 0.1] // More completed for SDOH
    } else {
      statusWeights = [0.4, 0.3, 0.2, 0.1] // Standard distribution
    }
    
    const statusRand = random()
    let status: 'Planned' | 'In-Progress' | 'Completed' | 'Failed'
    if (statusRand < statusWeights[0]) status = 'Completed'
    else if (statusRand < statusWeights[0] + statusWeights[1]) status = 'In-Progress'
    else if (statusRand < statusWeights[0] + statusWeights[1] + statusWeights[2]) status = 'Planned'
    else status = 'Failed'
    
    // Channel selection based on purpose
    let channelWeights: number[]
    if (purpose.startsWith('SDOH')) {
      channelWeights = [0.5, 0.2, 0.2, 0.1] // More calls for SDOH
    } else if (purpose.startsWith('HRA')) {
      channelWeights = [0.3, 0.3, 0.3, 0.1] // Balanced for HRA
    } else {
      channelWeights = [0.35, 0.25, 0.25, 0.15] // Standard distribution
    }
    
    const channelRand = random()
    let channel: 'Call' | 'SMS' | 'Email' | 'Portal'
    if (channelRand < channelWeights[0]) channel = 'Call'
    else if (channelRand < channelWeights[0] + channelWeights[1]) channel = 'SMS'
    else if (channelRand < channelWeights[0] + channelWeights[1] + channelWeights[2]) channel = 'Email'
    else channel = 'Portal'
    
    // Get purpose-specific topic or condition-specific topic
    let topic: string
    if (purpose.startsWith('HRA') || purpose.startsWith('HEDIS') || purpose.startsWith('SDOH') || 
        purpose === 'AWV' || purpose === 'Medication Adherence' || purpose === 'RAF/Chart Retrieval' || 
        purpose === 'Care Transition Follow-up') {
      topic = getPurposeSpecificTopic(purpose)
    } else {
      const conditionTopics = getConditionSpecificTopics(member.conditions)
      topic = conditionTopics.length > 0 ? randomChoice(conditionTopics) : randomChoice(TOPICS)
    }
    
    // Get detailed note based on purpose
    const note = PURPOSE_NOTES[purpose as keyof typeof PURPOSE_NOTES] 
      ? randomChoice(PURPOSE_NOTES[purpose as keyof typeof PURPOSE_NOTES])
      : `Outreach regarding ${topic.toLowerCase()}. ${randomChoice([
          'Member was responsive and engaged.',
          'Left voicemail, no response yet.',
          'Member requested callback.',
          'Completed successfully.',
          'Member declined to participate.',
          'Technical issues encountered.',
          'Member needs assistance with online portal.',
          'Language barrier - interpreter needed.',
          'Member prefers text communication.',
          'Follow-up scheduled for next week.'
        ])}`
    
    outreach.push({
      id: `O${String(outreachId).padStart(4, '0')}`,
      memberId: member.id,
      memberName: member.name,
      channel,
      status,
      topic,
      timestamp,
      agent: randomChoice(AGENTS),
      note,
      team: team, // Assign team for drill-down views
      purpose: purpose as 'HRA Completion' | 'HRA Reminder' | 'AWV' | 'HEDIS - A1c' | 'HEDIS - Mammogram' | 'Medication Adherence' | 'RAF/Chart Retrieval' | 'Care Transition Follow-up' | 'SDOH—Economic Instability' | 'SDOH—Food Insecurity' | 'SDOH—Housing and Neighborhood' | 'SDOH—Healthcare Access' | 'SDOH—Education' | 'SDOH—Social and Community'
    })
    outreachId++
  }
  
  return outreach.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate mock audit entries
export function generateMockAudit(members: Member[], outreach: Outreach[], count: number = 200): AuditEntry[] {
  const audit: AuditEntry[] = []
  
  for (let i = 0; i < count; i++) {
    const member = randomChoice(members)
    const timestamp = randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      new Date()
    )
    
    const actions = [
      'VIEW_MEMBER', 'UPDATE_MEMBER', 'CREATE_OUTREACH', 'UPDATE_OUTREACH',
      'LOG_CALL', 'SEND_SMS', 'SEND_EMAIL', 'EXPORT_DATA', 'LOGIN', 'LOGOUT'
    ]
    
    const action = randomChoice(actions)
    const actor = randomChoice(AGENTS)
    
    audit.push({
      id: `A${String(i + 1).padStart(4, '0')}`,
      actor,
      action,
      objectType: randomChoice(['Member', 'Outreach', 'System', 'Report']),
      objectId: randomChoice([member.id, ...outreach.map(o => o.id)]),
      memberId: member.id,
      timestamp,
      ip: `${randomInt(192, 223)}.${randomInt(1, 254)}.${randomInt(1, 254)}.${randomInt(1, 254)}`,
      details: `${action.replace('_', ' ').toLowerCase()} for member ${member.name}`
    })
  }
  
  return audit.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Helper functions for filtering and searching
export function searchMembers(members: Member[], query: string): Member[] {
  if (!query.trim()) return members
  
  const lowercaseQuery = query.toLowerCase()
  return members.filter(member => 
    member.name.toLowerCase().includes(lowercaseQuery) ||
    member.id.toLowerCase().includes(lowercaseQuery) ||
    member.email.toLowerCase().includes(lowercaseQuery) ||
    member.plan.toLowerCase().includes(lowercaseQuery) ||
    member.vendor.toLowerCase().includes(lowercaseQuery) ||
    member.planInfo.contractId.toLowerCase().includes(lowercaseQuery) ||
    member.planInfo.pbp.toLowerCase().includes(lowercaseQuery) ||
    member.planInfo.planName.toLowerCase().includes(lowercaseQuery) ||
    member.planInfo.lob.toLowerCase().includes(lowercaseQuery) ||
    member.memberType.toLowerCase().includes(lowercaseQuery)
  )
}

export function filterOutreachByChannel(outreach: Outreach[], channel: string): Outreach[] {
  if (!channel || channel === 'All') return outreach
  return outreach.filter(o => o.channel === channel)
}

export function filterOutreachByStatus(outreach: Outreach[], status: string): Outreach[] {
  if (!status || status === 'All') return outreach
  return outreach.filter(o => o.status === status)
}

export function getRiskBadgeVariant(risk: number): 'destructive' | 'default' | 'secondary' {
  if (risk <= 40) return 'secondary'
  if (risk <= 70) return 'default'
  return 'destructive'
}

export function getRiskLabel(risk: number): string {
  if (risk <= 40) return 'Low Abrasion Risk'
  if (risk <= 70) return 'Medium Abrasion Risk'
  return 'High Abrasion Risk'
}

// Analytics helpers
export function getOutreachByChannel(outreach: Outreach[]) {
  const channels = ['Call', 'SMS', 'Email', 'Portal']
  return channels.map(channel => ({
    channel,
    count: outreach.filter(o => o.channel === channel).length
  }))
}

export function getResponseRateData(outreach: Outreach[]) {
  const days = 14
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayOutreach = outreach.filter(o => o.timestamp.startsWith(dateStr))
    const completed = dayOutreach.filter(o => o.status === 'Completed').length
    const total = dayOutreach.length
    
    data.push({
      date: dateStr,
      responseRate: total > 0 ? Math.round((completed / total) * 100) : 0
    })
  }
  
  return data
}

export function getFunnelData(outreach: Outreach[]) {
  const total = outreach.length
  const planned = outreach.filter(o => o.status === 'Planned').length
  const inProgress = outreach.filter(o => o.status === 'In-Progress').length
  const completed = outreach.filter(o => o.status === 'Completed').length
  const failed = outreach.filter(o => o.status === 'Failed').length
  
  return [
    { stage: 'Planned', count: planned, percentage: Math.round((planned / total) * 100) },
    { stage: 'In Progress', count: inProgress, percentage: Math.round((inProgress / total) * 100) },
    { stage: 'Completed', count: completed, percentage: Math.round((completed / total) * 100) },
    { stage: 'Failed', count: failed, percentage: Math.round((failed / total) * 100) }
  ]
}

/**
 * Get top and bottom channels from outreach records
 */
export function getTopAndBottomChannels(records: Outreach[]): { top: string; bottom: string } {
  const counts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.channel] = (acc[r.channel] || 0) + 1
    return acc
  }, {})
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return { top: 'N/A', bottom: 'N/A' }
  
  return {
    top: sorted[0][0],
    bottom: sorted[sorted.length - 1][0],
  }
}

/**
 * Get teams list with internal and vendor types
 */
export const teams = [
  { name: 'Care Coordination', type: 'internal' as const },
  { name: 'Eligibility & Benefits', type: 'internal' as const },
  { name: 'Risk Adjustment', type: 'internal' as const },
  { name: 'Quality', type: 'internal' as const },
  { name: 'Member Services', type: 'internal' as const },
  { name: 'Case Management', type: 'internal' as const },
  { name: 'Pharmacy', type: 'internal' as const },
  { name: 'Community Partnerships', type: 'internal' as const },
  ...VENDOR_TEAMS.map((v) => ({ name: v, type: 'vendor' as const })),
]

// Cohort definitions for taxonomy
export const cohorts: Cohort[] = [
  // HEDIS Gaps
  { id: 'c_hedis_bcs', name: 'BCS Gap', category: 'hedis', description: 'Breast Cancer Screening' },
  { id: 'c_hedis_ccs', name: 'CCS Gap', category: 'hedis', description: 'Cervical Cancer Screening' },
  { id: 'c_hedis_col', name: 'COL Gap', category: 'hedis', description: 'Colorectal Cancer Screening' },
  { id: 'c_hedis_cbp', name: 'CBP Gap', category: 'hedis', description: 'Controlling High Blood Pressure' },
  { id: 'c_hedis_hbd', name: 'HBD Gap', category: 'hedis', description: 'Hemoglobin A1c Control for Patients With Diabetes' },
  { id: 'c_hedis_w30', name: 'W30 Gap', category: 'hedis', description: 'Well-Child Visits (0–30mo)' },
  // Risk Gaps
  { id: 'c_risk_high', name: 'High Clinical Risk', category: 'risk', description: 'Members with high clinical risk scores' },
  { id: 'c_risk_fatigue', name: 'Fatigue Risk', category: 'risk', description: 'Members showing outreach fatigue' },
  { id: 'c_risk_unreached', name: 'Unable to Contact (UTC)', category: 'risk', description: 'Members unreachable in last 30 days' },
  // SDOH Needs
  { id: 'c_sdoh_transport', name: 'Transportation Need', category: 'sdoh', description: 'Housing and Neighborhood - Transportation assistance needed' },
  { id: 'c_sdoh_food', name: 'Food Insecurity', category: 'sdoh', description: 'Food security assistance needed' },
  { id: 'c_sdoh_economic', name: 'Economic Instability', category: 'sdoh', description: 'Financial instability support needed' },
  { id: 'c_sdoh_healthcare', name: 'Healthcare Access', category: 'sdoh', description: 'Healthcare access barriers identified' },
  { id: 'c_sdoh_education', name: 'Education Need', category: 'sdoh', description: 'Health education and literacy support needed' },
  { id: 'c_sdoh_social', name: 'Social and Community Need', category: 'sdoh', description: 'Social and community context support needed' },
]

// Attach cohorts and behavioral types to members
export function attachCohortsAndTypes(
  members: Member[],
  opts?: { recentWindowDays?: number }
): Member[] {
  const windowDays = opts?.recentWindowDays ?? 14
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - windowDays)
  
  return members.map(m => {
    const list: string[] = []
    
    // Create deterministic hash from member ID to ensure all cohorts get members
    const idHash = m.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hashMod = idHash % 100
    
    // Assign cohorts based on conditions and HEDIS measures
    if (m.conditions?.includes('Diabetes')) {
      list.push('c_hedis_hbd')
    }
    if (m.conditions?.includes('Hypertension')) {
      list.push('c_hedis_cbp')
    }
    if (m.conditions?.includes('Breast Cancer Risk')) {
      list.push('c_hedis_bcs')
    }
    if (m.conditions?.includes('Cervical Cancer Risk')) {
      list.push('c_hedis_ccs')
    }
    if (m.conditions?.includes('Colorectal Cancer Risk')) {
      list.push('c_hedis_col')
    }
    
    // Ensure all HEDIS cohorts get members using deterministic assignment
    // Use modulo to distribute members across all HEDIS cohorts
    const hedisMod = hashMod % 6
    if (hedisMod === 0 && !list.includes('c_hedis_bcs')) list.push('c_hedis_bcs')
    if (hedisMod === 1 && !list.includes('c_hedis_ccs')) list.push('c_hedis_ccs')
    if (hedisMod === 2 && !list.includes('c_hedis_col')) list.push('c_hedis_col')
    if (hedisMod === 3 && !list.includes('c_hedis_cbp')) list.push('c_hedis_cbp')
    if (hedisMod === 4 && !list.includes('c_hedis_hbd')) list.push('c_hedis_hbd')
    if (hedisMod === 5) {
      // Pediatric members (age-based check) OR assign based on hash
      const age = new Date().getFullYear() - new Date(m.dob).getFullYear()
      if (age <= 2.5 || (hashMod % 20 < 3)) {
        list.push('c_hedis_w30')
      }
    }
    
    // SDOH-based cohorts - use deterministic assignment to ensure all get members
    const sdohMod = (hashMod + 17) % 6 // Offset to get different distribution
    if (sdohMod === 0 || (m.sdoh?.needs.housingAndNeighborhood >= 60)) {
      list.push('c_sdoh_transport')
    }
    if (sdohMod === 1 || (m.sdoh?.needs.foodInsecurity >= 60)) {
      list.push('c_sdoh_food')
    }
    if (sdohMod === 2 || (m.sdoh?.needs.economicInstability >= 60)) {
      list.push('c_sdoh_economic')
    }
    if (sdohMod === 3 || (m.sdoh?.needs.healthcareAccess >= 60)) {
      list.push('c_sdoh_healthcare')
    }
    if (sdohMod === 4 || (m.sdoh?.needs.education >= 60)) {
      list.push('c_sdoh_education')
    }
    if (sdohMod === 5 || (m.sdoh?.needs.socialAndCommunity >= 60)) {
      list.push('c_sdoh_social')
    }
    
    // Risk-based cohorts - ensure all get members
    const riskMod = (hashMod + 31) % 3 // Different offset for risk cohorts
    if (riskMod === 0 || m.risk >= 80) {
      list.push('c_risk_high')
    }
    if (riskMod === 1) {
      // Assign fatigue risk - ensure it gets members
      if (m.risk >= 70 || hashMod % 10 < 4) {
        list.push('c_risk_fatigue')
      }
    }
    if (riskMod === 2) {
      // Check for unreached members (deterministic based on ID)
      const lastChar = m.id.charCodeAt(m.id.length - 1) % 10
      if (lastChar >= 7 || hashMod % 20 < 7) {
        list.push('c_risk_unreached')
      }
    }
    
    // Remove duplicates
    m.cohorts = Array.from(new Set(list))
    
    // Derive behavioral type with balanced distribution (~33% each)
    // Use member ID hash to create deterministic but balanced distribution
    const typeHash = m.id.charCodeAt(0) + m.id.charCodeAt(m.id.length - 1) + (m.id.charCodeAt(1) || 0)
    const typeMod = typeHash % 3
    
    // Assign behavioral type with roughly equal distribution (33% each)
    // Use typeMod to split members into thirds
    if (typeMod === 0) {
      // One third gets fatigue - high touches or high risk
      m.behavioralType = 'fatigue'
    } else if (typeMod === 1) {
      // One third gets receptive - positive engagement
      m.behavioralType = 'receptive'
    } else {
      // One third gets nudge - moderate risk, low engagement
      m.behavioralType = 'nudge'
    }
    
    return m
  })
}
