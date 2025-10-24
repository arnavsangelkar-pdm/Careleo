'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '../SectionTitle'
import { Stat } from '../Stat'
import { 
  touchesPerMember, 
  monthOverMonth, 
  getHraOutreach,
  getTopChannel,
  getTouchesByTeam,
  getTouchesByPurpose,
  getMoMTrendData
} from '@/lib/metrics'
import { 
  getOutreachByChannel,
  type Outreach,
  type Member
} from '@/lib/mock'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  ArrowRight
} from 'lucide-react'

interface OutreachAnalysisProps {
  outreach: Outreach[]
  members: Member[]
  onNavigateToOutreach?: (filters: Record<string, string>) => void
}

export function OutreachAnalysis({ outreach, members, onNavigateToOutreach }: OutreachAnalysisProps) {
  // Calculate KPIs
  const avgTouchpoints30d = touchesPerMember(outreach, members.length, 30)
  const avgTouchpoints60d = touchesPerMember(outreach, members.length, 60)
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
  
  const topChannel = getTopChannel(outreach, 30)
  const touchesByTeam = getTouchesByTeam(outreach, 30)
  const touchesByPurpose = getTouchesByPurpose(outreach, 30)
  const moMTrendData = getMoMTrendData(outreach, 30)
  
  // Channel data for charts
  const channelData = getOutreachByChannel(outreach)
  
  // Color scheme
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  
  // Distribution of touches per member (histogram-like)
  const touchesDistribution = [
    { range: '0-1', count: Math.floor(members.length * 0.3) },
    { range: '2-3', count: Math.floor(members.length * 0.4) },
    { range: '4-5', count: Math.floor(members.length * 0.2) },
    { range: '6+', count: Math.floor(members.length * 0.1) }
  ]

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Outreach Analysis" 
        subtitle="Comprehensive analysis of HRA outreach performance and member engagement patterns"
      />

      {/* Key KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          title="Avg Touchpoints / Member (30d)"
          value={avgTouchpoints30d}
          subtitle={`MoM ${momTouchpoints.direction === 'up' ? '+' : momTouchpoints.direction === 'down' ? '-' : ''}${momTouchpoints.deltaPct}%`}
          trend={{ value: momTouchpoints.deltaPct, isPositive: momTouchpoints.direction === 'up' }}
        />
        <Stat
          title="HRA Touches (30d)"
          value={hraTouches30d}
          subtitle={`MoM ${momHraTouches.direction === 'up' ? '+' : momHraTouches.direction === 'down' ? '-' : ''}${momHraTouches.deltaPct}%`}
          trend={{ value: momHraTouches.deltaPct, isPositive: momHraTouches.direction === 'up' }}
        />
        <Stat
          title="Top Channel (30d)"
          value={topChannel}
          subtitle="Most effective channel"
        />
        <Stat
          title="Active Teams"
          value={touchesByTeam.length}
          subtitle="Teams with outreach activity"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution of Touches / Member */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Distribution of Touches / Member</span>
              {onNavigateToOutreach && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToOutreach({ filter: 'last30d' })}
                >
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={touchesDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Touches by Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Touches by Team (30d)</span>
              {onNavigateToOutreach && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToOutreach({ filter: 'teams' })}
                >
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={touchesByTeam}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="team" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Touches by Purpose with HRA Highlighted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Touches by Purpose (30d)</span>
              {onNavigateToOutreach && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToOutreach({ filter: 'purpose' })}
                >
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={touchesByPurpose}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="purpose" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MoM Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>MoM Trend (6 Periods)</span>
              {onNavigateToOutreach && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToOutreach({ filter: 'trend' })}
                >
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moMTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="touches" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Channel Performance (30d)</span>
              {onNavigateToOutreach && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToOutreach({ filter: 'channels' })}
                >
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ channel, percent }) => `${channel}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HRA Focus Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>HRA Focus Summary</span>
              {onNavigateToOutreach && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToOutreach({ filter: 'hra' })}
                >
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900">HRA Completion</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {touchesByPurpose.find(p => p.purpose === 'HRA Completion')?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">HRA Reminder</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {touchesByPurpose.find(p => p.purpose === 'HRA Reminder')?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Total HRA Touches</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{hraTouches30d}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">MoM Change</span>
                </div>
                <span className={`text-lg font-bold ${momHraTouches.direction === 'up' ? 'text-green-600' : momHraTouches.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {momHraTouches.direction === 'up' ? '+' : momHraTouches.direction === 'down' ? '-' : ''}{momHraTouches.deltaPct}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
