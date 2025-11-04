'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download,
  Search,
  Send,
  CheckSquare,
  Square,
  X,
  Filter
} from 'lucide-react'
import type { Member, Outreach } from '@/lib/mock'
import { exportToCSV } from '@/lib/csv'
import { useToast } from '@/hooks/use-toast'
import { cohorts, teams } from '@/lib/mock'
import { groupCohortsByCategory, computeCohortSizes, toMemberCsvRows, membersWithType } from '@/lib/selectors.cohorts'
import { COHORT_CATEGORY_LABEL, MEMBER_TYPE_LABEL, MEMBER_TYPE_HELP, PLANS } from '@/lib/constants'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CohortsDashboardProps {
  members: Member[]
  outreach: Outreach[]
  onAddOutreach: (data: any) => void
}

export function CohortsDashboard({ members, outreach, onAddOutreach }: CohortsDashboardProps) {
  const { toast } = useToast()
  const [selectedCohortIds, setSelectedCohortIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [teamFilter, setTeamFilter] = useState<string>('All')
  const [riskFilter, setRiskFilter] = useState<string>('All')
  const [behavioralTypeFilter, setBehavioralTypeFilter] = useState<string>('All')
  const [planFilter, setPlanFilter] = useState<string>('All')
  const [vendorFilter, setVendorFilter] = useState<string>('All')
  const [conditionFilter, setConditionFilter] = useState<string>('All')
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [bulkOutreachDialog, setBulkOutreachDialog] = useState(false)
  const [bulkOutreachData, setBulkOutreachData] = useState({
    channel: 'SMS',
    purpose: 'AWV',
    topic: '',
    note: ''
  })

  // Get taxonomy cohorts and group by category
  const taxonomyCohorts = useMemo(() => {
    return computeCohortSizes(cohorts, members)
  }, [members])

  const groupedCohorts = useMemo(() => {
    return groupCohortsByCategory(taxonomyCohorts)
  }, [taxonomyCohorts])

  // Toggle cohort selection
  const toggleCohort = (cohortId: string) => {
    const newSelected = new Set(selectedCohortIds)
    if (newSelected.has(cohortId)) {
      newSelected.delete(cohortId)
    } else {
      newSelected.add(cohortId)
    }
    setSelectedCohortIds(newSelected)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCohortIds(new Set())
    setSearchQuery('')
    setTeamFilter('All')
    setRiskFilter('All')
    setBehavioralTypeFilter('All')
    setPlanFilter('All')
    setVendorFilter('All')
    setConditionFilter('All')
    setSelectedMembers(new Set())
  }

  // Get all unique conditions from members
  const allConditions = useMemo(() => {
    const conditionsSet = new Set<string>()
    members.forEach(m => {
      m.conditions.forEach(c => conditionsSet.add(c))
    })
    return Array.from(conditionsSet).sort()
  }, [members])

  // Get all unique vendors from members
  const allVendors = useMemo(() => {
    const vendorsSet = new Set<string>()
    members.forEach(m => {
      vendorsSet.add(m.vendor)
    })
    return Array.from(vendorsSet).sort()
  }, [members])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedCohortIds.size > 0) count++
    if (searchQuery) count++
    if (teamFilter !== 'All') count++
    if (riskFilter !== 'All') count++
    if (behavioralTypeFilter !== 'All') count++
    if (planFilter !== 'All') count++
    if (vendorFilter !== 'All') count++
    if (conditionFilter !== 'All') count++
    return count
  }, [selectedCohortIds, searchQuery, teamFilter, riskFilter, behavioralTypeFilter, planFilter, vendorFilter, conditionFilter])

  // Filter members based on selected cohorts and other filters
  const filteredMembers = useMemo(() => {
    let filtered = members
    
    // Filter by selected cohorts
    if (selectedCohortIds.size > 0) {
      filtered = filtered.filter(member => 
        member.cohorts && member.cohorts.some(cid => selectedCohortIds.has(cid))
      )
    }
    
    // Filter by behavioral type
    if (behavioralTypeFilter !== 'All') {
      filtered = membersWithType(filtered, behavioralTypeFilter as any)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query) ||
        member.memberId.toLowerCase().includes(query) ||
        member.vendor.toLowerCase().includes(query)
      )
    }
    
    // Filter by team (based on recent outreach)
    if (teamFilter !== 'All') {
      filtered = filtered.filter(member => {
        const recentOutreach = outreach
          .filter(o => o.memberId === member.id)
          .slice(0, 5)
        return recentOutreach.some(o => o.team === teamFilter)
      })
    }
    
    // Filter by risk level
    if (riskFilter !== 'All') {
      filtered = filtered.filter(member => {
        switch (riskFilter) {
          case 'Low': return member.risk <= 40
          case 'Medium': return member.risk > 40 && member.risk <= 70
          case 'High': return member.risk > 70
          default: return true
        }
      })
    }
    
    // Filter by plan
    if (planFilter !== 'All') {
      filtered = filtered.filter(member => member.plan === planFilter)
    }
    
    // Filter by vendor
    if (vendorFilter !== 'All') {
      filtered = filtered.filter(member => member.vendor === vendorFilter)
    }
    
    // Filter by condition
    if (conditionFilter !== 'All') {
      filtered = filtered.filter(member => 
        member.conditions.some(c => c === conditionFilter)
      )
    }
    
    return filtered
  }, [members, selectedCohortIds, searchQuery, teamFilter, riskFilter, behavioralTypeFilter, planFilter, vendorFilter, conditionFilter, outreach])

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) return
    
    const csvData = toMemberCsvRows(filteredMembers).map((row, idx) => ({
      ...row,
      'Plan': filteredMembers[idx].plan,
      'Vendor': filteredMembers[idx].vendor,
      'Conditions': filteredMembers[idx].conditions.join(', '),
      'Risk Score': filteredMembers[idx].risk,
    }))
    
    const cohortNames = Array.from(selectedCohortIds)
      .map(id => cohorts.find(c => c.id === id)?.name || id)
      .join('_')
    
    const filename = selectedCohortIds.size > 0 
      ? `${cohortNames}_members.csv`
      : 'all_members.csv'
    
    exportToCSV(csvData, filename)
  }

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)))
    }
  }

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const handleBulkOutreach = () => {
    if (selectedMembers.size === 0) return

    selectedMembers.forEach(memberId => {
      const member = filteredMembers.find(m => m.id === memberId)
      if (member) {
        onAddOutreach({
          memberId: member.id,
          memberName: member.name,
          channel: bulkOutreachData.channel,
          status: 'Planned',
          topic: bulkOutreachData.topic || `${bulkOutreachData.purpose} Outreach`,
          note: bulkOutreachData.note || `Bulk outreach for selected members`,
          team: 'Member Services',
          purpose: bulkOutreachData.purpose
        })
      }
    })

    setBulkOutreachDialog(false)
    setSelectedMembers(new Set())
    setBulkOutreachData({
      channel: 'SMS',
      purpose: 'AWV',
      topic: '',
      note: ''
    })

    toast({
      title: "Bulk Outreach Sent",
      description: `Successfully created outreach for ${selectedMembers.size} members`,
    })
  }


  return (
    <div className="space-y-6">
      {/* Cohort Filters - Grouped by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cohort Filters</span>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{activeFilterCount} active</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(['hedis', 'risk', 'sdoh'] as const).map(cat => {
            const categoryCohorts = groupedCohorts[cat] || []
            if (categoryCohorts.length === 0) return null
            
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold mb-3">{COHORT_CATEGORY_LABEL[cat]}</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryCohorts.map(c => (
                    <Button
                      key={c.id}
                      variant={selectedCohortIds.has(c.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCohort(c.id)}
                      className="flex items-center gap-2"
                    >
                      <span>{c.name}</span>
                      <Badge variant={selectedCohortIds.has(c.id) ? 'secondary' : 'outline'}>
                        {c.size ?? 0}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Member Type Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Member Types</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={behavioralTypeFilter === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBehavioralTypeFilter('All')}
              >
                All Types
              </Button>
              {(['nudge', 'fatigue', 'receptive'] as const).map(type => (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={behavioralTypeFilter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBehavioralTypeFilter(type)}
                    >
                      {MEMBER_TYPE_LABEL[type]}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{MEMBER_TYPE_HELP[type]}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Additional Filters and Member List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Members ({filteredMembers.length})</span>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members by name, ID, or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Teams</SelectItem>
                  <SelectGroup label="Internal Teams">
                    {teams.filter(t => t.type === 'internal').map(t => (
                      <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup label="Vendor Partners">
                    {teams.filter(t => t.type === 'vendor').map(t => (
                      <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Abrasion Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Abrasion Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Abrasion Risk (0-40)</SelectItem>
                  <SelectItem value="Medium">Medium Abrasion Risk (41-70)</SelectItem>
                  <SelectItem value="High">High Abrasion Risk (71-100)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Plans</SelectItem>
                  {PLANS.map(plan => (
                    <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Vendors</SelectItem>
                  {allVendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Conditions</SelectItem>
                  {allConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleSelectAll} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                {selectedMembers.size === filteredMembers.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>
                  {selectedMembers.size === filteredMembers.length ? 'Deselect All' : 'Select All'}
                </span>
              </Button>
              
              {selectedMembers.size > 0 && (
                <Button 
                  onClick={() => setBulkOutreachDialog(true)} 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Bulk Outreach ({selectedMembers.size})</span>
                </Button>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-900 w-12">
                    <Checkbox 
                      checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Member</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Plan/Vendor</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Cohorts</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Member Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Risk</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Checkbox 
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => handleSelectMember(member.id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-gray-500 text-xs">{member.memberId || member.id}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-gray-900">{member.plan}</div>
                        <div className="text-gray-500 text-xs">{member.vendor}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {member.cohorts && member.cohorts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {member.cohorts.slice(0, 2).map(cid => {
                            const cohort = cohorts.find(c => c.id === cid)
                            return (
                              <Badge key={cid} variant="secondary" className="text-xs">
                                {cohort?.name || cid.replace('c_', '')}
                              </Badge>
                            )
                          })}
                          {member.cohorts.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.cohorts.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {member.behavioralType ? (
                        <Badge variant="outline" className="text-xs">
                          {MEMBER_TYPE_LABEL[member.behavioralType]}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={member.risk <= 40 ? 'secondary' : member.risk <= 70 ? 'default' : 'destructive'}>
                        {member.risk}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {member.conditions.slice(0, 2).map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {member.conditions.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.conditions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No members found matching the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Outreach Dialog */}
      <Dialog open={bulkOutreachDialog} onOpenChange={setBulkOutreachDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Bulk Outreach</span>
            </DialogTitle>
            <DialogDescription>
              Send outreach to {selectedMembers.size} selected members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Channel</label>
              <Select value={bulkOutreachData.channel} onValueChange={(value) => setBulkOutreachData(prev => ({ ...prev, channel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Portal">Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Purpose</label>
              <Select value={bulkOutreachData.purpose} onValueChange={(value) => setBulkOutreachData(prev => ({ ...prev, purpose: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWV">AWV</SelectItem>
                  <SelectItem value="HEDIS - A1c">HEDIS - A1c</SelectItem>
                  <SelectItem value="HEDIS - Mammogram">HEDIS - Mammogram</SelectItem>
                  <SelectItem value="Medication Adherence">Medication Adherence</SelectItem>
                  <SelectItem value="RAF/Chart Retrieval">RAF/Chart Retrieval</SelectItem>
                  <SelectItem value="Care Transition Follow-up">Care Transition Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Topic</label>
              <Input
                value={bulkOutreachData.topic}
                onChange={(e) => setBulkOutreachData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Enter outreach topic"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Note</label>
              <Input
                value={bulkOutreachData.note}
                onChange={(e) => setBulkOutreachData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Enter additional notes"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setBulkOutreachDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkOutreach} className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Send to {selectedMembers.size} Members</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
