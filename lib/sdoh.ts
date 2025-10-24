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
  Food: [
    { id: 'F001', name: 'Community Food Bank', description: 'Emergency food assistance', contactInfo: '555-FOOD-01' },
    { id: 'F002', name: 'Meals on Wheels', description: 'Home-delivered meals for seniors', contactInfo: '555-MEALS-02' },
    { id: 'F003', name: 'SNAP Benefits Office', description: 'Food assistance program enrollment', contactInfo: '555-SNAP-03' }
  ],
  Transportation: [
    { id: 'T001', name: 'RideShare Program', description: 'Free rides to medical appointments', contactInfo: '555-RIDE-01' },
    { id: 'T002', name: 'Public Transit Pass', description: 'Discounted monthly transit passes', contactInfo: '555-TRANSIT-02' },
    { id: 'T003', name: 'Volunteer Drivers', description: 'Community volunteer transportation', contactInfo: '555-VOLUNTEER-03' }
  ],
  Utilities: [
    { id: 'U001', name: 'Energy Assistance Program', description: 'Help with heating/cooling bills', contactInfo: '555-ENERGY-01' },
    { id: 'U002', name: 'Water Bill Relief', description: 'Emergency water bill assistance', contactInfo: '555-WATER-02' },
    { id: 'U003', name: 'Internet Access Program', description: 'Low-cost internet for telehealth', contactInfo: '555-INTERNET-03' }
  ],
  'Behavioral Health': [
    { id: 'B001', name: 'Crisis Hotline', description: '24/7 mental health crisis support', contactInfo: '555-CRISIS-01' },
    { id: 'B002', name: 'Community Counseling', description: 'Sliding-scale therapy services', contactInfo: '555-COUNSEL-02' },
    { id: 'B003', name: 'Support Groups', description: 'Peer support for mental health', contactInfo: '555-SUPPORT-03' }
  ]
}

// Derive social risk score (0-100) based on member characteristics
export function deriveSocialRisk(member: Member, outreach: Outreach[]): number {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Base risk from age and conditions
  const age = new Date().getFullYear() - new Date(member.dob).getFullYear()
  let risk = Math.min(age * 0.8 + member.conditions.length * 12, 100)
  
  // Adjust based on recent outreach patterns
  const recentOutreach = outreach.filter(o => 
    o.memberId === member.id && 
    new Date(o.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  if (recentOutreach.length > 3) risk += 15
  if (recentOutreach.some(o => o.status === 'Failed')) risk += 10
  
  // Add some deterministic randomness
  risk += (random() - 0.5) * 20
  
  return Math.max(0, Math.min(100, Math.round(risk)))
}

// Estimate SDOH needs (0-100 each)
export function estimateNeeds(member: Member, outreach: Outreach[]): MemberSdohProfile['needs'] {
  const memberSeed = getMemberSeed(member.id)
  const random = sdohSeededRandom(memberSeed)
  
  // Base needs influenced by conditions and risk
  const baseFood = member.conditions.includes('Diabetes') ? 45 : 25
  const baseTransport = member.conditions.includes('COPD') ? 60 : 30
  const baseUtilities = member.risk > 70 ? 55 : 25
  const baseBH = member.conditions.some(c => ['Depression', 'Anxiety'].includes(c)) ? 70 : 20
  
  return {
    food: Math.max(0, Math.min(100, Math.round(baseFood + (random() - 0.5) * 30))),
    housing: Math.max(0, Math.min(100, Math.round(30 + (random() - 0.5) * 40))),
    transportation: Math.max(0, Math.min(100, Math.round(baseTransport + (random() - 0.5) * 25))),
    utilities: Math.max(0, Math.min(100, Math.round(baseUtilities + (random() - 0.5) * 30))),
    behavioralHealth: Math.max(0, Math.min(100, Math.round(baseBH + (random() - 0.5) * 20)))
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
    const needKey = needType === 'behavioralHealth' ? 'Behavioral Health' : 
                   needType.charAt(0).toUpperCase() + needType.slice(1)
    
    if (MOCK_RESOURCES[needKey as keyof typeof MOCK_RESOURCES]) {
      const availableResources = MOCK_RESOURCES[needKey as keyof typeof MOCK_RESOURCES]
      const selectedResource = availableResources[Math.floor(random() * availableResources.length)]
      
      resources.push({
        ...selectedResource,
        type: needKey as 'Food' | 'Transportation' | 'Utilities' | 'Behavioral Health'
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
  
  if (member.risk > 70) {
    return 'Call' // High-risk members get personal touch
  }
  
  // Default distribution
  const rand = random()
  if (rand < 0.3) return 'Call'
  if (rand < 0.6) return 'SMS'
  if (rand < 0.9) return 'Email'
  return 'Portal'
}
