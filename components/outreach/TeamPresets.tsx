'use client'

import { useEffect, useState } from 'react'
import { loadLocal, saveLocal } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { X, Save } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TEAMS_EXPANDED, TIMEFRAMES } from '@/lib/constants'

export interface Preset {
  id: string
  teamId: string
  timeframe: string
  label: string
}

interface TeamPresetsProps {
  currentTeamId?: string
  currentTimeframe?: string
  onSelect: (preset: Preset) => void
}

export function TeamPresets({ currentTeamId, currentTimeframe, onSelect }: TeamPresetsProps) {
  const [presets, setPresets] = useState<Preset[]>(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<Preset[]>('outreach-presets', [])
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('outreach-presets', presets)
    }
  }, [presets])

  const handleSave = () => {
    if (!currentTeamId || !currentTimeframe) return

    // Look up team name from TEAMS_EXPANDED
    const team = TEAMS_EXPANDED.find(t => t.id === currentTeamId || t.name === currentTeamId)
    const teamName = team?.name || currentTeamId
    
    // Look up timeframe label from TIMEFRAMES
    const timeframe = TIMEFRAMES.find(t => t.key === currentTimeframe)
    const timeframeLabel = timeframe?.label || currentTimeframe

    const label = `${teamName} – ${timeframeLabel}`
    
    // Check if preset already exists
    const exists = presets.some(p => p.teamId === currentTeamId && p.timeframe === currentTimeframe)
    if (exists) return

    const newPreset: Preset = {
      id: crypto.randomUUID(),
      teamId: currentTeamId,
      timeframe: currentTimeframe,
      label,
    }

    const next = [...presets, newPreset]
    setPresets(next)
  }

  const handleDelete = (presetId: string) => {
    setPresets(presets.filter(p => p.id !== presetId))
  }

  if (presets.length === 0 && !currentTeamId) {
    return null
  }

  return (
    <div className="space-y-3">
      {presets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Saved Presets</h3>
          <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
              <div key={preset.id} className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelect(preset)}
                  className="flex items-center gap-2"
                >
                  {preset.label}
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleDelete(preset.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete preset</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTeamId && currentTimeframe && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={presets.some(p => p.teamId === currentTeamId && p.timeframe === currentTimeframe)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save current view as preset
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Presets saved locally for this session.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

