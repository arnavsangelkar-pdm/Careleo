'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { MemberDirectory } from './member/MemberDirectory'
import { MemberProfile } from './member/MemberProfile'
import { 
  type Member,
  type Outreach,
  dataAsOf
} from '@/lib/mock'

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          value={members.filter(m => m.risk > 70).length}
          subtitle="Requires attention"
          trend={{ value: 12, isPositive: false }}
        />
        <Stat
          title="Recent Outreach"
          value={outreach.filter(o => {
            const date = new Date(o.timestamp)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return date > weekAgo
          }).length}
          subtitle="Last 7 days"
          onClick={() => onNavigateToOutreach?.({ filter: 'last7d' })}
        />
      </div>

      {/* Master-Detail Layout */}
      {!isMobile ? (
        <div className="grid grid-cols-10 gap-6">
          <div ref={directoryRef} className="col-span-4">
            <MemberDirectory
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={handleSelectMember}
              isMobile={isMobile}
            />
          </div>
          <div className="col-span-6">
            <MemberProfile
              members={members}
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
            members={members}
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
              members={members}
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
