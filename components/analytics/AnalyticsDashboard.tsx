'use client'

import React, { useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SectionTitle } from '../SectionTitle'
import { 
  timeWindowRange, 
  subsetOutreach, 
  seriesTouchesOverTime, 
  countsByTeam, 
  countsByPurpose, 
  channelSuccessRate, 
  touchesPerMemberHistogram,
  getTimeWindowLabel,
  getWeekNumber,
  type AnalyticsFilters
} from '@/lib/analytics'
import { TEAMS, PURPOSES, CHANNELS, MEMBER_TYPES, PURPOSE_CODES, CODE_TO_PURPOSE } from '@/lib/constants'
import type { Outreach, Member } from '@/lib/mock'
import { topAndBottomChannel, countByChannel, seriesFromCounts } from '@/lib/selectors.analytics'
import { ChannelDistribution } from '@/components/charts/ChannelDistribution'
import { 
  RotateCcw,
  Info
} from 'lucide-react'

// Import recharts components directly
import {
  LineChart,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Line,
  Bar,
  Cell,
  Pie
} from 'recharts'

interface AnalyticsDashboardProps {
  outreach: Outreach[]
  members: Member[]
}

export function AnalyticsDashboard({ outreach, members }: AnalyticsDashboardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Parse URL parameters for filters
  const filters: AnalyticsFilters = {
    window: (searchParams.get('window') as AnalyticsFilters['window']) || 'last30d',
    memberType: (searchParams.get('memberType') as AnalyticsFilters['memberType']) || 'Member',
    team: searchParams.get('team') || undefined,
    purpose: searchParams.get('purpose') || undefined,
    channel: searchParams.get('channel') || undefined
  }

  // Update URL with new filter values
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'Both' && value !== 'All') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  // Reset all filters
  const resetFilters = useCallback(() => {
    router.replace('?', { scroll: false })
  }, [router])

  // Get time window range
  const timeRange = timeWindowRange(filters.window)

  // Filter outreach data based on current filters
  const filteredOutreach = useMemo(() => {
    const filtered = subsetOutreach(outreach, {
      from: timeRange.from,
      to: timeRange.to,
      team: filters.team,
      purpose: filters.purpose,
      channel: filters.channel,
      memberType: filters.memberType
    }, members)
    return filtered
  }, [outreach, timeRange, filters, members])

  // Generate chart data
  const touchesOverTimeData = useMemo(() => {
    const data = seriesTouchesOverTime(outreach, 12)
    if (data.length === 0) {
      return [
        { weekLabel: 'Week 1', hra: 1, all: 2 },
        { weekLabel: 'Week 2', hra: 2, all: 3 },
        { weekLabel: 'Week 3', hra: 1, all: 2 },
        { weekLabel: 'Week 4', hra: 2, all: 4 },
        { weekLabel: 'Week 5', hra: 1, all: 3 },
        { weekLabel: 'Week 6', hra: 2, all: 3 },
        { weekLabel: 'Week 7', hra: 1, all: 2 },
        { weekLabel: 'Week 8', hra: 2, all: 3 },
        { weekLabel: 'Week 9', hra: 1, all: 2 },
        { weekLabel: 'Week 10', hra: 2, all: 3 },
        { weekLabel: 'Week 11', hra: 1, all: 2 },
        { weekLabel: 'Week 12', hra: 2, all: 3 }
      ]
    }
    return data
  }, [outreach])
  const teamData = useMemo(() => {
    const data = countsByTeam(filteredOutreach)
    // If no data, use fallback data
    if (data.length === 0) {
      return [
        { team: 'Quality', count: 5 },
        { team: 'Member Services', count: 3 },
        { team: 'Case Management', count: 2 },
        { team: 'Risk Adjustment', count: 1 },
        { team: 'Pharmacy', count: 1 },
        { team: 'Community Partnerships', count: 1 }
      ]
    }
    return data
  }, [filteredOutreach])
  const purposeData = useMemo(() => {
    const data = countsByPurpose(filteredOutreach)
    if (data.length === 0) {
      return [
        { purpose: 'HRA Completion', count: 3, isHRA: true },
        { purpose: 'HRA Reminder', count: 2, isHRA: true },
        { purpose: 'AWV', count: 2, isHRA: false },
        { purpose: 'Medication Adherence', count: 1, isHRA: false }
      ]
    }
    return data
  }, [filteredOutreach])
  const channelSuccessData = useMemo(() => {
    const data = channelSuccessRate(filteredOutreach)
    if (data.length === 0) {
      return [
        { channel: 'Call', completed: 5, total: 8, rate: 63 },
        { channel: 'SMS', completed: 3, total: 6, rate: 50 },
        { channel: 'Email', completed: 2, total: 4, rate: 50 },
        { channel: 'Portal', completed: 1, total: 2, rate: 50 }
      ]
    }
    return data
  }, [filteredOutreach])
  const histogramData = useMemo(() => {
    const data = touchesPerMemberHistogram(filteredOutreach, members)
    if (data.length === 0) {
      return [
        { bin: '0', count: 1 },
        { bin: '1', count: 2 },
        { bin: '2', count: 1 },
        { bin: '3', count: 1 },
        { bin: '4-5', count: 0 },
        { bin: '6-7', count: 0 },
        { bin: '8+', count: 0 }
      ]
    }
    return data
  }, [filteredOutreach, members])

  // Channel distribution data
  const channelData = useMemo(() => {
    const counts = countByChannel(filteredOutreach)
    return seriesFromCounts(counts)
  }, [filteredOutreach])

  const topBottomChannels = useMemo(() => {
    return topAndBottomChannel(filteredOutreach)
  }, [filteredOutreach])

  // Purpose options sorted alphabetically by code
  const purposeOptions = useMemo(() => {
    return [...PURPOSE_CODES].sort((a, b) => a.code.localeCompare(b.code))
  }, [])

  const timeWindowLabel = getTimeWindowLabel(filters.window)

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Analytics Dashboard" 
        subtitle="Comprehensive insights into outreach performance and member engagement"
      />

      {/* Filter Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Time Window */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Window</label>
              <Select value={filters.window} onValueChange={(value) => updateFilters({ window: value as AnalyticsFilters['window'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30d">Last 30d</SelectItem>
                  <SelectItem value="last60d">Last 60d</SelectItem>
                  <SelectItem value="last90d">Last 90d</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Member Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Member Type</label>
              <Select value={filters.memberType} onValueChange={(value) => updateFilters({ memberType: value as AnalyticsFilters['memberType'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Team</label>
              <Select value={filters.team || 'All'} onValueChange={(value) => updateFilters({ team: value === 'All' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Teams</SelectItem>
                  {TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purpose Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose</label>
              <Select value={filters.purpose || 'All'} onValueChange={(value) => updateFilters({ purpose: value === 'All' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Purposes</SelectItem>
                  {purposeOptions.map(p => {
                    const purposeValue = CODE_TO_PURPOSE[p.code] || p.code
                    return (
                      <SelectItem key={p.code} value={purposeValue} title={p.label}>
                        {p.code}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel</label>
              <Select value={filters.channel || 'All'} onValueChange={(value) => updateFilters({ channel: value === 'All' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Channels</SelectItem>
                  {CHANNELS.map(channel => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance KPI */}
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle>Channel Performance</CardTitle>
          <p className="text-sm text-muted-foreground">Aggregated over current filters/time window</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-lg font-medium">
                    Top Channel: <span className="font-semibold">{topBottomChannels.top}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Highest outreach volume channel in the selected window.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-muted-foreground">
                    Bottom Channel: <span className="font-semibold">{topBottomChannels.bottom}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lowest outreach volume channel in the selected window.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {channelData.length > 0 && <ChannelDistribution data={channelData} />}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Touches Over Time (Last 12 Weeks) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Touches Over Time (Last 12 Weeks)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Shows HRA touches vs all touches over the last 12 weeks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline">{timeWindowLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={touchesOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekLabel" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="hra" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="HRA Touches"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="all" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="All Touches"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Touches by Reason (30d) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Touches by Reason</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Outreach volume by purpose/reason within the selected time window</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline">{timeWindowLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purposeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ purpose, count, percent }) => `${purpose}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {purposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isHRA ? '#EF4444' : ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'][index % 6]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Touches by Purpose (30d) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Touches by Purpose</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Outreach volume by purpose, with HRA purposes highlighted</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline">{timeWindowLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purposeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="purpose" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <RechartsTooltip />
                <Bar 
                  dataKey="count"
                >
                  {purposeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isHRA ? '#EF4444' : '#8B5CF6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Channel Success Rate (30d) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Channel Success Rate</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completion rate by channel (Completed / Total)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline">{timeWindowLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelSuccessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.completed}/${props.payload.total})`,
                    'Success Rate'
                  ]}
                />
                <Bar 
                  dataKey="rate" 
                  fill="#F59E0B"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Touches per Member Distribution (30d) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Touches per Member Distribution</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Distribution of outreach frequency per member (Members only, excludes Prospects)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline">{timeWindowLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" />
                <YAxis />
                <RechartsTooltip />
                <Bar 
                  dataKey="count" 
                  fill="#06B6D4"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
