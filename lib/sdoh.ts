// SDOH (Social Determinants of Health) helpers for the Careleo CRM demo
// All calculations are deterministic and mocked for demonstration purposes

import type { Member, Outreach } from './mock'
import type { MemberSdohProfile } from './types'
import { SDOH_NEEDS } from './constants'

// Deterministic seed for consistent SDOH scoring
const SDOH_SEED = 54321

// Simple seeded random number generator for SDOH
function sdohSeededRandom(seed: number): () => number {
  let current = seed
  return () => {
    current = (current * 9301 + 49297) % 233280
    return current / 233280
  }
}

const sdohRandom = sdohSeededRandom(SDOH_SEED)

// Helper to get deterministic value based on member ID
function getMemberSeed(memberId: string): number {
  return memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10000
}

// Mock resource database
const MOCK_RESOURCES = {
  'Economic Instability': [
    { id: 'E001', name: 'Financial Assistance Program', description: 'Emergency financial support', contactInfo: '555-FINANCE-01' },
    { id: 'E002', name: 'Job Training Center', description: 'Skills development and job placement', contactInfo: '555-JOBS-02' },
    { id: 'E003', name: 'Housing Voucher Office', description: 'Rental assistance programs', contactInfo: '555-HOUSING-03' }
  ],
  'Food Insecurity': [
    { id: 'F001', name: 'Community Food Bank', description: 'Emergency food assistance', contactInfo: '555-FOOD-01' },
    { id: 'F002', name: 'Meals on Wheels', description: 'Home-delivered meals for seniors', contactInfo: '555-MEALS-02' },
    { id: 'F003', name: 'SNAP Benefits Office', description: 'Food assistance program enrollment', contactInfo: '555-SNAP-03' }
  ],
  'Housing and Neighborhood Issues': [
    { id: 'H001', name: 'Safe Housing Program', description: 'Emergency housing assistance', contactInfo: '555-HOUSING-01' },
    { id: 'H002', name: 'Neighborhood Safety Initiative', description: 'Community safety programs', contactInfo: '555-SAFETY-02' },
    { id: 'H003', name: 'Environmental Health Services', description: 'Air quality and pollution assistance', contactInfo: '555-ENV-03' }
  ],
  'Healthcare Access': [
    { id: 'C001', name: 'Community Health Center', description: 'Low-cost primary care services', contactInfo: '555-HEALTH-01' },
    { id: 'C002', name: 'Telehealth Support', description: 'Remote healthcare access', contactInfo: '555-TELE-02' },
    { id: 'C003', name: 'Prescription Assistance', description: 'Medication cost reduction programs', contactInfo: '555-RX-03' }
  ],
  'Education': [
    { id: 'D001', name: 'Adult Education Center', description: 'GED and literacy programs', contactInfo: '555-EDU-01' },
    { id: 'D002', name: 'Health Literacy Program', description: 'Understanding health information', contactInfo: '555-HEALTH-02' },
    { id: 'D003', name: 'Digital Skills Training', description: 'Computer and internet literacy', contactInfo: '555-DIGITAL-03' }
  ],
  'Social and Community Context': [
    { id: 'S001', name: 'Community Support Groups', description: 'Peer support and social connection', contactInfo: '555-SUPPORT-01' },
    { id: 'S002', name: 'Cultural Center', description: 'Cultural and language support', contactInfo: '555-CULTURE-02' },
    { id: 'S003', name: 'Mental Health Services', description: 'Counseling and crisis support', contactInfo: '555-MENTAL-03' }
  ]
}

