'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  generateMockMembers, 
  generateMockOutreach, 
  generateMockAudit,
  addSdohProfiles,
  attachCohortsAndTypes,
  type Member,
  type Outreach,
  type AuditEntry
} from '@/lib/mock'
import { MembersTab } from './MembersTab'
import { OutreachTab } from './OutreachTab'
import { AuditTab } from './AuditTab'
import { CohortsDashboard } from './cohorts/CohortsDashboard'
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard'
import { Shield, Users, MessageSquare, BarChart3, FileText, Target, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { LoadingShimmer } from './LoadingShimmer'

export default function MockHealthcareCRM() {
  const [members, setMembers] = useState<Member[]>([])
  const [outreach, setOutreach] = useState<Outreach[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize mock data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        // Generate 10,045 members with exactly 3 outreach each (varied data)
        const mockMembers = generateMockMembers(10045)
        const mockOutreach = generateMockOutreach(mockMembers, 30135) // Exactly 3 outreach per member
        const mockAudit = generateMockAudit(mockMembers, mockOutreach, 150)
        
        // Add SDOH profiles to members
        const membersWithSdoh = addSdohProfiles(mockMembers, mockOutreach)
        
        // Attach cohorts and behavioral types to members
        const membersWithCohorts = attachCohortsAndTypes(membersWithSdoh)
        
        setMembers(membersWithCohorts)
        setOutreach(mockOutreach)
        setAudit(mockAudit)
        setIsLoading(false)
      } catch (error) {
        console.error('Error generating mock data:', error)
        setIsLoading(false)
      }
    }
    
    initializeData()
  }, [])

  // Handle URL-based member selection and initial member selection
  // Only apply member selection when on the Members tab
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'members'
    if (members.length > 0 && currentTab === 'members') {
      const memberIdFromUrl = searchParams.get('member')
      if (memberIdFromUrl && members.some(m => m.id === memberIdFromUrl)) {
        // URL has a valid member ID, use it
        setSelectedMemberId(memberIdFromUrl)
      } else if (!selectedMemberId) {
        // No URL member or invalid member, auto-select first member
        console.log('Auto-selecting first member:', members[0].name, members[0].id)
        setSelectedMemberId(members[0].id)
      }
    } else if (currentTab !== 'members') {
      // Clear member selection when not on Members tab
      setSelectedMemberId(null)
    }
  }, [members, searchParams, selectedMemberId])

  // Handle member selection with URL update
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId)
    // Update URL with member ID
    const params = new URLSearchParams(searchParams.toString())
    params.set('member', memberId)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleAddOutreach = (data: any) => {
    const selectedMember = members.find(m => m.id === selectedMemberId)
    const newOutreach: Outreach = {
      id: `O${String(outreach.length + 1).padStart(4, '0')}`,
      memberId: data.memberId || selectedMemberId || 'M0001',
      memberName: data.memberName || selectedMember?.name || 'Demo Member',
      channel: data.channel,
      status: data.status,
      topic: data.topic,
      timestamp: new Date().toISOString(),
      agent: 'Current User',
      note: data.note,
      team: data.team || 'Member Services',
      purpose: data.purpose || 'AWV'
    }

    setOutreach(prev => [newOutreach, ...prev])
    
    // Add audit entry
    const member = members.find(m => m.id === newOutreach.memberId)
    const newAudit: AuditEntry = {
      id: `A${String(audit.length + 1).padStart(4, '0')}`,
      actor: 'Current User',
      action: 'CREATE_OUTREACH',
      objectType: 'Outreach',
      objectId: newOutreach.id,
      memberId: newOutreach.memberId,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.100',
      details: `Created outreach: ${data.topic}${data.purpose?.startsWith('SDOH') ? ' (SDOH domain)' : ''}`
    }

    setAudit(prev => [newAudit, ...prev])
    
    toast({
      title: "Outreach Added",
      description: `Successfully added ${data.channel} outreach for ${newOutreach.memberName}`,
    })
  }

  const handleMemberAction = (action: string, member: Member) => {
    const newAudit: AuditEntry = {
      id: `A${String(audit.length + 1).padStart(4, '0')}`,
      actor: 'Current User',
      action: action,
      objectType: 'Member',
      objectId: member.id,
      memberId: member.id,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.100',
      details: `${action.replace('_', ' ').toLowerCase()} for member ${member.name}`
    }

    setAudit(prev => [newAudit, ...prev])
    
    toast({
      title: "Action Logged",
      description: `${action.replace('_', ' ')} logged for ${member.name}`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Careleo</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Analytics Dashboard</span>
                </Button>
              </Link>
              <Badge variant="outline" className="text-xs">
                HITRUST-Target
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <LoadingShimmer key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <LoadingShimmer key={i} className="h-64" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue={searchParams.get('tab') || 'members'} className="space-y-6" onValueChange={(value) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('tab', value)
            // Clear member selection when switching away from Members tab
            if (value !== 'members') {
              params.delete('member')
              setSelectedMemberId(null)
            }
            router.replace(`?${params.toString()}`, { scroll: false })
          }}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="outreach" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Outreach</span>
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Cohorts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Audit Trail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6 tab-members">
            <MembersTab
              members={members}
              outreach={outreach}
              selectedMemberId={selectedMemberId}
              onSelectMember={handleSelectMember}
              onAddOutreach={handleAddOutreach}
              onMemberAction={handleMemberAction}
              onNavigateToOutreach={(filters) => {
                const params = new URLSearchParams()
                Object.entries(filters).forEach(([key, value]) => {
                  params.set(key, value)
                })
                router.replace(`?tab=outreach&${params.toString()}`, { scroll: false })
              }}
            />
          </TabsContent>

          <TabsContent value="outreach" className="space-y-6 tab-outreach">
            <OutreachTab
              outreach={outreach}
              members={members}
              onAddOutreach={handleAddOutreach}
              onNavigateToOutreach={(filters) => {
                const params = new URLSearchParams()
                Object.entries(filters).forEach(([key, value]) => {
                  params.set(key, value)
                })
                router.replace(`?tab=outreach&${params.toString()}`, { scroll: false })
              }}
            />
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6 tab-cohorts">
            <CohortsDashboard
              members={members}
              outreach={outreach}
              onAddOutreach={handleAddOutreach}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 tab-analytics">
            <AnalyticsDashboard
              outreach={outreach}
              members={members}
            />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6 tab-audit">
            <AuditTab
              audit={audit}
            />
          </TabsContent>
        </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © Careleo Healthcare CRM • Healthcare Management Platform
          </p>
        </div>
      </footer>

    </div>
  )
}
