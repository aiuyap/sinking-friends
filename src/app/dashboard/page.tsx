'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { PhilippinePeso } from 'lucide-react'
import { PaymentHistoryCard } from '@/components/dashboard/PaymentHistoryCard'
import type { PaymentHistoryItem } from '@/types/payment'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPool: 0,
    totalInterestEarned: 0,
    activeGroups: 0,
    upcomingContributions: 0,
    activeLoans: 0,
    myContributions: 0,
  })
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
    if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {
          totalPool: 0,
          totalInterestEarned: 0,
          activeGroups: 0,
          upcomingContributions: 0,
          activeLoans: 0,
          myContributions: 0,
        })
        setPaymentHistory(data.paymentHistory || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* My Contributions Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">Total This Year</span>
                  <span className="font-display text-2xl text-charcoal">{formatCurrency(stats.myContributions)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-muted">My Groups</span>
                  <span className="font-mono text-lg text-sage">{stats.activeGroups}</span>
                </div>
                <Button onClick={() => router.push('/groups')} className="w-full">
                  Manage Groups
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Loans Card */}
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.activeLoans === 0 ? (
                <div className="text-center py-8">
                  <PhilippinePeso className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
                  <p className="text-charcoal-secondary">No active loans</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                    <span className="text-charcoal-muted">Total Active</span>
                    <span className="font-display text-xl text-charcoal">{stats.activeLoans}</span>
                  </div>
                  <Button onClick={() => router.push('/my-loans')} variant="outline" className="w-full">
                    View All Loans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History Section - Full Width */}
        <PaymentHistoryCard data={paymentHistory} variant="full-width" />
      </motion.div>
    </DashboardLayout>
  )
}
