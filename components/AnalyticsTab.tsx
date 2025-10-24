'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { 
  getOutreachByChannel,
  getResponseRateData,
  getFunnelData,
  type Outreach,
  type Member
} from '@/lib/mock'
import { TEAMS, PURPOSES } from '@/lib/constants'
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

interface AnalyticsTabProps {
  outreach: Outreach[]
  members: Member[]
}

export function AnalyticsTab({ outreach, members }: AnalyticsTabProps) {
  const channelData = getOutreachByChannel(outreach)
  const responseRateData = getResponseRateData(outreach)
  const funnelData = getFunnelData(outreach)

  // Team analytics
  const teamData = TEAMS.map(team => ({
    team,
    count: outreach.filter(o => o.team === team).length
  }))

  // Purpose analytics
  const purposeData = PURPOSES.map(purpose => ({
    purpose,
    count: outreach.filter(o => o.purpose === purpose).length
  }))

  // Calculate additional metrics
  const totalMembers = members.length
  const highRiskMembers = members.filter(m => m.risk > 70).length
  const avgRiskScore = Math.round(members.reduce((sum, m) => sum + m.risk, 0) / totalMembers)
  const outreachPerMember = totalMembers > 0 ? Math.round(outreach.length / totalMembers * 10) / 10 : 0

  // Color scheme for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Analytics Dashboard" 
        subtitle="Real-time insights into member engagement and outreach performance"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          title="Total Members"
          value={totalMembers}
          subtitle="Active profiles"
        />
        <Stat
          title="High Risk Members"
          value={highRiskMembers}
          subtitle={`${Math.round((highRiskMembers / totalMembers) * 100)}% of total`}
          trend={{ value: 5, isPositive: false }}
        />
        <Stat
          title="Avg Risk Score"
          value={avgRiskScore}
          subtitle="Population average"
        />
        <Stat
          title="Outreach per Member"
          value={outreachPerMember}
          subtitle="Engagement rate"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outreach by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Outreach by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>14-Day Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Response Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="responseRate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outreach Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Outreach Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="stage" type="category" width={100} />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.count} items)`,
                    'Percentage'
                  ]}
                />
                <Bar dataKey="percentage" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Member Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Low Risk (0-40)', value: members.filter(m => m.risk <= 40).length },
                    { name: 'Medium Risk (41-70)', value: members.filter(m => m.risk > 40 && m.risk <= 70).length },
                    { name: 'High Risk (71-100)', value: members.filter(m => m.risk > 70).length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Low Risk (0-40)', value: members.filter(m => m.risk <= 40).length },
                    { name: 'Medium Risk (41-70)', value: members.filter(m => m.risk > 40 && m.risk <= 70).length },
                    { name: 'High Risk (71-100)', value: members.filter(m => m.risk > 70).length }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team and Purpose Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Touches by Team (30d) */}
        <Card>
          <CardHeader>
            <CardTitle>Touches by Team (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData}>
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
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Purpose Mix (30d) */}
        <Card>
          <CardHeader>
            <CardTitle>Purpose Mix (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purposeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ purpose, percent }) => `${purpose}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {purposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SDOH Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Channel by SDOH Need */}
        <Card>
          <CardHeader>
            <CardTitle>Best Channel by SDOH Need</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { need: 'Food', Call: 45, SMS: 60, Email: 30, Portal: 15 },
                { need: 'Transport', Call: 55, SMS: 40, Email: 35, Portal: 20 },
                { need: 'Utilities', Call: 50, SMS: 35, Email: 45, Portal: 25 },
                { need: 'BH', Call: 30, SMS: 70, Email: 50, Portal: 10 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="need" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Call" stackId="a" fill="#3B82F6" />
                <Bar dataKey="SMS" stackId="a" fill="#10B981" />
                <Bar dataKey="Email" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Portal" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion by ADI Bucket */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion by ADI Bucket</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { bucket: 'ADI 1-3', conversion: 85, outreach: 120 },
                { bucket: 'ADI 4-6', conversion: 72, outreach: 95 },
                { bucket: 'ADI 7-8', conversion: 58, outreach: 80 },
                { bucket: 'ADI 9-10', conversion: 42, outreach: 65 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, name === 'conversion' ? 'Conversion Rate' : 'Outreach Count']} />
                <Bar dataKey="conversion" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {channelData.reduce((prev, current) => prev.count > current.count ? prev : current).channel}
              </div>
              <p className="text-sm text-gray-600">
                {channelData.reduce((prev, current) => prev.count > current.count ? prev : current).count} interactions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(responseRateData.reduce((sum, d) => sum + d.responseRate, 0) / responseRateData.length)}%
              </div>
              <p className="text-sm text-gray-600">Last 14 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {funnelData.find(f => f.stage === 'Completed')?.percentage || 0}%
              </div>
              <p className="text-sm text-gray-600">Outreach success</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
