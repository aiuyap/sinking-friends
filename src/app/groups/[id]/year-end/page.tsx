'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DistributionReport } from '@/components/contributions/DistributionReport'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, PieChart, Users, ArrowLeft, FileText } from 'lucide-react'

export default function YearEndPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [distributionData, setDistributionData] = useState<any>(null)
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    fetchDistribution()
  }, [groupId])

  const fetchDistribution = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}/year-end`)
      if (response.ok) {
        const data = await response.json()
        setDistributionData(data)
      }
    } catch (error) {
      console.error('Error fetching distribution:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/year-end/distribute`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsApproved(true)
      }
    } catch (error) {
      console.error('Error approving distribution:', error)
    }
  }

  return (
    <DashboardLayout title="Year-End Distribution">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sage"></div>
          </div>
        ) : distributionData ? (
          <div className="space-y-6">
            {/* Warning Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-terracotta-dim rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-charcoal mb-2">
                      Review Before Approving
                    </h3>
                    <p className="text-sm text-charcoal-secondary">
                      Please carefully review the distribution breakdown below before executing. 
                      This action cannot be undone.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-charcoal-secondary">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                        All active loans must be fully repaid before distribution
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                        Year-end date must have passed
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                        Inactive members receive only contributions, no interest share
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                        Interest distribution is proportional to contribution percentage
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-sage" />
                    </div>
                    <p className="text-sm text-charcoal-muted">Total Pool</p>
                  </div>
                  <p className="font-display text-3xl text-charcoal">
                    {formatCurrency(distributionData.totals.totalPool)}
                  </p>
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
                  <p className="font-display text-3xl text-charcoal">
                    {formatCurrency(distributionData.totals.totalInterestEarned)}
                  </p>
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
                  <p className="font-display text-3xl text-sage">
                    {formatCurrency(distributionData.totals.totalPayout)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">Total Members</span>
                  <span className="font-mono text-lg text-charcoal">{distributionData.totals.totalMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">Active Members</span>
                  <span className="font-mono text-lg text-success">{distributionData.totals.activeMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">Inactive Members</span>
                  <span className="font-mono text-lg text-danger">{distributionData.totals.inactiveMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">Year-End Date</span>
                  <span className="font-mono text-lg text-charcoal">
                    {distributionData.group.yearEndDate 
                      ? formatDate(new Date(distributionData.group.yearEndDate))
                      : 'Not set'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Report */}
            <DistributionReport
              distributions={distributionData.distributions}
              totalPool={distributionData.totals.totalPool}
              totalInterestEarned={distributionData.totals.totalInterestEarned}
              totalPayout={distributionData.totals.totalPayout}
              isApproved={isApproved}
              onApprove={handleApprove}
            />

            {/* Approval Actions */}
            <Card>
              <CardContent className="p-6 text-center">
                {!isApproved ? (
                  <div className="space-y-4">
                    <p className="text-sm text-charcoal-secondary mb-4">
                      After approving, payouts will be sent to all members. 
                      This action cannot be undone.
                    </p>
                    <Button
                      onClick={handleApprove}
                      size="lg"
                      className="w-full"
                    >
                      Approve & Execute Distribution
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-16 h-16 bg-success-dim rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-display text-2xl text-success mb-2">
                      Distribution Approved
                    </h3>
                    <p className="text-charcoal-secondary">
                      Payouts have been sent to all members.
                      Members can now withdraw their funds.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-charcoal-secondary">
                Failed to load distribution data. Please try again.
              </p>
              <Button onClick={() => router.push(`/groups/${groupId}`)}>
                Back to Group
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
