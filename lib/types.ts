// Type definitions for the Careleo CRM demo
// All data and actions are mocked for demonstration purposes

export interface MemberSdohProfile {
  socialRiskScore: number // 0-100
  needs: {
    food: number // 0-100
    housing: number // 0-100
    transportation: number // 0-100
    utilities: number // 0-100
    behavioralHealth: number // 0-100
  }
  areaContext: {
    zipCode: string
    adi: number // 1-10 (Area Deprivation Index)
    svi: number // 0-1 (Social Vulnerability Index)
    broadbandAccess: number // 0-100
    primaryLanguage: string
  }
  recommendedResources: Array<{
    id: string
    name: string
    type: 'Food' | 'Transportation' | 'Utilities' | 'Behavioral Health'
    description: string
    contactInfo: string
  }>
}

export interface SdohOutreach extends Outreach {
  dataDomain?: 'SDOH'
}

// Re-export existing types for convenience
export type { Member, Outreach, AuditEntry } from './mock'
