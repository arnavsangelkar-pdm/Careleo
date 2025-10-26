// Type definitions for the Careleo CRM demo
// All data and actions are mocked for demonstration purposes

import type { Outreach } from './mock'
import type { Lob, MemberType } from './constants'

export type Plan =
  | 'MA HMO'
  | 'MA PPO'
  | 'MA PFFS'
  | 'MA SNP'
  | 'Medicaid-NY'
  | 'Medicaid-KY'
  | 'Medicaid-FL'
  | 'Medicaid-GA'
  | 'Medicaid-NV'
  | 'Medicaid-NC'
  | 'D-SNP';

export interface ContractAssignment {
  hcontract: string; // e.g., H1234
  pbp: string;       // e.g., 017
}

export interface PlanInfo {
  contractId: string   // e.g., H1234
  pbp: string          // e.g., 017
  lob: Lob
  planName: string     // e.g., "Care Advantage HMO"
  county?: string
  effectiveDate?: string // ISO
}

export interface MemberSdohProfile {
  socialRiskScore: number // 0-100
  needs: {
    economicInstability: number // 0-100
    foodInsecurity: number // 0-100
    housingAndNeighborhood: number // 0-100
    healthcareAccess: number // 0-100
    education: number // 0-100
    socialAndCommunity: number // 0-100
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
    type: 'Economic Instability' | 'Food Insecurity' | 'Housing and Neighborhood Issues' | 'Healthcare Access' | 'Education' | 'Social and Community Context'
    description: string
    contactInfo: string
  }>
}

export interface SdohOutreach extends Outreach {
  dataDomain?: 'SDOH'
}

// Re-export existing types for convenience
export type { Member, Outreach, AuditEntry } from './mock'
