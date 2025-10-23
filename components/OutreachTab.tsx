'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { MockQuickAdd } from './MockQuickAdd'
import { 
  filterOutreachByChannel, 
  filterOutreachByStatus,
  getOutreachByChannel,
  type Outreach
} from '@/lib/mock'
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
  Plus
} from 'lucide-react'

interface OutreachTabProps {
  outreach: Outreach[]
  members: any[]
  onAddOutreach: (data: any) => void
}

export function OutreachTab({ outreach, members, onAddOutreach }: OutreachTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAddDialog, setShowAddDialog] = useState(false)
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

  const filteredOutreach = outreach.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.agent.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesChannel = channelFilter === 'All' || entry.channel === channelFilter
    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter
    
    return matchesSearch && matchesChannel && matchesStatus
  })

  const channelData = getOutreachByChannel(outreach)
  const totalOutreach = outreach.length
  const completedOutreach = outreach.filter(o => o.status === 'Completed').length
  const completionRate = totalOutreach > 0 ? Math.round((completedOutreach / totalOutreach) * 100) : 0
  const topChannel = channelData.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle 
          title="Outreach Management" 
          subtitle="Track and manage member outreach campaigns across all channels"
        />
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Outreach
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          title="Total Outreach"
          value={totalOutreach}
          subtitle="All channels"
        />
        <Stat
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle="Success rate"
          trend={{ value: 8, isPositive: true }}
        />
        <Stat
          title="Top Channel"
          value={topChannel.channel}
          subtitle={`${topChannel.count} interactions`}
        />
        <Stat
          title="This Week"
          value={outreach.filter(o => {
            const date = new Date(o.timestamp)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return date > weekAgo
          }).length}
          subtitle="Recent activity"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Outreach Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In-Progress">In-Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-500">
              {filteredOutreach.length} results
            </div>
          </div>

          {/* Outreach List */}
          <div className="space-y-3">
            {filteredOutreach.slice(0, 20).map((entry) => {
              const ChannelIcon = getChannelIcon(entry.channel)
              return (
                <div 
                  key={entry.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  role="article"
                  aria-label={`Outreach entry: ${entry.topic}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ChannelIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{entry.topic}</h3>
                          <Badge variant={getStatusVariant(entry.status)} className="text-xs">
                            {entry.status}
                          </Badge>
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
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Risk Level</label>
                    <Select value={memberRiskFilter} onValueChange={setMemberRiskFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Risk Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Risk Levels</SelectItem>
                        <SelectItem value="Low">Low Risk (0-40)</SelectItem>
                        <SelectItem value="Medium">Medium Risk (41-70)</SelectItem>
                        <SelectItem value="High">High Risk (71-100)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Insurance Company</label>
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
    </div>
  )
}
