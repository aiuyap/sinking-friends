'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, PieChart, Users, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemberDistribution {
  memberId: string
  memberName?: string
  contributionAmount: number
  interestShare: number
  totalPayout: number
  reason: string
}

interface DistributionReportProps {
  distributions: MemberDistribution[]
  totalPool: number
  totalInterestEarned: number
  totalPayout: number
  isApproved: boolean
  onApprove?: () => void
  className?: string
}

export function DistributionReport({
  distributions,
  totalPool,
  totalInterestEarned,
  totalPayout,
  isApproved,
  onApprove,
  className
}: DistributionReportProps) {
  const [showDetails, setShowDetails] = useState(false)

  const activeMembers = distributions.filter(d => d.reason.includes('Active'))
  const inactiveMembers = distributions.filter(d => d.reason.includes('Inactive'))

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sage" />
              </div>
              <p className="text-sm text-charcoal-muted">Total Pool</p>
            </div>
            <p className="font-display text-3xl text-charcoal">{formatCurrency(totalPool)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-terracotta" />
              </div>
              <p className="text-sm text-charcoal-muted">Total Interest Earned</p>
            </div>
            <p className="font-display text-3xl text-charcoal">{formatCurrency(totalInterestEarned)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-sage" />
              </div>
              <p className="text-sm text-charcoal-muted">Total Payout</p>
            </div>
            <p className="font-display text-3xl text-sage">{formatCurrency(totalPayout)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-charcoal-secondary">Total Members</span>
            <span className="font-mono text-lg text-charcoal">{distributions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-charcoal-secondary">Active Members</span>
            <span className="font-mono text-lg text-success">{activeMembers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-charcoal-secondary">Inactive Members</span>
            <span className="font-mono text-lg text-danger">{inactiveMembers.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Member Distribution Breakdown</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {inactiveMembers.length > 0 && (
            <div className="mt-6 pt-4 border-t border-black/[0.06]">
              <h4 className="font-display text-lg text-charcoal mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-danger" />
                Inactive Members (No Interest Share)
              </h4>
              <div className="space-y-3">
                {inactiveMembers.map((member, index) => (
                  <motion.div
                    key={member.memberId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 50 + (activeMembers.length * 50), duration: 0.3 }}
                    className="bg-cream-dim rounded-lg p-4 opacity-75"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-charcoal-secondary">{member.memberName || 'Unknown'}</p>
                        <p className="text-sm text-charcoal-muted">Member ID: {member.memberId.slice(0, 8)}...</p>
                      </div>
                      <Badge variant="outline">Inactive</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/[0.06]">
                      <div>
                        <p className="text-sm text-charcoal-muted mb-1">Contributions</p>
                        <p className="font-mono text-lg text-charcoal-secondary">{formatCurrency(member.contributionAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-charcoal-muted mb-1">Interest Share</p>
                        <p className="font-mono text-lg text-charcoal-muted">₱0.00</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/[0.06]">
                      <p className="font-display text-xl text-charcoal">
                        Total Payout: {formatCurrency(member.totalPayout)}
                      </p>
                      <p className="text-sm text-danger">{member.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center space-y-4">
          {!isApproved ? (
            <div className="bg-sage-dim rounded-lg p-4">
              <p className="text-sm text-sage mb-3">
                Review the distribution breakdown above carefully before approving.
              </p>
              <Button onClick={onApprove} className="w-full">
                Approve & Execute Distribution
              </Button>
            </div>
          ) : (
            <div className="bg-success-dim rounded-lg p-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <p className="font-display text-xl text-success">Distribution Approved</p>
              </div>
              <p className="text-sm text-charcoal-secondary">
                Payouts have been sent to all members.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
