'use client'

import { cn } from '@/lib/utils'
import { 
  Users, 
  FileText, 
  Bell, 
  CreditCard, 
  Search, 
  FolderOpen,
  Inbox,
  Calendar,
  TrendingUp,
  LucideIcon
} from 'lucide-react'
import { Button } from './Button'

// Pre-defined icons for common empty states
const icons = {
  members: Users,
  documents: FileText,
  notifications: Bell,
  payments: CreditCard,
  search: Search,
  folder: FolderOpen,
  inbox: Inbox,
  calendar: Calendar,
  activity: TrendingUp,
  default: Inbox
}

type IconType = keyof typeof icons

interface EmptyStateProps {
  icon?: IconType | LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon = 'default',
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md'
}: EmptyStateProps) {
  // Determine the icon component
  const IconComponent = typeof icon === 'string' ? icons[icon] : icon

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-10 h-10',
      iconWrapper: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-sm'
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', sizes.container, className)}>
      <div className={cn(
        'rounded-full bg-gray-100 flex items-center justify-center mb-4',
        sizes.iconWrapper
      )}>
        <IconComponent className={cn('text-charcoal-muted', sizes.icon)} />
      </div>
      
      <h3 className={cn('font-semibold text-charcoal mb-1', sizes.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn('text-charcoal-muted max-w-sm mb-6', sizes.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-built empty states for common use cases

export function EmptyMembers({ onInvite }: { onInvite?: () => void }) {
  return (
    <EmptyState
      icon="members"
      title="No members yet"
      description="Invite members to join your group and start saving together."
      action={onInvite ? { label: 'Invite Members', onClick: onInvite } : undefined}
    />
  )
}

export function EmptyLoans({ onRequestLoan }: { onRequestLoan?: () => void }) {
  return (
    <EmptyState
      icon="payments"
      title="No loans yet"
      description="Once members request loans, they'll appear here for review and approval."
      action={onRequestLoan ? { label: 'Request a Loan', onClick: onRequestLoan } : undefined}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="notifications"
      title="All caught up!"
      description="You don't have any notifications right now. We'll let you know when something needs your attention."
    />
  )
}

export function EmptyContributions() {
  return (
    <EmptyState
      icon="calendar"
      title="No contributions yet"
      description="Contributions will appear here as members make their monthly payments."
    />
  )
}

export function EmptySearchResults({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
      action={onClear ? { label: 'Clear Search', onClick: onClear, variant: 'outline' } : undefined}
    />
  )
}

export function EmptyGroups({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="folder"
      title="No groups yet"
      description="Create your first savings group to get started, or wait for an invitation to join one."
      action={onCreate ? { label: 'Create Group', onClick: onCreate } : undefined}
    />
  )
}

export function EmptyActivity() {
  return (
    <EmptyState
      icon="activity"
      title="No recent activity"
      description="Activity from your groups will show up here as things happen."
      size="sm"
    />
  )
}
