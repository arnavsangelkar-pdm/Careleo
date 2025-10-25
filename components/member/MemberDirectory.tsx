'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  searchMembers, 
  getAberrationRiskBadgeVariant,
  type Member
} from '@/lib/mock'
import { 
  Search, 
  User,
  Filter
} from 'lucide-react'

interface MemberDirectoryProps {
  members: Member[]
  selectedMember: Member | null
  onSelectMember: (member: Member, index?: number) => void
  isMobile?: boolean
}

export function MemberDirectory({
  members,
  selectedMember,
  onSelectMember,
  isMobile = false
}: MemberDirectoryProps) {
  
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [aberrationRiskFilter, setAberrationRiskFilter] = useState('All')
  const [conditionFilter, setConditionFilter] = useState('All')
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Debug logging removed to reduce console spam
  
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const filteredMembers = React.useMemo(() => {
    let filtered = searchMembers(members, searchQuery)
    
    if (aberrationRiskFilter !== 'All') {
      filtered = filtered.filter(member => {
        switch (aberrationRiskFilter) {
          case 'Low': return member.aberrationRisk <= 40
          case 'Medium': return member.aberrationRisk > 40 && member.aberrationRisk <= 70
          case 'High': return member.aberrationRisk > 70
          default: return true
        }
      })
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
  }, [members, searchQuery, aberrationRiskFilter, conditionFilter])

  // Reset active index when filters change
  useEffect(() => {
    setActiveIndex(0)
  }, [filteredMembers])

  // Debug: Log filtered members (removed to prevent infinite loops)

  // Handle URL-based member selection
  useEffect(() => {
    const memberId = searchParams.get('member')
    if (memberId) {
      const member = members.find(m => m.id === memberId)
      if (member) {
        const index = filteredMembers.findIndex(m => m.id === memberId)
        onSelectMember(member, index >= 0 ? index : undefined)
        if (index >= 0) setActiveIndex(index)
      }
    } else if (!selectedMember && filteredMembers.length > 0) {
      onSelectMember(filteredMembers[0], 0)
    }
  }, [searchParams, members, filteredMembers, selectedMember, onSelectMember])

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
          onSelectMember(filteredMembers[activeIndex], activeIndex)
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

  const handleMemberClick = (member: Member, index: number) => {
    onSelectMember(member, index)
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
              placeholder="Search member, HContract, PBP…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Aberration Risk Level</label>
              <Select value={aberrationRiskFilter} onValueChange={setAberrationRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Aberration Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Aberration Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Aberration Risk (0-40)</SelectItem>
                  <SelectItem value="Medium">Medium Aberration Risk (41-70)</SelectItem>
                  <SelectItem value="High">High Aberration Risk (71-100)</SelectItem>
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
                selectedMember?.id === member.id
                  ? 'border-blue-500 bg-blue-50'
                  : activeIndex === index
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleMemberClick(member, index)
              }}
              role="option"
              aria-selected={selectedMember?.id === member.id}
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
                      {member.id} • HContract {member.planInfo.contractId} • PBP {member.planInfo.pbp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getAberrationRiskBadgeVariant(member.aberrationRisk)}>
                    {member.aberrationRisk}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {member.memberType}
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
            </div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
