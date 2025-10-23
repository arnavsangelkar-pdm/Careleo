import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface MockQuickAddProps {
  onAdd: (data: any) => void
  type: 'outreach' | 'member'
  triggerLabel?: string
  className?: string
}

export function MockQuickAdd({ onAdd, type, triggerLabel, className = '' }: MockQuickAddProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    channel: '',
    status: '',
    topic: '',
    note: '',
    memberName: '',
    plan: '',
    vendor: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({
      channel: '',
      status: '',
      topic: '',
      note: '',
      memberName: '',
      plan: '',
      vendor: ''
    })
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (type === 'outreach') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={className}>
            <Plus className="h-4 w-4 mr-2" />
            {triggerLabel || 'Add Outreach'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Outreach</DialogTitle>
            <DialogDescription>
              Create a new outreach entry for member engagement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Channel</label>
                <Select value={formData.channel} onValueChange={(value) => handleInputChange('channel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Portal">Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In-Progress">In-Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="Enter topic"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <Input
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Enter note"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Outreach</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Member form (simplified for demo)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Plus className="h-4 w-4 mr-2" />
          {triggerLabel || 'Add Member'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Create a new member profile in the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Member Name</label>
            <Input
              value={formData.memberName}
              onChange={(e) => handleInputChange('memberName', e.target.value)}
              placeholder="Enter member name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Plan</label>
              <Input
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                placeholder="Enter plan"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Vendor</label>
              <Input
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="Enter vendor"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
