'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  generateMockMembers, 
  generateMockOutreach, 
  generateMockAudit,
  type Member,
  type Outreach,
  type AuditEntry
} from '@/lib/mock'
import { MembersTab } from './MembersTab'
import { OutreachTab } from './OutreachTab'
import { AnalyticsTab } from './AnalyticsTab'
import { AuditTab } from './AuditTab'
import { CohortsDashboard } from './cohorts/CohortsDashboard'
import { Shield, Users, MessageSquare, BarChart3, FileText, Target } from 'lucide-react'
import { LoadingShimmer } from './LoadingShimmer'

export default function MockHealthcareCRM() {
  const [members, setMembers] = useState<Member[]>([])
  const [outreach, setOutreach] = useState<Outreach[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Initialize mock data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        // Generate a large dataset for realistic demo
        const mockMembers = generateMockMembers(1847)
        const mockOutreach = generateMockOutreach(mockMembers, 1847)
        const mockAudit = generateMockAudit(mockMembers, mockOutreach, 200)
        
        setMembers(mockMembers)
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

  const handleAddOutreach = (data: any) => {
    const newOutreach: Outreach = {
      id: `O${String(outreach.length + 1).padStart(4, '0')}`,
      memberId: data.memberId || selectedMember?.id || 'M0001',
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
      vendor: member?.vendor || selectedMember?.vendor || 'Demo Vendor',
      details: `Created outreach: ${data.topic}`
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
      vendor: member.vendor,
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
                  <h1 className="text-xl font-bold text-gray-900">Careleo Insurer CRM</h1>
                  <p className="text-sm text-gray-500">Healthcare CRM Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
          <Tabs defaultValue="members" className="space-y-6">
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

          <TabsContent value="members" className="space-y-6">
            <MembersTab
              members={members}
              outreach={outreach}
              selectedMember={selectedMember}
              onSelectMember={setSelectedMember}
              onAddOutreach={handleAddOutreach}
              onMemberAction={handleMemberAction}
            />
          </TabsContent>

          <TabsContent value="outreach" className="space-y-6">
            <OutreachTab
              outreach={outreach}
              members={members}
              onAddOutreach={handleAddOutreach}
            />
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6">
            <CohortsDashboard
              members={members}
              outreach={outreach}
              onAddOutreach={handleAddOutreach}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab
              outreach={outreach}
              members={members}
            />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
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
            © Careleo Insurer CRM • Healthcare Management Platform
          </p>
        </div>
      </footer>

    </div>
  )
}
