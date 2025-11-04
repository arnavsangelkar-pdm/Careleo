'use client'

import React, { useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MockActionButton } from '../MockActionButton'
import { MockQuickAdd } from '../MockQuickAdd'
import { SDOH_SCALES } from '@/lib/constants'
import { Info } from 'lucide-react'

// Lazy load the OutreachTimeline component for better performance
const OutreachTimeline = lazy(() => import('./OutreachTimeline').then(module => ({ default: module.OutreachTimeline })))
import { 
  getRiskBadgeVariant, 
  getRiskLabel,
  type Member,
  type Outreach
} from '@/lib/mock'
import { 
  touchesPerMember, 
  monthOverMonth, 
  getHraOutreach
} from '@/lib/metrics'
import { preferChannelFor } from '@/lib/sdoh'
import { CohortChips } from './CohortChips'
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Calendar,
  User,
  Activity,
  Heart,
  Home,
  Car,
  Zap,
  Brain,
  MapPin,
  Wifi,
  Globe
} from 'lucide-react'

interface MemberProfileProps {
  members: Member[]
  selectedMemberId: string | null
  outreach: Outreach[]
  onAddOutreach: (data: any) => void
  onMemberAction: (action: string, member: Member) => void
  isMobile?: boolean
}

export function MemberProfile({
  members,
  selectedMemberId,
  outreach,
  onAddOutreach,
  onMemberAction,
  isMobile = false
}: MemberProfileProps) {
  
  // Derive member from selectedMemberId
  const member = React.useMemo(
    () => members.find(m => m.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )
  const profileRef = useRef<HTMLDivElement>(null)

  // Focus management for accessibility
  useEffect(() => {
    if (member && profileRef.current && !isMobile) {
      const heading = profileRef.current.querySelector('h2')
      if (heading) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
          heading.focus()
        }, 100)
      }
    }
  }, [member, isMobile])

  // Announce member selection to screen readers
  useEffect(() => {
    if (member) {
      const announcement = `Selected member: ${member.name}, Abrasion Risk level: ${member.risk}`
      // Create a live region for screen reader announcements
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      liveRegion.textContent = announcement
      document.body.appendChild(liveRegion)
      
      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion)
      }, 1000)
    }
  }, [member])

  // Memoize expensive derived data for the selected member
  const memberData = useMemo(() => {
    if (!member) return null

    return {
      // Basic member info
      basicInfo: {
        name: member.name,
        id: member.id,
        dob: member.dob,
        plan: member.plan,
        vendor: member.vendor,
        phone: member.phone,
        email: member.email,
        risk: member.risk,
        conditions: member.conditions,
        planInfo: member.planInfo,
        memberType: member.memberType
      },
      // SDOH data
      sdoh: member.sdoh ? {
        socialRiskScore: member.sdoh.socialRiskScore,
        needs: member.sdoh.needs,
        areaContext: member.sdoh.areaContext,
        recommendedResources: member.sdoh.recommendedResources
      } : null,
      // Outreach data for this member
      memberOutreach: outreach.filter(o => o.memberId === member.id)
    }
  }, [member, outreach])

  const handleActionClick = (action: string) => {
    if (member) {
      onMemberAction(action, member)
    }
  }

  if (!member || !memberData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Select a member</p>
          <p className="text-sm">Choose a member from the directory to view their profile</p>
        </div>
      </div>
    )
  }

  const { basicInfo, sdoh, memberOutreach } = memberData

  // Calculate member-specific metrics
  const memberTouchpoints30d = touchesPerMember(memberOutreach, [member], 30)
  const memberTouchpoints60d = touchesPerMember(memberOutreach, [member], 60)
  const momTouchpoints = monthOverMonth(memberTouchpoints30d, memberTouchpoints60d)
  
  const memberHraTouches30d = getHraOutreach(memberOutreach).filter(o => {
    const touchDate = new Date(o.timestamp)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    return touchDate >= cutoffDate
  }).length
  
  const memberHraTouches60d = getHraOutreach(memberOutreach).filter(o => {
    const touchDate = new Date(o.timestamp)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 60)
    return touchDate >= cutoffDate
  }).length
  
  const momHraTouches = monthOverMonth(memberHraTouches30d, memberHraTouches60d)

  return (
    <div 
      ref={profileRef}
      className="h-full space-y-6 focus:outline-none p-6"
      role="region"
      aria-label="Member profile"
      aria-live="polite"
    >
      {/* Member Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Member Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 
              className="font-semibold text-lg focus:outline-none"
              tabIndex={-1}
              aria-describedby="member-basic-info"
            >
              {basicInfo.name}
            </h2>
            <div id="member-basic-info" className="sr-only">
              Member profile for {basicInfo.name}, ID: {basicInfo.id}
            </div>
            <p className="text-sm text-gray-500">{basicInfo.id}</p>
            {member.cohorts && member.cohorts.length > 0 && (
              <div className="mt-2">
                <CohortChips ids={member.cohorts} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <p className="text-sm">{basicInfo.dob}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">HContract</label>
              <p className="text-sm font-medium">{basicInfo.planInfo.contractId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">PBP</label>
              <p className="text-sm">{basicInfo.planInfo.pbp}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Member Type</label>
              <p className="text-sm">{basicInfo.memberType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Contact</label>
              <p className="text-sm">{basicInfo.phone}</p>
              <p className="text-sm">{basicInfo.email}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Risk Assessment</label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getRiskBadgeVariant(basicInfo.risk)}>
                {basicInfo.risk}
              </Badge>
              <span className="text-sm text-gray-600">
                {getRiskLabel(basicInfo.risk)}
              </span>
            </div>
          </div>

          {basicInfo.conditions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Conditions</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {basicInfo.conditions.map((condition) => (
                  <Badge key={condition} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Engagement Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{memberTouchpoints30d}</div>
              <div className="text-sm text-gray-600">Avg Touchpoints / Member (30d)</div>
              <div className="text-xs text-gray-500">
                MoM {momTouchpoints.direction === 'up' ? '+' : momTouchpoints.direction === 'down' ? '-' : ''}{momTouchpoints.deltaPct}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{memberHraTouches30d}</div>
              <div className="text-sm text-gray-600">HRA Touches (30d)</div>
              <div className="text-xs text-gray-500">
                MoM {momHraTouches.direction === 'up' ? '+' : momHraTouches.direction === 'down' ? '-' : ''}{momHraTouches.deltaPct}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{basicInfo.risk}</div>
              <div className="text-sm text-gray-600">Abrasion Risk Score</div>
              <div className="text-xs text-gray-500">{getRiskLabel(basicInfo.risk)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDOH & Context Card */}
      {sdoh && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>SDOH & Context</span>
            </CardTitle>
          </CardHeader>
          <TooltipProvider>
            <CardContent className="space-y-4">
              {/* Social Risk Meter */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  Social Risk Score
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center p-0 border-0 bg-transparent cursor-help">
                        <Info className="h-3 w-3 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{SDOH_SCALES["Social Risk Score"] ?? "Higher score indicates higher need."}</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        sdoh.socialRiskScore <= 40 ? 'bg-green-500' :
                        sdoh.socialRiskScore <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${sdoh.socialRiskScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {sdoh.socialRiskScore}
                  </span>
                </div>
              </div>

              {/* Top 2 Needs */}
              <div>
                <label className="text-sm font-medium text-gray-600">Top Needs</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(sdoh.needs)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 2)
                    .map(([need, score]) => {
                      const icons = { 
                        economicInstability: Heart, 
                        foodInsecurity: Heart, 
                        housingAndNeighborhood: Home, 
                        healthcareAccess: Heart, 
                        education: Brain, 
                        socialAndCommunity: Heart 
                      }
                      const labels = {
                        economicInstability: 'Economic',
                        foodInsecurity: 'Food',
                        housingAndNeighborhood: 'Housing',
                        healthcareAccess: 'Healthcare',
                        education: 'Education',
                        socialAndCommunity: 'Social'
                      }
                      const labelKeys = {
                        economicInstability: 'Economic Instability',
                        foodInsecurity: 'Food Insecurity',
                        housingAndNeighborhood: 'Housing and Neighborhood',
                        healthcareAccess: 'Healthcare Access',
                        education: 'Education',
                        socialAndCommunity: 'Social and Community'
                      }
                      const Icon = icons[need as keyof typeof icons]
                      const label = labels[need as keyof typeof labels]
                      const labelKey = labelKeys[need as keyof typeof labelKeys]
                      const scaleText = SDOH_SCALES[labelKey] ?? "Higher score indicates higher need."
                      return (
                        <Tooltip key={need}>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 cursor-help">
                              <Icon className="h-3 w-3 mr-1" />
                              <span>{label}</span>
                              <span className="ml-1">({score})</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{scaleText}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                </div>
              </div>

              {/* Area Context */}
              <div>
                <label className="text-sm font-medium text-gray-600">Area Context</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center space-x-1 text-xs">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{sdoh.areaContext.zipCode}</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="flex items-center space-x-1 text-xs cursor-help border-0 bg-transparent p-0">
                        <span>ADI: {sdoh.areaContext.adi}/10</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{SDOH_SCALES["ADI"] ?? "Higher score indicates greater deprivation."}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="flex items-center space-x-1 text-xs cursor-help border-0 bg-transparent p-0">
                        <span>SVI: {sdoh.areaContext.svi}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{SDOH_SCALES["SVI"] ?? "Higher score indicates greater vulnerability."}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center space-x-1 text-xs">
                    <Wifi className="h-3 w-3 text-gray-400" />
                    <span>{sdoh.areaContext.broadbandAccess}%</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs col-span-2">
                    <Globe className="h-3 w-3 text-gray-400" />
                    <span>{sdoh.areaContext.primaryLanguage}</span>
                  </div>
                </div>
              </div>

            {/* Recommended Resources */}
            {sdoh.recommendedResources.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Recommended Resources</label>
                <div className="space-y-2 mt-1">
                  {sdoh.recommendedResources.map((resource) => (
                    <div key={resource.id} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-gray-600">{resource.description}</div>
                      <div className="text-gray-500">{resource.contactInfo}</div>
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    const topNeed = Object.entries(sdoh.needs)
                      .sort(([,a], [,b]) => b - a)[0][0]
                    const purposeMap = {
                      economicInstability: 'SDOH—Economic Instability',
                      foodInsecurity: 'SDOH—Food Insecurity',
                      housingAndNeighborhood: 'SDOH—Housing and Neighborhood',
                      healthcareAccess: 'SDOH—Healthcare Access',
                      education: 'SDOH—Education',
                      socialAndCommunity: 'SDOH—Social and Community'
                    }
                    onAddOutreach({
                      memberId: basicInfo.id,
                      memberName: basicInfo.name,
                      channel: preferChannelFor(member),
                      status: 'Planned',
                      topic: `Resource Referral - ${sdoh.recommendedResources[0].name}`,
                      note: `Referral to ${sdoh.recommendedResources[0].name} for ${topNeed} support`,
                      team: 'Community Partnerships',
                      purpose: purposeMap[topNeed as keyof typeof purposeMap] || 'SDOH—Economic Instability'
                    })
                  }}
                >
                  Refer (Mock)
                </Button>
              </div>
            )}
            </CardContent>
          </TooltipProvider>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MockActionButton
            icon={Phone}
            label="HRA Completion"
            onClick={() => {
              onAddOutreach({
                memberId: basicInfo.id,
                memberName: basicInfo.name,
                channel: 'Call',
                status: 'Planned',
                topic: 'Health Risk Assessment - Completion Follow-up',
                note: 'Following up on incomplete HRA assessment',
                team: 'Quality',
                purpose: 'HRA Completion'
              })
            }}
            variant="default"
            size="sm"
            className="w-full"
          />
          <MockActionButton
            icon={MessageSquare}
            label="HRA Reminder"
            onClick={() => {
              onAddOutreach({
                memberId: basicInfo.id,
                memberName: basicInfo.name,
                channel: 'SMS',
                status: 'Planned',
                topic: 'Health Risk Assessment - Reminder',
                note: 'Reminding member to complete HRA assessment',
                team: 'Member Services',
                purpose: 'HRA Reminder'
              })
            }}
            variant="outline"
            size="sm"
            className="w-full"
          />
          <MockQuickAdd
            type="outreach"
            onAdd={onAddOutreach}
            triggerLabel="Add HRA Outreach"
            className="w-full"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              // This will be handled by the parent component
              window.location.href = `?tab=outreach&member=${basicInfo.id}`
            }}
          >
            View all outreach for this member
          </Button>
        </CardContent>
      </Card>

      {/* Outreach Timeline */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Outreach Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading timeline...</span>
            </div>
          }>
            <OutreachTimeline member={member} outreach={memberOutreach} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
