'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  getRiskBadgeVariant,
  type Member
} from '@/lib/mock'
import { MEASURE_LABEL } from '@/lib/constants'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CohortChips } from './CohortChips'
import { 
  User
} from 'lucide-react'

interface MemberDirectoryProps {
  members: Member[]
  selectedMemberId: string | null
  onSelectMember: (memberId: string, index?: number) => void
  isMobile?: boolean
}

export function MemberDirectory({
  members,
  selectedMemberId,
  onSelectMember,
  isMobile = false
}: MemberDirectoryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Members are already filtered by parent component (MembersTab)
  // No need to filter again here
  const filteredMembers = members

  // Reset active index when filters change
  useEffect(() => {
    setActiveIndex(0)
  }, [filteredMembers])

  // Debug: Log filtered members (removed to prevent infinite loops)

  // Update active index when selectedMemberId changes
  useEffect(() => {
    if (selectedMemberId) {
      const index = filteredMembers.findIndex(m => m.id === selectedMemberId)
      if (index >= 0) {
        setActiveIndex(index)
      }
    }
  }, [selectedMemberId, filteredMembers])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredMembers.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => Math.min(prev + 1, filteredMembers.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (filteredMembers[activeIndex]) {
          onSelectMember(filteredMembers[activeIndex].id, activeIndex)
        }
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(filteredMembers.length - 1)
        break
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [activeIndex])

  const handleMemberClick = (memberId: string, index: number) => {
    onSelectMember(memberId, index)
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Member Directory</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredMembers.length} members
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
        {/* Member List - Filters are now in sidebar */}
        <div 
          ref={listRef}
          className="max-h-[600px] overflow-y-auto space-y-3 pr-2 scrollbar-gutter-stable focus:outline-none"
          role="listbox"
          aria-label="Member directory"
          aria-activedescendant={filteredMembers[activeIndex]?.id}
          aria-describedby="directory-instructions"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div id="directory-instructions" className="sr-only">
            Use arrow keys to navigate through members. Press Enter or Space to select a member.
          </div>
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              ref={el => { itemRefs.current[index] = el }}
              id={member.id}
              data-member-index={index}
              className={`p-4 rounded-lg border cursor-pointer ${
                selectedMemberId === member.id
                  ? 'border-blue-500 bg-blue-50'
                  : activeIndex === index
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleMemberClick(member.id, index)
              }}
              role="option"
              aria-selected={selectedMemberId === member.id}
              aria-label={`Select member ${member.name}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">
                      ID: {member.memberId || member.id} • Plan {member.plan} • PBP {member.planInfo.pbp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRiskBadgeVariant(member.risk)}>
                    {member.risk}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {member.memberType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {member.plan}
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
              {member.measures && member.measures.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <TooltipProvider>
                    {member.measures.map((m) => (
                      <Tooltip key={`${m.program}-${m.code}`}>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant={m.program === "Stars" ? "default" : "secondary"}
                            className="text-xs cursor-help"
                          >
                            {m.code}
                            <span className="sr-only">{MEASURE_LABEL[m.code]}</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-sm">
                          <p className="font-medium">{m.code} — {MEASURE_LABEL[m.code]}</p>
                          <p className="text-muted-foreground">Program: {m.program}</p>
                          {m.relatedConditions?.length ? (
                            <p className="text-muted-foreground">Linked to: {m.relatedConditions.join(", ")}</p>
                          ) : null}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              )}
              {member.cohorts && member.cohorts.length > 0 && (
                <div className="mt-2">
                  <CohortChips ids={member.cohorts} />
                </div>
              )}
            </div>
          ))}
        </div>
        </CardContent>
      </Card>
  )
}
