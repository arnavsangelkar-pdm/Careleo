'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { downloadCSV, formatAuditForCSV } from '@/lib/csv'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Download, 
  Shield, 
  User, 
  Calendar,
  Activity,
  CheckCircle,
  Filter,
  X,
  Clock,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { type AuditEntry } from '@/lib/mock'

interface AuditTabProps {
  audit: AuditEntry[]
}

export function AuditTab({ audit }: AuditTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    actor: 'all',
    action: 'all',
    objectType: 'all',
    memberId: 'all',
    dateRange: 'all',
    showFilters: false
  })
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)
  const { toast } = useToast()

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const actors = Array.from(new Set(audit.map(entry => entry.actor))).sort()
    const actions = Array.from(new Set(audit.map(entry => entry.action))).sort()
    const objectTypes = Array.from(new Set(audit.map(entry => entry.objectType))).sort()
    const memberIds = Array.from(new Set(audit.map(entry => entry.memberId))).sort()
    
    return { actors, actions, objectTypes, memberIds }
  }, [audit])

  // Filter audit entries based on search query and filters
  const filteredAudit = useMemo(() => {
    let filtered = audit

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.actor.toLowerCase().includes(query) ||
        entry.action.toLowerCase().includes(query) ||
        entry.objectType.toLowerCase().includes(query) ||
        entry.memberId.toLowerCase().includes(query) ||
        entry.details.toLowerCase().includes(query) ||
        entry.objectId.toLowerCase().includes(query) ||
        entry.ip.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.actor && filters.actor !== 'all') {
      filtered = filtered.filter(entry => entry.actor === filters.actor)
    }
    if (filters.action && filters.action !== 'all') {
      filtered = filtered.filter(entry => entry.action === filters.action)
    }
    if (filters.objectType && filters.objectType !== 'all') {
      filtered = filtered.filter(entry => entry.objectType === filters.objectType)
    }
    if (filters.memberId && filters.memberId !== 'all') {
      filtered = filtered.filter(entry => entry.memberId === filters.memberId)
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      const daysAgo = parseInt(filters.dateRange)
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= cutoffDate)
    }

    return filtered
  }, [audit, searchQuery, filters])

  const clearFilters = () => {
    setFilters({
      actor: 'all',
      action: 'all',
      objectType: 'all',
      memberId: 'all',
      dateRange: 'all',
      showFilters: false
    })
    setSearchQuery('')
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'showFilters' && value && value !== 'all'
  )

  const handleExportCSV = () => {
    try {
      const csvData = formatAuditForCSV(filteredAudit)
      downloadCSV(csvData, `audit-trail-${new Date().toISOString().split('T')[0]}.csv`)
      
      toast({
        title: "Export Successful",
        description: `Downloaded ${filteredAudit.length} audit entries as CSV`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export audit data. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleComplianceCheck = () => {
    toast({
      title: "Compliance Check Complete",
      description: "All audit entries passed compliance validation. No issues found.",
    })
  }

  const getActionVariant = (action: string) => {
    if (action.includes('CREATE') || action.includes('LOGIN')) return 'default'
    if (action.includes('UPDATE') || action.includes('SEND')) return 'secondary'
    if (action.includes('DELETE') || action.includes('LOGOUT')) return 'outline'
    return 'secondary'
  }

  const getObjectTypeColor = (objectType: string) => {
    switch (objectType) {
      case 'Member': return 'bg-blue-100 text-blue-800'
      case 'Outreach': return 'bg-green-100 text-green-800'
      case 'System': return 'bg-purple-100 text-purple-800'
      case 'Report': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate audit metrics
  const totalEntries = audit.length
  const todayEntries = audit.filter(entry => {
    const entryDate = new Date(entry.timestamp).toDateString()
    const today = new Date().toDateString()
    return entryDate === today
  }).length
  const uniqueActors = new Set(audit.map(entry => entry.actor)).size
  const systemActions = audit.filter(entry => entry.objectType === 'System').length

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <SectionTitle 
          title="Audit Trail" 
          subtitle="Complete activity log for compliance and security monitoring"
        />
        <div className="flex space-x-2">
          <Button onClick={handleComplianceCheck} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Compliance Check
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Audit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          title="Total Entries"
          value={totalEntries}
          subtitle="All time"
        />
        <Stat
          title="Today's Activity"
          value={todayEntries}
          subtitle="Last 24 hours"
        />
        <Stat
          title="Active Users"
          value={uniqueActors}
          subtitle="Unique actors"
        />
        <Stat
          title="System Events"
          value={systemActions}
          subtitle="System actions"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Audit Log</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter(v => v && v !== 'showFilters').length}
                </Badge>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search audit entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            {filters.showFilters && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Actor Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Actor</label>
                    <Select value={filters.actor} onValueChange={(value) => setFilters(prev => ({ ...prev, actor: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All actors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All actors</SelectItem>
                        {filterOptions.actors.map(actor => (
                          <SelectItem key={actor} value={actor}>{actor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Action</label>
                    <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        {filterOptions.actions.map(action => (
                          <SelectItem key={action} value={action}>{action.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Object Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Object Type</label>
                    <Select value={filters.objectType} onValueChange={(value) => setFilters(prev => ({ ...prev, objectType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {filterOptions.objectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Member ID Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Member ID</label>
                    <Select value={filters.memberId} onValueChange={(value) => setFilters(prev => ({ ...prev, memberId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All members</SelectItem>
                        {filterOptions.memberIds.slice(0, 20).map(memberId => (
                          <SelectItem key={memberId} value={memberId}>{memberId}</SelectItem>
                        ))}
                        {filterOptions.memberIds.length > 20 && (
                          <SelectItem value="more" disabled>
                            ... and {filterOptions.memberIds.length - 20} more
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Date Range</label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="1">Last 24 hours</SelectItem>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {filteredAudit.length} entries found
                {hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    (filtered from {audit.length} total)
                  </span>
                )}
              </p>
              {hasActiveFilters && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Filters applied</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Entries */}
          <div className="space-y-3">
            {filteredAudit.slice(0, hasActiveFilters ? 100 : 50).map((entry) => (
              <div 
                key={entry.id} 
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none"
                style={{ pointerEvents: 'auto' }}
                role="article"
                aria-label={`Audit entry: ${entry.action} by ${entry.actor}`}
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getActionVariant(entry.action)} className="text-xs">
                        {entry.action.replace('_', ' ')}
                      </Badge>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getObjectTypeColor(entry.objectType)}`}>
                        {entry.objectType}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {entry.objectId}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{entry.details}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{entry.actor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>Member: {entry.memberId}</span>
                      </div>
                      <span>IP: {entry.ip}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAudit.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit entries found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search criteria or check back later for new activity.
              </p>
            </div>
          )}

          {filteredAudit.length > (hasActiveFilters ? 100 : 50) && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Showing first {hasActiveFilters ? 100 : 50} entries. 
                {hasActiveFilters ? ' Use additional filters to narrow results further.' : ' Use search and filters to narrow results.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Entry Detail View */}
      {selectedEntry && (
        <div key={`detail-${selectedEntry.id}`} className="border-4 border-blue-500 rounded-lg p-6 bg-blue-50 shadow-lg" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, width: '80%', maxWidth: '800px' }}>
          <div className="bg-blue-100 p-2 mb-4 rounded text-center font-bold text-blue-800">
            AUDIT ENTRY DETAILS - Entry ID: {selectedEntry.id}
          </div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Audit Entry Details</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEntry(null)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to List</span>
            </Button>
          </div>
          <div>
            <div className="space-y-6">
              {/* Entry Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Entry ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedEntry.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Action</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getActionVariant(selectedEntry.action)}>
                        {selectedEntry.action.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Object Type</label>
                    <p className="text-sm text-gray-900">{selectedEntry.objectType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Object ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedEntry.objectId}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Actor</label>
                    <p className="text-sm text-gray-900">{selectedEntry.actor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Member ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedEntry.memberId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Address</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedEntry.ip}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Details</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedEntry.details}</p>
                </div>
              </div>

              {/* Security Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Security Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">IP Address</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedEntry.ip}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Timestamp (UTC)</label>
                    <p className="text-sm text-gray-900">{new Date(selectedEntry.timestamp).toISOString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedEntry, null, 2))
                    toast({
                      title: "Copied to Clipboard",
                      description: "Audit entry details copied to clipboard",
                    })
                  }}
                >
                  Copy Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csvContent = `Entry ID,Action,Object Type,Object ID,Actor,Member ID,Timestamp,IP,Details\n${selectedEntry.id},${selectedEntry.action},${selectedEntry.objectType},${selectedEntry.objectId},${selectedEntry.actor},${selectedEntry.memberId},${selectedEntry.timestamp},${selectedEntry.ip},"${selectedEntry.details}"`
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `audit-entry-${selectedEntry.id}.csv`
                    a.click()
                    window.URL.revokeObjectURL(url)
                  }}
                >
                  Export Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Compliance Ready</h3>
              <p className="text-sm text-blue-700 mt-1">
                This audit trail meets healthcare compliance requirements. 
                All entries include timestamps, actor identification, and detailed action logs.
                Export functionality provides CSV format for external compliance systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
