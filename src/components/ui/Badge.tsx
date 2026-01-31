import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline'
  className?: string
  onClick?: () => void
}

export function Badge({
  children,
  variant = 'default',
  className,
  onClick
}: BadgeProps) {
  const variants = {
    default: 'bg-sage-dim text-sage',
    success: 'bg-success-dim text-success',
    warning: 'bg-terracotta-dim text-terracotta',
    danger: 'bg-danger-dim text-danger',
    outline: 'border border-sage text-sage bg-transparent',
  }

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {children}
    </span>
  )
}