'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { MockQuickAdd } from './MockQuickAdd'
import { 
  filterOutreachByChannel, 
  filterOutreachByStatus,
  getOutreachByChannel,
  getTopAndBottomChannels,
  type Outreach
} from '@/lib/mock'
import { OUTREACH_TEAMS, PURPOSE_CODES, CODE_TO_PURPOSE, STATUS_DEFINITIONS } from '@/lib/constants'
import { 
  touchesPerMember, 
  monthOverMonth, 
  getHraOutreach,
  getTopChannel
} from '@/lib/metrics'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Search, 
  Phone, 
  MessageSquare, 
  Mail, 
  Monitor,
  Calendar,
  User,
  TrendingUp,
  Filter,
  Plus,
  Users
} from 'lucide-react'
import TeamDrillIn from './outreach/TeamDrillIn'
import { TEAMS_EXPANDED, TIMEFRAMES } from '@/lib/constants'
import ImportOutreachModal from './outreach/ImportOutreachModal'
import { loadLocal, saveLocal } from '@/lib/storage'

interface OutreachTabProps {
  outreach: Outreach[]
  members: any[]
  onAddOutreach: (data: any) => void
  onNavigateToOutreach?: (filters: Record<string, string>) => void
}

export function OutreachTab({ outreach, members, onAddOutreach, onNavigateToOutreach }: OutreachTabProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Load persistent filters from localStorage
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-outreach-search', '')
    }
    return ''
  })
  
  // Check if we should show team drill-in
  const teamParam = searchParams.get('team')
  const showTeamDrillIn = !!teamParam
  const [channelFilter, setChannelFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-outreach-channel', 'All')
    }
    return 'All'
  })
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-outreach-status', 'All')
    }
    return 'All'
  })
  const [teamFilter, setTeamFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-outreach-team', 'All')
    }
    return 'All'
  })
  const [purposeFilter, setPurposeFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-outreach-purpose', 'All')
    }
    return 'All'
  })
  const [memberTypeFilter, setMemberTypeFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-outreach-memberType', 'All')
    }
    return 'All'
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedOutreach, setSelectedOutreach] = useState<Outreach | null>(null)
  const [showDetailsSheet, setShowDetailsSheet] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [memberRiskFilter, setMemberRiskFilter] = useState('All')
  const [memberVendorFilter, setMemberVendorFilter] = useState('All')
  const [outreachForm, setOutreachForm] = useState({
    channel: '',
    status: '',
    topic: '',
    note: ''
  })

  // Persist filters to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-outreach-search', searchQuery)
    }
  }, [searchQuery])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-outreach-channel', channelFilter)
    }
  }, [channelFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-outreach-status', statusFilter)
    }
  }, [statusFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-outreach-team', teamFilter)
    }
  }, [teamFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-outreach-purpose', purposeFilter)
    }
  }, [purposeFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-outreach-memberType', memberTypeFilter)
    }
  }, [memberTypeFilter])

  // Apply URL-based filters on component mount (override localStorage if present)
  useEffect(() => {
    const memberId = searchParams.get('member')
    const window = searchParams.get('window')
    const team = searchParams.get('team')
    const purpose = searchParams.get('purpose')
    const channel = searchParams.get('channel')
    const memberType = searchParams.get('memberType')

    // Only set search query if memberId is explicitly in URL (for navigation from Members tab)
    // If memberId is removed from URL, clear the search query and localStorage
    if (memberId) {
      setSearchQuery(memberId)
    } else {
      // Clear search query if member param is not in URL
      // This prevents member selection from Members tab carrying over
      setSearchQuery('')
      // Also clear from localStorage to prevent it from being restored
      if (typeof window !== 'undefined') {
        saveLocal('flt-outreach-search', '')
      }
    }
    if (window === 'last30d') {
      // This would filter to last 30 days - handled in filteredOutreach
    }
    if (team) {
      setTeamFilter(team)
    }
    if (purpose) {
      setPurposeFilter(purpose)
    }
    if (channel) {
      setChannelFilter(channel)
    }
    if (memberType) {
      setMemberTypeFilter(memberType)
    }
  }, [searchParams])

  const filteredOutreach = outreach.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.memberId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesChannel = channelFilter === 'All' || entry.channel === channelFilter
    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter
    const matchesTeam = teamFilter === 'All' || entry.team === teamFilter
    const matchesPurpose = purposeFilter === 'All' || entry.purpose === purposeFilter
    
    // Filter by member type
    const matchesMemberType = memberTypeFilter === 'All' || (() => {
      const member = members.find(m => m.id === entry.memberId)
      return member && member.memberType === memberTypeFilter
    })()
    
    // Filter by time window if specified
    const matchesTimeWindow = !searchParams.get('window') || (() => {
      if (searchParams.get('window') === 'last30d') {
        const touchDate = new Date(entry.timestamp)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 30)
        return touchDate >= cutoffDate
      }
      return true
    })()
    
    return matchesSearch && matchesChannel && matchesStatus && matchesTeam && matchesPurpose && matchesMemberType && matchesTimeWindow
  })

  const channelData = getOutreachByChannel(outreach)
  const totalOutreach = outreach.length
  const completedOutreach = outreach.filter(o => o.status === 'Completed').length
  const completionRate = totalOutreach > 0 ? Math.round((completedOutreach / totalOutreach) * 100) : 0
  const topChannel = channelData.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  )
  const { top, bottom } = React.useMemo(() => getTopAndBottomChannels(outreach), [outreach])
  
  // Calculate touchpoint metrics
  const avgTouchpoints30d = touchesPerMember(outreach, members, 30)
  const avgTouchpoints60d = touchesPerMember(outreach, members, 60)
  const momTouchpoints = monthOverMonth(avgTouchpoints30d, avgTouchpoints60d)
  
  const hraTouches30d = getHraOutreach(outreach).filter(o => {
    const touchDate = new Date(o.timestamp)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    return touchDate >= cutoffDate
  }).length
  
  const hraTouches60d = getHraOutreach(outreach).filter(o => {
    const touchDate = new Date(o.timestamp)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 60)
    return touchDate >= cutoffDate
  }).length
  
  const momHraTouches = monthOverMonth(hraTouches30d, hraTouches60d)

  // Filter members for selection
  const filteredMembers = React.useMemo(() => {
    let filtered = members.filter(member => 
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
    
    if (memberRiskFilter !== 'All') {
      filtered = filtered.filter(member => {
        switch (memberRiskFilter) {
          case 'Low': return member.risk <= 40
          case 'Medium': return member.risk > 40 && member.risk <= 70
          case 'High': return member.risk > 70
          default: return true
        }
      })
    }
    
    if (memberVendorFilter !== 'All') {
      filtered = filtered.filter(member => member.vendor === memberVendorFilter)
    }
    
    return filtered
  }, [members, memberSearchQuery, memberRiskFilter, memberVendorFilter])

  const handleAddOutreach = () => {
    if (selectedMembers.length > 0 && outreachForm.channel && outreachForm.status && outreachForm.topic) {
      // Create outreach entries for all selected members
      selectedMembers.forEach(memberId => {
        const member = members.find(m => m.id === memberId)
        if (member) {
          onAddOutreach({
            ...outreachForm,
            memberId: member.id,
            memberName: member.name
          })
        }
      })
      
      setShowAddDialog(false)
      setSelectedMembers([])
      setMemberSearchQuery('')
      setMemberRiskFilter('All')
      setMemberVendorFilter('All')
      setOutreachForm({
        channel: '',
        status: '',
        topic: '',
        note: ''
      })
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const selectAllMembers = () => {
    setSelectedMembers(filteredMembers.map(m => m.id))
  }

  const clearSelection = () => {
    setSelectedMembers([])
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Call': return Phone
      case 'SMS': return MessageSquare
      case 'Email': return Mail
      case 'Portal': return Monitor
      default: return MessageSquare
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default'
      case 'In-Progress': return 'secondary'
      case 'Failed': return 'destructive'
      default: return 'outline'
    }
  }

  const handleOutreachClick = (entry: Outreach) => {
    setSelectedOutreach(entry)
    setShowDetailsSheet(true)
  }

  // If team query param exists, show drill-in view
  if (showTeamDrillIn) {
    return <TeamDrillIn rows={outreach} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle 
          title="Outreach Management" 
          subtitle="Track and manage member outreach campaigns across all channels"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Outreach
          </Button>
          <Button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Import Outreach
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          title="Total Outreach"
          value={totalOutreach}
          subtitle="All channels"
        />
        <Stat
          title="Avg Touchpoints / Member (30d)"
          value={avgTouchpoints30d}
          subtitle={`MoM ${momTouchpoints.direction === 'up' ? '+' : momTouchpoints.direction === 'down' ? '-' : ''}${momTouchpoints.deltaPct}%`}
          trend={{ value: momTouchpoints.deltaPct, isPositive: momTouchpoints.direction === 'up' }}
          onClick={() => onNavigateToOutreach?.({ filter: 'last30d' })}
        />
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Top Channel</p>
                <p className="text-lg font-medium">{top}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bottom Channel</p>
                <p className="text-lg font-medium">{bottom}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Stat
          title="HRA Touches (30d)"
          value={hraTouches30d}
          subtitle={`MoM ${momHraTouches.direction === 'up' ? '+' : momHraTouches.direction === 'down' ? '-' : ''}${momHraTouches.deltaPct}%`}
          trend={{ value: momHraTouches.deltaPct, isPositive: momHraTouches.direction === 'up' }}
          onClick={() => onNavigateToOutreach?.({ filter: 'hra' })}
        />
      </div>

      {/* Teams Filter - Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filter by Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Internal Teams */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Internal Teams</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={teamFilter === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTeamFilter('All')}
                className="px-4 py-2"
              >
                All Teams
              </Button>
              {TEAMS_EXPANDED.filter(t => t.type === 'internal').map(team => {
                const count = outreach.filter(o => o.team === team.name || o.teamId === team.id).length
                const isSelected = teamFilter === team.name || teamFilter === team.id
                return (
                  <Button
                    key={team.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTeamFilter(team.name)
                      // Optionally navigate to drill-in view
                      // router.push(`?tab=outreach&team=${team.id}&tf=90d`)
                    }}
                    className="px-4 py-2"
                  >
                    {team.name}
                    <span className="ml-2 text-xs opacity-70">
                      ({count})
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Vendor Partners */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Vendor Partners</h3>
            <div className="flex flex-wrap gap-2">
              {TEAMS_EXPANDED.filter(t => t.type === 'vendor').map(team => {
                const count = outreach.filter(o => o.team === team.name || o.teamId === team.id).length
                const isSelected = teamFilter === team.name || teamFilter === team.id
                return (
                  <Button
                    key={team.id}
                    variant={isSelected ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setTeamFilter(team.name)
                      // Optionally navigate to drill-in view
                      // router.push(`?tab=outreach&team=${team.id}&tf=90d`)
                    }}
                    className="px-4 py-2"
                  >
                    {team.name}
                    <span className="ml-2 text-xs opacity-70">
                      ({count})
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Outreach Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search outreach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Channels</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Portal">Portal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                {Object.entries(STATUS_DEFINITIONS).map(([status, definition]) => (
                  <SelectItem key={status} value={status} title={definition}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Teams</SelectItem>
                <SelectGroup>
                  <SelectLabel>Internal Teams</SelectLabel>
                  {TEAMS_EXPANDED.filter(t => t.type === 'internal').map(t => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Vendor Partners</SelectLabel>
                  {TEAMS_EXPANDED.filter(t => t.type === 'vendor').map(t => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Purposes</SelectItem>
                {[...PURPOSE_CODES].sort((a, b) => a.code.localeCompare(b.code)).map((p) => {
                  const purposeValue = CODE_TO_PURPOSE[p.code] || p.code
                  return (
                    <SelectItem key={p.code} value={purposeValue} title={p.label}>
                      {p.code}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by member type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-500">
              {filteredOutreach.length} results
            </div>
          </div>

          {/* Outreach List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredOutreach.map((entry) => {
              const ChannelIcon = getChannelIcon(entry.channel)
              return (
                <div 
                  key={entry.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  role="article"
                  aria-label={`Outreach entry: ${entry.topic}`}
                  onClick={() => handleOutreachClick(entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ChannelIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{entry.topic}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant={getStatusVariant(entry.status)} className="text-xs cursor-help">
                                  {entry.status}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{STATUS_DEFINITIONS[entry.status] || entry.status}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.note}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{entry.memberName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                          </div>
                          <span>Agent: {entry.agent}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.team}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {entry.purpose}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.channel}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredOutreach.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No outreach found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search criteria or add new outreach entries.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Outreach Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Outreach</DialogTitle>
            <DialogDescription>
              Select a member and create a new outreach entry for engagement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Member Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Select Members</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {selectedMembers.length} selected
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllMembers}
                    disabled={filteredMembers.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearSelection}
                    disabled={selectedMembers.length === 0}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              {/* Member Search and Filters */}
              <div className="space-y-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search members by name, ID, or email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Abrasion Risk Level</label>
                    <Select value={memberRiskFilter} onValueChange={setMemberRiskFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Abrasion Risk Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Abrasion Risk Levels</SelectItem>
                        <SelectItem value="Low">Low Abrasion Risk (0-40)</SelectItem>
                        <SelectItem value="Medium">Medium Abrasion Risk (41-70)</SelectItem>
                        <SelectItem value="High">High Abrasion Risk (71-100)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Healthcare Organization</label>
                    <Select value={memberVendorFilter} onValueChange={setMemberVendorFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Companies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Companies</SelectItem>
                        {Array.from(new Set(members.map(m => m.vendor))).map(vendor => (
                          <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Member List */}
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-3">
                    {filteredMembers.length} members found • {selectedMembers.length} selected
                  </p>
                  <div className="space-y-2">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMembers.includes(member.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleMemberSelection(member.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedMembers.includes(member.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedMembers.includes(member.id) && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-500">{member.id} • {member.plan}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={member.risk <= 40 ? 'secondary' : member.risk <= 70 ? 'default' : 'destructive'}>
                              {member.risk}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {member.vendor}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Outreach Details */}
            {selectedMembers.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Outreach Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Channel</label>
                    <Select value={outreachForm.channel} onValueChange={(value) => setOutreachForm(prev => ({ ...prev, channel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
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
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
                    <Select value={outreachForm.status} onValueChange={(value) => setOutreachForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="In-Progress">In-Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Topic</label>
                    <Input 
                      value={outreachForm.topic}
                      onChange={(e) => setOutreachForm(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Enter outreach topic" 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Note</label>
                    <Input 
                      value={outreachForm.note}
                      onChange={(e) => setOutreachForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Enter additional notes" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddOutreach}
              disabled={selectedMembers.length === 0 || !outreachForm.channel || !outreachForm.status || !outreachForm.topic}
            >
              Add Outreach {selectedMembers.length > 1 ? `(${selectedMembers.length} members)` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outreach Details Sheet */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Outreach Details</SheetTitle>
            <SheetDescription>
              Detailed information about the selected outreach entry
            </SheetDescription>
          </SheetHeader>
          {selectedOutreach && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Topic</h3>
                <p className="text-sm text-gray-600">{selectedOutreach.topic}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Member</h3>
                <p className="text-sm text-gray-600">{selectedOutreach.memberName} ({selectedOutreach.memberId})</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Channel:</span>
                    <Badge variant="outline" className="ml-2">{selectedOutreach.channel}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={getStatusVariant(selectedOutreach.status)} className="ml-2 cursor-help">
                            {selectedOutreach.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{STATUS_DEFINITIONS[selectedOutreach.status] || selectedOutreach.status}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div>
                    <span className="text-gray-500">Team:</span>
                    <Badge variant="outline" className="ml-2">{selectedOutreach.team}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Purpose:</span>
                    <Badge variant="outline" className="ml-2">{selectedOutreach.purpose}</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Agent & Timing</h3>
                <div className="text-sm text-gray-600">
                  <p>Agent: {selectedOutreach.agent}</p>
                  <p>Date: {new Date(selectedOutreach.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedOutreach.note}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Audit Information</h3>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>Outreach ID: {selectedOutreach.id}</p>
                  <p>Created: {new Date(selectedOutreach.timestamp).toISOString()}</p>
                  <p>Last Modified: {new Date(selectedOutreach.timestamp).toISOString()}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Import Outreach Modal */}
      <ImportOutreachModal open={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  )
}
