import React from 'react'
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency, isPastDate, getDaysBetween } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, CheckCircle, AlertCircle, PhilippinePeso } from 'lucide-react'

interface Contribution {
  id: string
  scheduledDate: Date
  paidDate?: Date
  amount: number
  isMissed: boolean
  gracePeriodEnd?: Date
  note?: string
}

interface ContributionCardProps {
  contribution: Contribution
  onMarkAsPaid?: (id: string) => void
  className?: string
}

export function ContributionCard({ contribution, onMarkAsPaid, className }: ContributionCardProps) {
  const isOverdue = contribution.paidDate === undefined && contribution.gracePeriodEnd && new Date() > contribution.gracePeriodEnd
  const isWithinGrace = contribution.paidDate === undefined && contribution.gracePeriodEnd && new Date() <= contribution.gracePeriodEnd

  return (
    <Card className={cn('transition-all duration-200', isOverdue && 'border-danger/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {contribution.isMissed ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-danger" />
                <Badge variant="danger">Missed</Badge>
              </div>
            ) : contribution.paidDate ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <Badge variant="success">Paid</Badge>
              </div>
            ) : isWithinGrace ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-terracotta" />
                <Badge variant="warning">In Grace Period</Badge>
              </div>
            ) : isOverdue ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-danger" />
                <Badge variant="danger">Overdue</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-charcoal-muted" />
                <Badge variant="outline">Scheduled</Badge>
              </div>
            )}
          </div>

          {onMarkAsPaid && !contribution.paidDate && !contribution.isMissed && (
            <button
              onClick={() => onMarkAsPaid(contribution.id)}
              className="px-3 py-2 bg-sage text-white rounded-lg text-sm font-medium hover:bg-sage-hover transition-colors"
            >
              Mark as Paid
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-charcoal-muted">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Scheduled Date</span>
            </div>
            <span className="font-medium text-charcoal">{formatDate(contribution.scheduledDate)}</span>
          </div>

          {contribution.gracePeriodEnd && !contribution.paidDate && !contribution.isMissed && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-muted">Grace Period Ends</span>
              <span className={cn(
                'font-medium',
                isPastDate(contribution.gracePeriodEnd) ? 'text-danger' : 'text-terracotta'
              )}>
                {formatDate(contribution.gracePeriodEnd)}
              </span>
            </div>
          )}

          {contribution.paidDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-muted">Paid Date</span>
              <span className="font-medium text-success">{formatDate(contribution.paidDate)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
            <div className="flex items-center gap-2 text-charcoal">
              <PhilippinePeso className="w-4 h-4 text-sage" />
              <span className="text-sm">Amount</span>
            </div>
            <span className="font-display text-2xl text-charcoal">{formatCurrency(contribution.amount)}</span>
          </div>

          {contribution.note && (
            <div className="pt-2 border-t border-black/[0.06]">
              <p className="text-sm text-charcoal-muted">{contribution.note}</p>
            </div>
          )}

          {isOverdue && contribution.gracePeriodEnd && getDaysBetween(contribution.gracePeriodEnd, new Date()) > 0 && (
            <div className="mt-3 p-3 bg-danger-dim rounded-lg">
              <p className="text-sm text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {getDaysBetween(contribution.gracePeriodEnd, new Date())} days overdue. Please mark as paid as soon as possible to avoid penalty.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ContributionList({ 
  contributions, 
  onMarkAsPaid,
  className 
}: { 
  contributions: Contribution[]
  onMarkAsPaid?: (id: string) => void
  className?: string
}) {
  if (contributions.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Calendar className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
        <h3 className="font-display text-xl text-charcoal mb-2">No Contributions Yet</h3>
        <p className="text-charcoal-secondary">
          Your contribution schedule will appear here once you join a group.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {contributions.map((contribution, index) => (
        <div
          key={contribution.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-in"
        >
          <ContributionCard
            contribution={contribution}
            onMarkAsPaid={onMarkAsPaid}
          />
        </div>
      ))}
    </div>
  )
}
