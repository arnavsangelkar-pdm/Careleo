'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TIMEFRAMES, TEAMS_EXPANDED } from '@/lib/constants'
import { filterByTeam, filterByDays, summarizeOutreach } from '@/lib/selectors.outreach'
import type { Outreach } from '@/lib/types'
import { Stat } from '../Stat'
import { TeamPresets, type Preset } from './TeamPresets'
import { ArrowLeft } from 'lucide-react'

interface TeamDrillInProps {
  rows: Outreach[]
}

export default function TeamDrillIn({ rows }: TeamDrillInProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const team = searchParams.get('team') || ''
  const tf = searchParams.get('tf') || '90d'
  const days = TIMEFRAMES.find(t => t.key === tf)?.days

  const teamRows = filterByDays(filterByTeam(rows, team), days)
  const kpi = summarizeOutreach(teamRows)

  const selectedTeam = TEAMS_EXPANDED.find(t => t.id === team || t.name === team)

  const handleTimeframeChange = (newTf: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tf', newTf)
    params.set('tab', 'outreach')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('team')
    params.delete('tf')
    params.set('tab', 'outreach')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handlePresetSelect = (preset: Preset) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('team', preset.teamId)
    params.set('tf', preset.timeframe)
    params.set('tab', 'outreach')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {selectedTeam?.name || team || 'Team Overview'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedTeam?.type === 'vendor' ? 'Vendor Partner' : 'Internal Team'}
            </p>
          </div>
        </div>
        <Select value={tf} onValueChange={handleTimeframeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEFRAMES.map(t => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPresets
            currentTeamId={team}
            currentTimeframe={tf}
            onSelect={handlePresetSelect}
          />
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          title="Total Outreach"
          value={kpi.total}
          subtitle={`${TIMEFRAMES.find(t => t.key === tf)?.label || 'Selected period'}`}
        />
        <Stat
          title="Completed"
          value={kpi.byStatus['Completed'] || 0}
          subtitle={`${kpi.total ? Math.round(((kpi.byStatus['Completed'] || 0) / kpi.total) * 100) : 0}% completion rate`}
        />
        <Stat
          title="In Progress"
          value={kpi.byStatus['In-Progress'] || 0}
          subtitle="Active outreach"
        />
        <Stat
          title="Unable to Contact"
          value={kpi.byStatus['Failed'] || 0}
          subtitle={`${kpi.utcRate}% UTC rate`}
        />
      </div>

      {/* Outreach Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outreach Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {teamRows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No outreach found for this team in the selected timeframe.
              </div>
            ) : (
              teamRows.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{entry.topic}</h3>
                        <Badge variant={entry.status === 'Completed' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{entry.memberName}</span>
                        <span>{new Date(entry.occurredAt || entry.timestamp).toLocaleDateString()}</span>
                        <span>{entry.channel}</span>
                        {entry.purposeCode && (
                          <Badge variant="outline" className="text-xs">
                            {entry.purposeCode}
                          </Badge>
                        )}
                      </div>
                    </div>
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

