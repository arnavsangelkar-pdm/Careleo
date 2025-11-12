'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { MemberDirectory } from './member/MemberDirectory'
import { MemberProfile } from './member/MemberProfile'
import { MembersFiltersSidebar } from './member/MembersFiltersSidebar'
import { 
  type Member,
  type Outreach,
  dataAsOf
} from '@/lib/mock'
import { filterMembersByAbrasion, filterMembersByRecentOutreach } from '@/lib/selectors.members'
import { formatMembersForCSV } from '@/lib/csv'
import { searchMembers } from '@/lib/search'
import { mockExport } from '@/lib/exportMock'
import { loadLocal, saveLocal } from '@/lib/storage'
import { Download } from 'lucide-react'

interface MembersTabProps {
  members: Member[]
  outreach: Outreach[]
  selectedMemberId: string | null
  onSelectMember: (memberId: string) => void
  onAddOutreach: (data: any) => void
  onMemberAction: (action: string, member: Member) => void
  onNavigateToOutreach?: (filters: Record<string, string>) => void
}

export function MembersTab({
  members,
  outreach,
  selectedMemberId,
  onSelectMember,
  onAddOutreach,
  onMemberAction,
  onNavigateToOutreach
}: MembersTabProps) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [focusedMemberIndex, setFocusedMemberIndex] = useState(0)
  const directoryRef = useRef<HTMLDivElement>(null)

  // Sidebar filter state - load from localStorage
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-members-search', '')
    }
    return ''
  })
  const [abrasionFilter, setAbrasionFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-members-abrasion', 'All')
    }
    return 'All'
  })
  const [recentFilter, setRecentFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-members-recent', 'All')
    }
    return 'All'
  })
  const [planFilter, setPlanFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadLocal<string>('flt-members-plan', 'All')
    }
    return 'All'
  })

  // Get unique plans
  const allPlans = useMemo(() => {
    return Array.from(new Set(members.map(m => m.plan))).sort()
  }, [members])

  // Apply all filters
  const filteredMembers = useMemo(() => {
    let filtered = members

    // Search filter
    if (searchQuery) {
      filtered = searchMembers(filtered, searchQuery)
    }

    // Abrasion filter
    if (abrasionFilter !== 'All') {
      filtered = filterMembersByAbrasion(filtered, abrasionFilter as 'low' | 'med' | 'high')
    }

    // Recent outreach filter
    if (recentFilter !== 'All') {
      const days = recentFilter === '30d' ? 30 : recentFilter === '90d' ? 90 : recentFilter === '7d' ? 7 : undefined
      if (days) {
        filtered = filterMembersByRecentOutreach(filtered, outreach, days)
      }
    }

    // Plan filter
    if (planFilter !== 'All') {
      filtered = filtered.filter(m => m.plan === planFilter)
    }

    return filtered
  }, [members, outreach, searchQuery, abrasionFilter, recentFilter, planFilter])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (abrasionFilter !== 'All') count++
    if (recentFilter !== 'All') count++
    if (planFilter !== 'All') count++
    return count
  }, [searchQuery, abrasionFilter, recentFilter, planFilter])

  // Persist filters to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-members-search', searchQuery)
    }
  }, [searchQuery])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-members-abrasion', abrasionFilter)
    }
  }, [abrasionFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-members-recent', recentFilter)
    }
  }, [recentFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLocal('flt-members-plan', planFilter)
    }
  }, [planFilter])

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setAbrasionFilter('All')
    setRecentFilter('All')
    setPlanFilter('All')
  }

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle member selection with mobile sheet
  const handleSelectMember = (memberId: string, index?: number) => {
    onSelectMember(memberId)
    if (index !== undefined) {
      setFocusedMemberIndex(index)
    }
    if (isMobile) {
      setSheetOpen(true)
    }
  }

  // Handle sheet close and focus return
  const handleSheetClose = () => {
    setSheetOpen(false)
    // Return focus to the previously focused member in directory
    setTimeout(() => {
      if (directoryRef.current) {
        const focusedElement = directoryRef.current.querySelector(`[data-member-index="${focusedMemberIndex}"]`)
        if (focusedElement) {
          (focusedElement as HTMLElement).focus()
        }
      }
    }, 50)
  }

  const handleActionClick = (action: string) => {
    const selectedMember = members.find(m => m.id === selectedMemberId)
    if (selectedMember) {
      setSelectedAction(action)
      setActionDialogOpen(true)
    }
  }

  const handleActionConfirm = () => {
    const selectedMember = members.find(m => m.id === selectedMemberId)
    if (selectedMember) {
      onMemberAction(selectedAction, selectedMember)
      setActionDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Member Management" 
        subtitle="Search and manage member profiles with risk assessment and outreach tracking"
      />

      {/* Stats - Display only (no clickable functionality) */}
      <div className="flex items-center justify-between mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <Stat
            title="Total Members"
            value={members.length}
            subtitle={
              <span>
                Active profiles
                <br />
                <span className="text-xs text-muted-foreground">
                  Data through <span className="font-medium">{new Date(dataAsOf).toLocaleDateString()}</span>
                </span>
              </span>
            }
          />
          <Stat
            title="High Abrasion Risk"
            value={members.filter(m => (m.abrasionRisk ?? m.risk) > 70).length}
            subtitle="Requires attention"
            trend={{ value: 12, isPositive: false }}
          />
          <Stat
            title="Recent Outreach"
            value={outreach.filter(o => {
              const timestamp = o.occurredAt || o.timestamp
              const date = new Date(timestamp)
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              return date > weekAgo
            }).length}
            subtitle="Last 7 days"
          />
        </div>
        {/* Export button - always visible */}
        <Button
          variant="outline"
          onClick={() => {
            mockExport('Member', filteredMembers.length)
          }}
          className="ml-4"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV {activeFilterCount > 0 && `(${filteredMembers.length})`}
        </Button>
      </div>

      {/* Layout with Sidebar Filters - 40/60 split */}
      {!isMobile ? (
        <div className="grid grid-cols-5 gap-6">
          {/* Left Column: Filters and Directory stacked (40%) */}
          <div className="col-span-2 space-y-6">
            {/* Filters at top */}
            <MembersFiltersSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              abrasionFilter={abrasionFilter}
              onAbrasionChange={setAbrasionFilter}
              recentFilter={recentFilter}
              onRecentChange={setRecentFilter}
              planFilter={planFilter}
              onPlanChange={setPlanFilter}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
              allPlans={allPlans}
            />
            
            {/* Directory below filters */}
            <div ref={directoryRef}>
              <MemberDirectory
                members={filteredMembers}
                selectedMemberId={selectedMemberId}
                onSelectMember={handleSelectMember}
                isMobile={isMobile}
              />
            </div>
          </div>
          
          {/* Right Column: Profile (60%) */}
          <div className="col-span-3">
            <MemberProfile
              members={filteredMembers}
              selectedMemberId={selectedMemberId}
              outreach={outreach}
              onAddOutreach={onAddOutreach}
              onMemberAction={handleActionClick}
              isMobile={isMobile}
            />
          </div>
        </div>
      ) : (
        <div ref={directoryRef}>
          <MemberDirectory
            members={filteredMembers}
            selectedMemberId={selectedMemberId}
            onSelectMember={handleSelectMember}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Mobile Sheet for Member Profile */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Member Profile</SheetTitle>
          </SheetHeader>
          <div className="mt-6 h-[calc(100vh-8rem)] overflow-y-auto">
            <MemberProfile
              members={filteredMembers}
              selectedMemberId={selectedMemberId}
              outreach={outreach}
              onAddOutreach={onAddOutreach}
              onMemberAction={handleActionClick}
              isMobile={true}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedAction.replace('_', ' ').toLowerCase()} for {members.find(m => m.id === selectedMemberId)?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActionConfirm}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
