'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Clock,
  Heart,
  Stethoscope,
  Download,
  Search,
  Filter,
  X,
  Phone,
  MessageSquare,
  Mail,
  Monitor,
  Send,
  CheckSquare,
  Square,
  Car,
  Zap,
  Brain
} from 'lucide-react'
import type { Member, Outreach } from '@/lib/mock'
import { generateAllCohorts, type Cohort, type CohortMember } from '@/lib/cohorts'
import { calculateMemberSignals } from '@/lib/propensity'
import { exportToCSV } from '@/lib/csv'
import { useToast } from '@/hooks/use-toast'

interface CohortsDashboardProps {
  members: Member[]
  outreach: Outreach[]
  onAddOutreach: (data: any) => void
}

const cohortIcons = {
  'a1c-nudge': Stethoscope,
  'mammogram-nudge': Heart,
  'awv-nudge': Users,
  'negative-sentiment': AlertTriangle,
  'fatigue-risk': TrendingDown,
  'unreached': Clock,
  'food-support': Heart,
  'transport-support': Car,
  'utilities-support': Zap,
  'bh-support': Brain,
  'nudge-receptive-awv': Users,
  'negative-sentiment-sdoh': AlertTriangle
}

const cohortColors = {
  'a1c-nudge': 'bg-green-100 text-green-800 border-green-200',
  'mammogram-nudge': 'bg-pink-100 text-pink-800 border-pink-200',
  'awv-nudge': 'bg-blue-100 text-blue-800 border-blue-200',
  'negative-sentiment': 'bg-red-100 text-red-800 border-red-200',
  'fatigue-risk': 'bg-orange-100 text-orange-800 border-orange-200',
  'unreached': 'bg-gray-100 text-gray-800 border-gray-200',
  'food-support': 'bg-amber-100 text-amber-800 border-amber-200',
  'transport-support': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'utilities-support': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bh-support': 'bg-purple-100 text-purple-800 border-purple-200',
  'nudge-receptive-awv': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'negative-sentiment-sdoh': 'bg-rose-100 text-rose-800 border-rose-200'
}

