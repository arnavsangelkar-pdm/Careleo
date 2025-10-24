'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { MockActionButton } from './MockActionButton'
import { MockQuickAdd } from './MockQuickAdd'
import { OutreachTimeline } from './member/OutreachTimeline'
import { 
  searchMembers, 
  getRiskBadgeVariant, 
  getRiskLabel,
  type Member,
  type Outreach
} from '@/lib/mock'
import { 
  Search, 
  Phone, 
  MessageSquare, 
  Mail, 
  Calendar,
  User,
  Shield,
  Activity,
  Filter
} from 'lucide-react'

interface MembersTabProps {
  members: Member[]
  outreach: Outreach[]
  selectedMember: Member | null
  onSelectMember: (member: Member) => void
  onAddOutreach: (data: any) => void
  onMemberAction: (action: string, member: Member) => void
}

export function MembersTab({
  members,
  outreach,
  selectedMember,
  onSelectMember,
  onAddOutreach,
  onMemberAction
}: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [vendorFilter, setVendorFilter] = useState('All')
  const [conditionFilter, setConditionFilter] = useState('All')
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')

  const filteredMembers = React.useMemo(() => {
    let filtered = searchMembers(members, searchQuery)
    
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
    
    if (vendorFilter !== 'All') {
      filtered = filtered.filter(member => member.vendor === vendorFilter)
    }
    
    if (conditionFilter !== 'All') {
      filtered = filtered.filter(member => 
        member.conditions.some(condition => 
          condition.toLowerCase().includes(conditionFilter.toLowerCase())
        )
      )
    }
    
    return filtered
  }, [members, searchQuery, riskFilter, vendorFilter, conditionFilter])
  const selectedMemberOutreach = selectedMember 
    ? outreach.filter(o => o.memberId === selectedMember.id).slice(0, 5)
    : []

  const handleActionClick = (action: string) => {
    if (selectedMember) {
      setSelectedAction(action)
      setActionDialogOpen(true)
    }
  }

  const handleActionConfirm = () => {
    if (selectedMember) {
      onMemberAction(selectedAction, selectedMember)
      setActionDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Member Management" 
        subtitle="Search and manage member profiles with risk assessment and outreach tracking"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat
          title="Total Members"
          value={members.length}
          subtitle="Active profiles"
        />
        <Stat
          title="High Risk"
          value={members.filter(m => m.risk > 70).length}
          subtitle="Requires attention"
          trend={{ value: 12, isPositive: false }}
        />
        <Stat
          title="Recent Outreach"
          value={outreach.filter(o => {
            const date = new Date(o.timestamp)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return date > weekAgo
          }).length}
          subtitle="Last 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Member Directory</span>
                <span className="text-sm font-normal text-gray-500">
                  {filteredMembers.length} members
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, email, plan, or vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Risk Level</label>
                    <Select value={riskFilter} onValueChange={setRiskFilter}>
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
                    <Select value={vendorFilter} onValueChange={setVendorFilter}>
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
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Medical Condition</label>
                    <Select value={conditionFilter} onValueChange={setConditionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Conditions</SelectItem>
                        {Array.from(new Set(members.flatMap(m => m.conditions))).map(condition => (
                          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMember?.id === member.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onSelectMember(member)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectMember(member)
                      }
                    }}
                    aria-label={`Select member ${member.name}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.id} • {member.plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRiskBadgeVariant(member.risk)}>
                          {member.risk}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {member.vendor}
                        </Badge>
                      </div>
                    </div>
                    {member.conditions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {member.conditions.slice(0, 3).map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {member.conditions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.conditions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Profile */}
        <div className="lg:col-span-1">
          {selectedMember ? (
            <div className="space-y-6 max-w-full overflow-hidden">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Member Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMember.id}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-sm">{selectedMember.dob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plan</label>
                      <p className="text-sm">{selectedMember.plan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vendor</label>
                      <p className="text-sm">{selectedMember.vendor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact</label>
                      <p className="text-sm">{selectedMember.phone}</p>
                      <p className="text-sm">{selectedMember.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Risk Assessment</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getRiskBadgeVariant(selectedMember.risk)}>
                        {selectedMember.risk}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {getRiskLabel(selectedMember.risk)}
                      </span>
                    </div>
                  </div>

                  {selectedMember.conditions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Conditions</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMember.conditions.map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <MockActionButton
                    icon={Phone}
                    label="Log Call"
                    onClick={() => handleActionClick('LOG_CALL')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                  <MockActionButton
                    icon={MessageSquare}
                    label="Send SMS"
                    onClick={() => handleActionClick('SEND_SMS')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                  <MockActionButton
                    icon={Mail}
                    label="Send Email"
                    onClick={() => handleActionClick('SEND_EMAIL')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                  <MockQuickAdd
                    type="outreach"
                    onAdd={onAddOutreach}
                    triggerLabel="Add Outreach"
                    className="w-full"
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Outreach Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <OutreachTimeline member={selectedMember} outreach={outreach} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Member</h3>
                <p className="text-sm text-gray-500">
                  Choose a member from the directory to view their profile and manage outreach.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedAction.replace('_', ' ').toLowerCase()} for {selectedMember?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActionConfirm}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
