// Data generators for the Insurer CRM
// Deterministic data generation for consistent results

export interface Member {
  id: string
  name: string
  dob: string
  plan: string
  vendor: string
  phone: string
  email: string
  address: string
  conditions: string[]
  risk: number // 0-100
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
  team: 'Risk Adjustment' | 'Quality' | 'Member Services' | 'Case Management' | 'Pharmacy'
  purpose: 'AWV' | 'HEDIS - A1c' | 'HEDIS - Mammogram' | 'Medication Adherence' | 'RAF/Chart Retrieval' | 'Care Transition Follow-up'
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
  vendor: string
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
function randomChoice<T>(arr: T[]): T {
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

const PLANS = [
  'Premium Health Plus', 'Standard Care', 'Basic Coverage', 'Family Plan',
  'Senior Advantage', 'HMO Select', 'PPO Gold', 'Medicare Supplement'
]

const VENDORS = [
  'BlueCross BlueShield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana',
  'Kaiser Permanente', 'Anthem', 'Molina Healthcare'
]

const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'COPD',
  'Arthritis', 'Depression', 'Anxiety', 'High Cholesterol', 'Obesity',
  'Sleep Apnea', 'Chronic Pain', 'Migraine', 'Allergies', 'Thyroid Disorder'
]

const AGENTS = [
  'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Kim', 'Emma Wilson',
  'James Brown', 'Maria Garcia', 'Robert Taylor', 'Jennifer Lee', 'Christopher Davis'
]

const TOPICS = [
  'Annual Checkup Reminder', 'Medication Adherence', 'Preventive Care',
  'Wellness Program', 'Claims Inquiry', 'Provider Network', 'Coverage Questions',
  'Health Assessment', 'Care Coordination', 'Disease Management'
]

const TEAMS = [
  'Risk Adjustment', 'Quality', 'Member Services', 'Case Management', 'Pharmacy'
]

const PURPOSES = [
  'AWV', 'HEDIS - A1c', 'HEDIS - Mammogram', 'Medication Adherence',
  'RAF/Chart Retrieval', 'Care Transition Follow-up'
]

// Generate mock members
export function generateMockMembers(count: number = 50): Member[] {
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
    
    // Generate risk score based on age and conditions
    let risk = Math.min(20 + age * 0.5 + conditions.length * 15, 100)
    risk = Math.max(risk + randomInt(-10, 10), 0)
    
    members.push({
      id: `M${String(i + 1).padStart(4, '0')}`,
      name,
      dob: dob.toISOString().split('T')[0],
      plan: randomChoice(PLANS),
      vendor: randomChoice(VENDORS),
      phone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `${randomInt(100, 9999)} ${randomChoice(['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Maple Dr'])}`,
      conditions,
      risk: Math.round(risk)
    })
  }
  
  return members
}

// Generate mock outreach entries
export function generateMockOutreach(members: Member[], count: number = 100): Outreach[] {
  const outreach: Outreach[] = []
  
  for (let i = 0; i < count; i++) {
    const member = randomChoice(members)
    const timestamp = randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      new Date()
    )
    
    outreach.push({
      id: `O${String(i + 1).padStart(4, '0')}`,
      memberId: member.id,
      memberName: member.name,
      channel: randomChoice(['Call', 'SMS', 'Email', 'Portal']),
      status: randomChoice(['Planned', 'In-Progress', 'Completed', 'Failed']),
      topic: randomChoice(TOPICS),
      timestamp,
      agent: randomChoice(AGENTS),
      note: `Outreach regarding ${randomChoice(TOPICS).toLowerCase()}. ${randomChoice([
        'Member was responsive and engaged.',
        'Left voicemail, no response yet.',
        'Member requested callback.',
        'Completed successfully.',
        'Member declined to participate.',
        'Technical issues encountered.'
      ])}`,
      team: randomChoice(TEAMS) as 'Risk Adjustment' | 'Quality' | 'Member Services' | 'Case Management' | 'Pharmacy',
      purpose: randomChoice(PURPOSES) as 'AWV' | 'HEDIS - A1c' | 'HEDIS - Mammogram' | 'Medication Adherence' | 'RAF/Chart Retrieval' | 'Care Transition Follow-up'
    })
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
      vendor: member.vendor,
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
    member.vendor.toLowerCase().includes(lowercaseQuery)
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
  if (risk <= 40) return 'Low Risk'
  if (risk <= 70) return 'Medium Risk'
  return 'High Risk'
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
