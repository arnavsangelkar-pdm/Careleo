'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  Phone, 
  MessageSquare, 
  Mail, 
  Monitor,
  Users,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react'
import type { Member, Outreach } from '@/lib/mock'
import { TEAMS, PURPOSES, CHANNELS, STATUS } from '@/lib/constants'
import { calculateMemberSignals } from '@/lib/propensity'

interface OutreachTimelineProps {
  member: Member
  outreach: Outreach[]
}

const channelIcons = {
  Call: Phone,
  SMS: MessageSquare,
  Email: Mail,
  Portal: Monitor
}

const statusColors = {
  Planned: 'bg-blue-100 text-blue-800',
  'In-Progress': 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Failed: 'bg-red-100 text-red-800'
}

const teamColors: Record<string, string> = {
  'Care Coordination': 'bg-purple-100 text-purple-800',
  'Eligibility & Benefits': 'bg-blue-100 text-blue-800',
  'Risk Adjustment': 'bg-purple-100 text-purple-800',
  'Quality': 'bg-blue-100 text-blue-800',
  'Member Services': 'bg-green-100 text-green-800',
  'Case Management': 'bg-orange-100 text-orange-800',
  'Pharmacy': 'bg-pink-100 text-pink-800',
  'Community Partnerships': 'bg-teal-100 text-teal-800',
  'Unknown': 'bg-gray-100 text-gray-800'
}

export function OutreachTimeline({ member, outreach }: OutreachTimelineProps) {
  const [teamFilter, setTeamFilter] = useState<string>('All')
  const [channelFilter, setChannelFilter] = useState<string>('All')
  const [purposeFilter, setPurposeFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const memberOutreach = useMemo(() => {
    return outreach.filter(o => o.memberId === member.id)
  }, [outreach, member.id])

  const filteredOutreach = useMemo(() => {
    return memberOutreach.filter(entry => {
      if (teamFilter !== 'All' && entry.team !== teamFilter) return false
      if (channelFilter !== 'All' && entry.channel !== channelFilter) return false
      if (purposeFilter !== 'All' && entry.purpose !== purposeFilter) return false
      if (statusFilter !== 'All' && entry.status !== statusFilter) return false
      return true
    })
  }, [memberOutreach, teamFilter, channelFilter, purposeFilter, statusFilter])

  const groupedOutreach = useMemo(() => {
    const groups: Record<string, Outreach[]> = {}
    
    filteredOutreach.forEach(entry => {
      const date = new Date(entry.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
    })
    
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [filteredOutreach])

  const memberSignals = useMemo(() => {
    return calculateMemberSignals(member, outreach)
  }, [member, outreach])

  const stats = useMemo(() => {
    const last30Days = memberOutreach.filter(o => {
      const daysDiff = (Date.now() - new Date(o.timestamp).getTime()) / (24 * 60 * 60 * 1000)
      return daysDiff <= 30
    })
    
    const completed = last30Days.filter(o => o.status === 'Completed').length
    const completionRate = last30Days.length > 0 ? (completed / last30Days.length) * 100 : 0
    
    const channelCounts: Record<string, number> = {}
    last30Days.forEach(o => {
      channelCounts[o.channel] = (channelCounts[o.channel] || 0) + 1
    })
    
    const topChannel = Object.entries(channelCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    
    const lastTouch = memberOutreach[0]?.timestamp
    
    return {
      totalTouches: last30Days.length,
      completionRate: Math.round(completionRate),
      topChannel,
      lastTouch: lastTouch ? new Date(lastTouch).toLocaleDateString() : 'None'
    }
  }, [memberOutreach])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Member Signals Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Nudge Propensity</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={memberSignals.nudgePropensity} className="flex-1" />
              <span className="text-sm font-semibold">{memberSignals.nudgePropensity}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Negative Sentiment Risk</span>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={memberSignals.negSentimentRisk} className="flex-1" />
              <span className="text-sm font-semibold">{memberSignals.negSentimentRisk}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Channel Preference</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <Badge variant="outline" className="text-sm">
              {memberSignals.channelPreference}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalTouches}</div>
          <div className="text-sm text-gray-500">Touches (30d)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
          <div className="text-sm text-gray-500">Completion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.topChannel}</div>
          <div className="text-sm text-gray-500">Top Channel</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.lastTouch}</div>
          <div className="text-sm text-gray-500">Last Touch</div>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Outreach Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Team</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Teams</SelectItem>
                  {TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Channel</label>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Channels</SelectItem>
                  {CHANNELS.map(channel => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Purpose</label>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Purposes</SelectItem>
                  {PURPOSES.map(purpose => (
                    <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {STATUS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline Entries */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {groupedOutreach.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No outreach entries found for the selected filters.
              </div>
            ) : (
              groupedOutreach.map(([date, entries]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-sm font-medium text-gray-600 bg-white px-3">
                      {new Date(date).toLocaleDateString([], { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
                  <div className="space-y-3">
                    {entries.map((entry) => {
                      const ChannelIcon = channelIcons[entry.channel]
                      return (
                        <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg max-w-full overflow-hidden">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                              <ChannelIcon className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-1 mb-2">
                              <Badge className={`${statusColors[entry.status]} text-xs`}>
                                {entry.status}
                              </Badge>
                              <Badge className={`${teamColors[entry.team || 'Unknown']} text-xs`}>
                                {entry.team || 'Unknown'}
                              </Badge>
                              <Badge 
                                variant={entry.purpose.startsWith('SDOH') ? 'secondary' : 'outline'} 
                                className={`text-xs ${entry.purpose.startsWith('SDOH') ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}`}
                              >
                                {entry.purpose}
                              </Badge>
                            </div>
                            
                            <h4 className="text-sm font-medium text-gray-900 mb-1 break-words">
                              {entry.topic}
                            </h4>
                            
                            <p className="text-sm text-gray-600 mb-2 break-words line-clamp-2">
                              {entry.note}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-500">
                              <span className="truncate">Agent: {entry.agent}</span>
                              <span className="flex-shrink-0">{formatTimestamp(entry.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