// Derive social aberration risk score (0-100) based on member characteristics
export function deriveSocialRisk(member: Member, outreach: Outreach[]): number {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Base aberration risk from age and conditions
  const age = new Date().getFullYear() - new Date(member.dob).getFullYear()
  let aberrationRisk = Math.min(age * 0.8 + member.conditions.length * 12, 100)
  
  // Adjust based on recent outreach patterns
  const recentOutreach = outreach.filter(o => 
    o.memberId === member.id && 
    new Date(o.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  if (recentOutreach.length > 3) aberrationRisk += 15
  if (recentOutreach.some(o => o.status === 'Failed')) aberrationRisk += 10
  
  // Add some deterministic randomness
  aberrationRisk += (random() - 0.5) * 20
  
  return Math.max(0, Math.min(100, Math.round(aberrationRisk)))
}

// Estimate SDOH needs (0-100 each)
export function estimateNeeds(member: Member, outreach: Outreach[]): MemberSdohProfile['needs'] {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Base needs influenced by conditions and aberration risk - adjusted to ensure some members have high needs
  const baseFoodInsecurity = member.conditions.includes('Diabetes') ? 55 : 35
  const baseHousing = member.conditions.includes('COPD') ? 70 : 40
  const baseEconomic = member.aberrationRisk > 70 ? 65 : 35
  const baseSocial = member.conditions.some(c => ['Depression', 'Anxiety'].includes(c)) ? 75 : 30
  const baseHealthcare = member.aberrationRisk > 60 ? 50 : 30
  const baseEducation = member.aberrationRisk > 50 ? 45 : 25
  
  // Add more variance to ensure some members reach the ≥65 threshold for cohorts
  const variance = 40 // Increased from 20-30 to 40
  
  return {
    economicInstability: Math.max(0, Math.min(100, Math.round(baseEconomic + (random() - 0.5) * variance))),
    foodInsecurity: Math.max(0, Math.min(100, Math.round(baseFoodInsecurity + (random() - 0.5) * variance))),
    housingAndNeighborhood: Math.max(0, Math.min(100, Math.round(baseHousing + (random() - 0.5) * variance))),
    healthcareAccess: Math.max(0, Math.min(100, Math.round(baseHealthcare + (random() - 0.5) * variance))),
    education: Math.max(0, Math.min(100, Math.round(baseEducation + (random() - 0.5) * variance))),
    socialAndCommunity: Math.max(0, Math.min(100, Math.round(baseSocial + (random() - 0.5) * variance)))
  }
}

// Suggest 2-3 resources for top needs
export function suggestResources(member: Member, needs: MemberSdohProfile['needs']): MemberSdohProfile['recommendedResources'] {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Find top 2-3 needs
  const needEntries = Object.entries(needs) as [keyof typeof needs, number][]
  const sortedNeeds = needEntries
    .filter(([_, score]) => score >= 50) // Only suggest for moderate+ needs
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  
  const resources: MemberSdohProfile['recommendedResources'] = []
  
  sortedNeeds.forEach(([needType, score]) => {
    const needKeyMap = {
      economicInstability: 'Economic Instability',
      foodInsecurity: 'Food Insecurity',
      housingAndNeighborhood: 'Housing and Neighborhood Issues',
      healthcareAccess: 'Healthcare Access',
      education: 'Education',
      socialAndCommunity: 'Social and Community Context'
    }
    
    const needKey = needKeyMap[needType]
    
    if (MOCK_RESOURCES[needKey as keyof typeof MOCK_RESOURCES]) {
      const availableResources = MOCK_RESOURCES[needKey as keyof typeof MOCK_RESOURCES]
      const selectedResource = availableResources[Math.floor(random() * availableResources.length)]
      
      resources.push({
        ...selectedResource,
        type: needKey as 'Economic Instability' | 'Food Insecurity' | 'Housing and Neighborhood Issues' | 'Healthcare Access' | 'Education' | 'Social and Community Context'
      })
    }
  })
  
  return resources
}

// Generate area context for member
export function generateAreaContext(member: Member): MemberSdohProfile['areaContext'] {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Generate deterministic area data
  const zipCode = `90${Math.floor(random() * 1000).toString().padStart(3, '0')}`
  const adi = Math.floor(random() * 10) + 1 // 1-10
  const svi = Math.round(random() * 100) / 100 // 0-1
  const broadbandAccess = Math.max(20, Math.round(100 - (adi * 8) + (random() - 0.5) * 20))
  
  const languages = ['English', 'Spanish', 'Mandarin', 'Arabic', 'French']
  const primaryLanguage = languages[Math.floor(random() * languages.length)]
  
  return {
    zipCode,
    adi,
    svi,
    broadbandAccess: Math.max(0, Math.min(100, broadbandAccess)),
    primaryLanguage
  }
}

// Generate complete SDOH profile for member
export function generateSdohProfile(member: Member, outreach: Outreach[]): MemberSdohProfile {
  const socialRiskScore = deriveSocialRisk(member, outreach)
  const needs = estimateNeeds(member, outreach)
  const areaContext = generateAreaContext(member)
  const recommendedResources = suggestResources(member, needs)
  
  return {
    socialRiskScore,
    needs,
    areaContext,
    recommendedResources
  }
}

// Helper to determine preferred channel for SDOH outreach
export function preferChannelFor(member: Member): 'Call' | 'SMS' | 'Email' | 'Portal' {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Prefer channels based on member characteristics
  if (member.conditions.includes('Depression') || member.conditions.includes('Anxiety')) {
    return random() > 0.5 ? 'SMS' : 'Email' // Less intrusive for mental health
  }
  
  if (member.aberrationRisk > 70) {
    return 'Call' // High aberration risk members get personal touch
  }
  
  // Default distribution
  const rand = random()
  if (rand < 0.3) return 'Call'
  if (rand < 0.6) return 'SMS'
  if (rand < 0.9) return 'Email'
  return 'Portal'
}
