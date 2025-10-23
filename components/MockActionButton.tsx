import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface MockActionButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  badge?: string
  disabled?: boolean
  className?: string
}

export function MockActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'outline',
  size = 'default',
  badge,
  disabled = false,
  className = ''
}: MockActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`relative ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
      {badge && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {badge}
        </Badge>
      )}
    </Button>
  )
}
