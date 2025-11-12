// Cohort selectors and utilities for grouping, filtering, and CSV export
// All calculations are deterministic and mocked for demo purposes

import type { Cohort, Member } from './types'
import { MEMBER_TYPE_LABEL } from './constants'

/**
 * Group cohorts by category (HEDIS, Risk, SDOH)
 */
export function groupCohortsByCategory(list: Cohort[]): Record<string, Cohort[]> {
  return list.reduce<Record<string, Cohort[]>>((acc, c) => {
    const key = c.category
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(c)
    return acc
  }, {})
}

/**
 * Get all members in a specific cohort
 */
export function membersInCohort(members: Member[], cohortId: string): Member[] {
  return members.filter(m => m.cohorts?.includes(cohortId))
}

/**
 * Get all members with a specific behavioral type
 */
export function membersWithType(
  members: Member[],
  type: Member['behavioralType']
): Member[] {
  return members.filter(m => m.behavioralType === type)
}

/**
 * Compute cohort sizes based on current member data
 */
export function computeCohortSizes(cohorts: Cohort[], members: Member[]): Cohort[] {
  const sizes: Record<string, number> = {}
  
  for (const m of members) {
    if (m.cohorts) {
      for (const c of m.cohorts) {
        sizes[c] = (sizes[c] || 0) + 1
      }
    }
  }
  
  return cohorts.map(c => ({
    ...c,
    size: sizes[c.id] || 0
  }))
}

/**
 * Convert member list to CSV rows with member type and cohorts
 */
export function toMemberCsvRows(list: Member[]) {
  return list.map(m => ({
    memberId: m.memberId,
    name: `${m.name}`,
    dob: m.dob,
    memberType: m.behavioralType ? MEMBER_TYPE_LABEL[m.behavioralType] : '',
    cohorts: (m.cohorts || []).join('|'),
  }))
}

/**
 * Phase 1: Filter members by HEDIS gap (open gaps only)
 */
export function filterByHedis(list: Member[], codes: string[]) {
  if (!codes?.length) return list
  return list.filter(m => 
    m.measures?.some(me => 
      codes.includes(me.code) && me.gap !== 'closed'
    )
  )
}

/**
 * Phase 1: Filter members by abrasion risk bucket
 */
export function filterByAbrasionBucket(
  list: Member[],
  bucket?: 'low' | 'med' | 'high'
) {
  if (!bucket) return list
  const ranges = { low: [0, 39], med: [40, 69], high: [70, 100] } as const
  const [min, max] = ranges[bucket]
  return list.filter(m => {
    const risk = m.abrasionRisk ?? m.risk ?? -1
    return risk >= min && risk <= max
  })
}


