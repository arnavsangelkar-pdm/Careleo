'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cohorts } from '@/lib/mock'

interface CohortChipsProps {
  ids?: string[]
  maxVisible?: number
}

export function CohortChips({ ids, maxVisible = 2 }: CohortChipsProps) {
  if (!ids || ids.length === 0) return null

  const cohortMap = new Map(cohorts.map(c => [c.id, c]))
  const visibleIds = ids.slice(0, maxVisible)
  const extra = ids.length - visibleIds.length

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {visibleIds.map(id => {
          const cohort = cohortMap.get(id)
          const displayName = cohort?.name || id.replace('c_', '')
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs cursor-help">
                  {displayName}
                </Badge>
              </TooltipTrigger>
              {cohort?.description && (
                <TooltipContent>
                  <p className="text-sm">{cohort.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
        {extra > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                Cohorts: {ids.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="text-sm">
                <p className="font-medium mb-2">All Cohorts ({ids.length})</p>
                <ul className="list-disc pl-4 space-y-1">
                  {ids.map(id => {
                    const cohort = cohortMap.get(id)
                    return (
                      <li key={id} className="text-xs">
                        {cohort?.name || id.replace('c_', '')}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  )
}

