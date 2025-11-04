// Search utilities for member directory
import type { Member } from './mock'

function norm(s: string): string {
  return s.toLowerCase().trim()
}

function onlyDigits(s: string): string {
  return s.replace(/\D+/g, '')
}

export function matchesDOB(dob: string, query: string): boolean {
  // Accept yyyy-mm-dd, mm/dd/yyyy, mmddyyyy, mm-yyyy, yyyy
  const q = onlyDigits(query)
  const d = onlyDigits(dob)
  if (!q || !d) return false
  
  // full match (mmddyyyy or yyyymmdd)
  if (q.length >= 8 && d.includes(q)) return true
  
  // year-only (yyyy)
  if (q.length === 4 && d.includes(q)) return true
  
  // month-year mmYYYY
  if (q.length === 6 && d.includes(q)) return true
  
  return false
}

export function searchMembers(members: Member[], raw: string): Member[] {
  const q = norm(raw)
  if (!q) return members

  const qDigits = onlyDigits(raw)

  return members.filter((m) => {
    // Search by name (supports partial matches)
    const fullName = norm(m.name)
    const nameHit = fullName.includes(q)

    // Search by memberId (min 3 digits required)
    const idHit = m.memberId && m.memberId.includes(qDigits) && qDigits.length >= 3

    // Search by DOB (multiple formats)
    const dobHit = m.dob && matchesDOB(m.dob, raw)

    return idHit || nameHit || dobHit
  })
}