export function CohortsDashboard({ members, outreach, onAddOutreach }: CohortsDashboardProps) {
  const { toast } = useToast()
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [teamFilter, setTeamFilter] = useState<string>('All')
  const [riskFilter, setRiskFilter] = useState<string>('All')
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [bulkOutreachDialog, setBulkOutreachDialog] = useState(false)
  const [bulkOutreachData, setBulkOutreachData] = useState({
    channel: 'SMS',
    purpose: 'AWV',
    topic: '',
    note: ''
  })

  const cohorts = useMemo(() => {
    return generateAllCohorts(members, outreach)
  }, [members, outreach])

  const filteredCohortMembers = useMemo(() => {
    if (!selectedCohort) return []
    
    let filtered = selectedCohort.members
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member => 
        member.member.name.toLowerCase().includes(query) ||
        member.member.id.toLowerCase().includes(query) ||
        member.member.vendor.toLowerCase().includes(query)
      )
    }
    
    if (teamFilter !== 'All') {
      // Filter by team based on recent outreach
      filtered = filtered.filter(member => {
        const recentOutreach = outreach
          .filter(o => o.memberId === member.memberId)
          .slice(0, 5) // Last 5 outreach entries
        return recentOutreach.some(o => o.team === teamFilter)
      })
    }
    
    if (riskFilter !== 'All') {
      filtered = filtered.filter(member => {
        switch (riskFilter) {
          case 'Low': return member.signals.nudgePropensity <= 40
          case 'Medium': return member.signals.nudgePropensity > 40 && member.signals.nudgePropensity <= 70
          case 'High': return member.signals.nudgePropensity > 70
          default: return true
        }
      })
    }
    
    return filtered
  }, [selectedCohort, searchQuery, teamFilter, riskFilter, outreach])

  const handleExportCSV = () => {
    if (!selectedCohort || filteredCohortMembers.length === 0) return
    
    const csvData = filteredCohortMembers.map(member => ({
      'Member ID': member.member.id,
      'Name': member.member.name,
      'Plan': member.member.plan,
      'Vendor': member.member.vendor,
      'Conditions': member.member.conditions.join(', '),
      'Nudge Propensity': member.signals.nudgePropensity,
      'Negative Sentiment Risk': member.signals.negSentimentRisk,
      'Channel Preference': member.signals.channelPreference,
      'Last Touch': member.metadata?.lastTouch || 'N/A'
    }))
    
    exportToCSV(csvData, `${selectedCohort.name.replace(/\s+/g, '_')}_cohort.csv`)
  }

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredCohortMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(filteredCohortMembers.map(m => m.memberId)))
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
      const member = filteredCohortMembers.find(m => m.memberId === memberId)
      if (member) {
        onAddOutreach({
          memberId: member.member.id,
          memberName: member.member.name,
          channel: bulkOutreachData.channel,
          status: 'Planned',
          topic: bulkOutreachData.topic || `${bulkOutreachData.purpose} Outreach`,
          note: bulkOutreachData.note || `Bulk outreach for ${selectedCohort?.name} cohort`,
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
      description: `Successfully created outreach for ${selectedMembers.size} members in ${selectedCohort?.name} cohort`,
    })
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Call': return Phone
      case 'SMS': return MessageSquare
      case 'Email': return Mail
      case 'Portal': return Monitor
      default: return Send
    }
  }

  const getLastTouch = (memberId: string) => {
    const memberOutreach = outreach
      .filter(o => o.memberId === memberId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    if (memberOutreach.length === 0) return 'None'
    
    const lastTouch = memberOutreach[0]
    const daysDiff = Math.floor((Date.now() - new Date(lastTouch.timestamp).getTime()) / (24 * 60 * 60 * 1000))
    
    if (daysDiff === 0) return 'Today'
    if (daysDiff === 1) return 'Yesterday'
    if (daysDiff < 7) return `${daysDiff} days ago`
    return `${daysDiff} days ago`
  }

  return (
    <div className="space-y-6">
      {/* Cohort Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cohorts.map((cohort) => {
          const Icon = cohortIcons[cohort.id as keyof typeof cohortIcons]
          const colorClass = cohortColors[cohort.id as keyof typeof cohortColors]
          
          return (
            <Card key={cohort.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span className="text-lg">{cohort.name}</span>
                  </div>
                  <Badge className={colorClass}>
                    {cohort.count}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {cohort.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Recommended Action:</span>
                    <span className="font-medium">{cohort.recommendedAction}</span>
                  </div>
                  
                  {cohort.sparklineData && (
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{
                          width: `${Math.max(20, (cohort.sparklineData[6] / Math.max(...cohort.sparklineData)) * 100)}%`
                        }}></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {cohort.sparklineData[6]} this week
                      </span>
                    </div>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedCohort(cohort)}
                      >
                        View Members ({cohort.count})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Icon className="h-5 w-5" />
                          <span>{cohort.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                          {cohort.description} • {filteredCohortMembers.length} members
                        </DialogDescription>
                      </DialogHeader>
                      
                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        <Select value={teamFilter} onValueChange={setTeamFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by Team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Teams</SelectItem>
                            <SelectItem value="Risk Adjustment">Risk Adjustment</SelectItem>
                            <SelectItem value="Quality">Quality</SelectItem>
                            <SelectItem value="Member Services">Member Services</SelectItem>
                            <SelectItem value="Case Management">Case Management</SelectItem>
                            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by Risk" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Risk Levels</SelectItem>
                            <SelectItem value="Low">Low Risk (0-40)</SelectItem>
                            <SelectItem value="Medium">Medium Risk (41-70)</SelectItem>
                            <SelectItem value="High">High Risk (71-100)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            onClick={handleSelectAll} 
                            variant="outline" 
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            {selectedMembers.size === filteredCohortMembers.length ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            <span>
                              {selectedMembers.size === filteredCohortMembers.length ? 'Deselect All' : 'Select All'}
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
                        
                        <Button onClick={handleExportCSV} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>
                      
                      {/* Members Table */}
                      <div className="overflow-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-900 w-12">
                                <Checkbox 
                                  checked={selectedMembers.size === filteredCohortMembers.length && filteredCohortMembers.length > 0}
                                  onCheckedChange={handleSelectAll}
                                />
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Member</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Plan/Vendor</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Conditions</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Last Touch</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Channel</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Nudge</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-900">Sentiment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredCohortMembers.map((member) => (
                              <tr key={member.memberId} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <Checkbox 
                                    checked={selectedMembers.has(member.memberId)}
                                    onCheckedChange={() => handleSelectMember(member.memberId)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <div>
                                    <div className="font-medium text-gray-900">{member.member.name}</div>
                                    <div className="text-gray-500 text-xs">{member.member.id}</div>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div>
                                    <div className="text-gray-900">{member.member.plan}</div>
                                    <div className="text-gray-500 text-xs">{member.member.vendor}</div>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {member.member.conditions.slice(0, 2).map((condition) => (
                                      <Badge key={condition} variant="secondary" className="text-xs">
                                        {condition}
                                      </Badge>
                                    ))}
                                    {member.member.conditions.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{member.member.conditions.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-gray-900">
                                  {getLastTouch(member.memberId)}
                                </td>
                                <td className="px-3 py-2">
                                  <Badge variant="outline" className="text-xs">
                                    {member.signals.channelPreference}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-500 rounded-full" 
                                        style={{ width: `${member.signals.nudgePropensity}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{member.signals.nudgePropensity}%</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-red-500 rounded-full" 
                                        style={{ width: `${member.signals.negSentimentRisk}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{member.signals.negSentimentRisk}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
