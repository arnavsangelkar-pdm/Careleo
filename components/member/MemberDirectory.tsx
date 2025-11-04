'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  getRiskBadgeVariant,
  type Member
} from '@/lib/mock'
import { searchMembers } from '@/lib/search'
import { MEASURE_LABEL } from '@/lib/constants'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import PlanFilter from '@/components/filters/PlanFilter'
import { CohortChips } from './CohortChips'
import { 
  Search, 
  User,
  Filter
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
  
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [conditionFilter, setConditionFilter] = useState('All')
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Debug logging removed to reduce console spam
  
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const filteredMembers = React.useMemo(() => {
    let filtered = searchMembers(members, searchQuery)
    
    if (riskFilter !== 'All') {
      filtered = filtered.filter(member => {
        switch (riskFilter) {
          case 'Low': return member.risk <= 40
          case 'Medium': return member.risk > 40 && member.risk <= 70
          case 'High': return member.risk > 70
          default: return true
        }
      })
    }
    
    if (selectedPlans.length > 0) {
      filtered = filtered.filter(member => selectedPlans.includes(member.plan))
    }
    
    if (conditionFilter !== 'All') {
      filtered = filtered.filter(member => 
        member.conditions.some(condition => 
          condition.toLowerCase().includes(conditionFilter.toLowerCase())
        )
      )
    }
    
    // console.log('Filtered members count:', filtered.length, 'Total members:', members.length)
    return filtered
  }, [members, searchQuery, riskFilter, conditionFilter, selectedPlans])

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
    <div className="space-y-6 p-6">
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
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name, Member ID, or DOB (e.g., 06/21/1980)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search members by name, Member ID, or date of birth"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Plan</label>
              <PlanFilter 
                value={selectedPlans} 
                onChange={setSelectedPlans}
                label="Select Plans"
                multi={true}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Abrasion Risk Level</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Abrasion Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Abrasion Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Abrasion Risk (0-40)</SelectItem>
                  <SelectItem value="Medium">Medium Abrasion Risk (41-70)</SelectItem>
                  <SelectItem value="High">High Abrasion Risk (71-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Medical Condition</label>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Conditions</SelectItem>
                  {Array.from(new Set(members.flatMap(m => m.conditions))).map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Member List */}
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
    </div>
  )
}
