// Filter helpers for building URLs and processing filter parameters
// Phase 1: Members deep-linking and filter utilities

export function buildMembersUrl(params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, String(v))
  })
  return `/members?${q.toString()}`
}

export function abrasionBucketFromScore(score?: number): 'low' | 'med' | 'high' | undefined {
  if (score == null) return undefined
  if (score <= 39) return 'low'
  if (score <= 69) return 'med'
  return 'high'
}

