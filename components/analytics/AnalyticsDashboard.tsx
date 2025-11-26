'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SectionTitle } from '../SectionTitle'
import { hedisClosureTrend, claimsHistogram, outreachFunnel, interactionsByTeam, paretoHighCost } from '@/lib/selectors.analytics.extra'
import { HedisGapClosureTrend } from './HedisGapClosureTrend'
import { ClaimsCostHistogram } from './ClaimsCostHistogram'
import { OutreachFunnel as OutreachFunnelChart } from './OutreachFunnel'
import { InteractionsByTeam } from './InteractionsByTeam'
import { ParetoHighCost } from './ParetoHighCost'
import type { Outreach, Member } from '@/lib/mock'

interface AnalyticsDashboardProps {
  outreach: Outreach[]
  members: Member[]
  memberClaims: import('@/lib/types').MemberClaimsSummary[]
  hedisEvents: import('@/lib/types').HedisGapEvent[]
}

export function AnalyticsDashboard({ outreach, members, memberClaims, hedisEvents }: AnalyticsDashboardProps) {
  // Generate chart data using the new selectors
  const hedTrend = useMemo(() => hedisClosureTrend(hedisEvents, 8), [hedisEvents])
  const hist = useMemo(() => claimsHistogram(memberClaims, 1000, 15), [memberClaims])
  const funnel = useMemo(() => outreachFunnel(outreach), [outreach])
  const interactions = useMemo(() => interactionsByTeam(outreach, 12), [outreach])
  const pareto = useMemo(() => paretoHighCost(memberClaims, 20), [memberClaims])

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Analytics Dashboard" 
        subtitle="Comprehensive insights into outreach performance and member engagement"
      />

      {/* Charts Grid - 5 new charts only */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>HEDIS Gap Closure Trend</CardTitle>
            <CardDescription>Monthly closure rate across key measures</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <HedisGapClosureTrend data={hedTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims Cost Distribution</CardTitle>
            <CardDescription>Per-member total spend in the current period</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ClaimsCostHistogram data={hist} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outreach Funnel</CardTitle>
            <CardDescription>From sent to completed outreach</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <OutreachFunnelChart data={funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Interaction Volume by Team</CardTitle>
            <CardDescription>Weekly interaction volume across teams</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <InteractionsByTeam data={interactions.rows} keys={interactions.teams} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>High‑Cost Claimants (Pareto)</CardTitle>
            <CardDescription>Top 20 members driving overall spend</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ParetoHighCost data={pareto} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
