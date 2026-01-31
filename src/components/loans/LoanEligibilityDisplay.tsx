import React from 'react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingUp, Calendar, Wallet } from 'lucide-react'

interface LoanEligibilityDisplayProps {
  eligibility: {
    maxLoan: number
    monthlyContribution: number
    avgAnnualSavings: number
    activeMonths: number
    breakdown: {
      option1: number
      option2: number
    }
  }
  className?: string
}

export function LoanEligibilityDisplay({ eligibility, className }: LoanEligibilityDisplayProps) {
  const { maxLoan, monthlyContribution, avgAnnualSavings, activeMonths, breakdown } = eligibility

  return (
    <div className={cn('bg-cream-dim rounded-xl p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-charcoal">Loan Eligibility</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-sage/10 rounded-full">
          <Calendar className="w-4 h-4 text-sage" />
          <span className="text-sm font-mono text-sage">{activeMonths} months active</span>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-charcoal-muted mb-2">Maximum Loan Amount</p>
        <p className="font-display text-4xl text-charcoal">{formatCurrency(maxLoan)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.06]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-charcoal-muted">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Monthly Contribution</span>
          </div>
          <p className="font-mono text-lg text-charcoal">{formatCurrency(monthlyContribution)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-charcoal-muted">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Avg Annual Savings</span>
          </div>
          <p className="font-mono text-lg text-charcoal">{formatCurrency(avgAnnualSavings)}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-black/[0.06]">
        <p className="text-sm text-charcoal-muted mb-2">Calculation Breakdown</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-secondary">Monthly Contribution</span>
            <span className="font-mono text-charcoal">{formatCurrency(breakdown.option1)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-secondary">50% of Avg Annual Savings</span>
            <span className="font-mono text-charcoal">{formatCurrency(breakdown.option2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-medium pt-2">
            <span className="text-sage">
              {activeMonths < 6 ? 'MIN' : 'MAX'} of above options
            </span>
            <span className="font-mono text-sage">{formatCurrency(maxLoan)}</span>
          </div>
        </div>
      </div>

      <div className={cn(
        'text-center py-2 px-4 rounded-lg text-sm',
        activeMonths < 6 
          ? 'bg-terracotta-dim text-terracotta' 
          : 'bg-sage-dim text-sage'
      )}>
        {activeMonths < 6 
          ? 'New member: Lower limit for 6 months, then higher'
          : 'Long-term member: Higher limit for 6+ months'}
      </div>
    </div>
  )
}
