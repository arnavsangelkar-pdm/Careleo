'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ABRASION_BUCKETS } from '@/lib/constants'
import { X, Filter } from 'lucide-react'

interface MembersFiltersSidebarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  abrasionFilter: string
  onAbrasionChange: (value: string) => void
  recentFilter: string
  onRecentChange: (value: string) => void
  planFilter: string
  onPlanChange: (value: string) => void
  onClearFilters: () => void
  activeFilterCount: number
  allPlans: string[]
}

export function MembersFiltersSidebar({
  searchQuery,
  onSearchChange,
  abrasionFilter,
  onAbrasionChange,
  recentFilter,
  onRecentChange,
  planFilter,
  onPlanChange,
  onClearFilters,
  activeFilterCount,
  allPlans
}: MembersFiltersSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFilterCount}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="Name, ID, email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Abrasion Risk Bucket */}
        <div>
          <label className="text-sm font-medium mb-2 block">Abrasion Risk</label>
          <Select value={abrasionFilter} onValueChange={onAbrasionChange}>
            <SelectTrigger>
              <SelectValue placeholder="All risk levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Risk Levels</SelectItem>
              {ABRASION_BUCKETS.map(bucket => (
                <SelectItem key={bucket.key} value={bucket.key}>
                  {bucket.label} ({bucket.min}-{bucket.max})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recent Outreach */}
        <div>
          <label className="text-sm font-medium mb-2 block">Recent Outreach</label>
          <Select value={recentFilter} onValueChange={onRecentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any Time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Plan</label>
          <Select value={planFilter} onValueChange={onPlanChange}>
            <SelectTrigger>
              <SelectValue placeholder="All plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Plans</SelectItem>
              {allPlans.map(plan => (
                <SelectItem key={plan} value={plan}>{plan}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

