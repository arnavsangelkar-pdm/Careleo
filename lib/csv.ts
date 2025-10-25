// Client-side CSV export functionality

export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape values that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Format audit data for CSV export
export function formatAuditForCSV(auditEntries: any[]) {
  return auditEntries.map(entry => ({
    'Timestamp': new Date(entry.timestamp).toLocaleString(),
    'Actor': entry.actor,
    'Action': entry.action,
    'Object Type': entry.objectType,
    'Object ID': entry.objectId,
    'Member ID': entry.memberId,
    'IP Address': entry.ip,
    'Details': entry.details
  }))
}

// Format outreach data for CSV export
export function formatOutreachForCSV(outreachEntries: any[]) {
  return outreachEntries.map(entry => ({
    'Timestamp': new Date(entry.timestamp).toLocaleString(),
    'Member ID': entry.memberId,
    'Member Name': entry.memberName,
    'Channel': entry.channel,
    'Status': entry.status,
    'Topic': entry.topic,
    'Agent': entry.agent,
    'Note': entry.note
  }))
}

// Format member data for CSV export
export function formatMembersForCSV(memberEntries: any[]) {
  return memberEntries.map(member => ({
    'ID': member.id,
    'Name': member.name,
    'Date of Birth': member.dob,
    'Plan': member.plan,
    'Vendor': member.vendor,
    'Phone': member.phone,
    'Email': member.email,
    'Address': member.address,
    'Conditions': member.conditions.join('; '),
    'Aberration Risk Score': member.aberrationRisk
  }))
}

// Generic CSV export function
export function exportToCSV(data: any[], filename: string) {
  downloadCSV(data, filename)
}
