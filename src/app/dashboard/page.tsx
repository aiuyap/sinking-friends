'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Users, Calendar, TrendingUp, Bell, Plus, ArrowRight } from 'lucide-react'
import { PaymentHistoryCard } from '@/components/dashboard/PaymentHistoryCard'
import { mockPaymentHistory } from '@/lib/mock/paymentHistory'

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
  const [groups, setGroups] = useState<Array<{ id: string; name: string; description?: string | null; memberCount?: number; totalPool?: number }>>([])
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
        setGroups(data.groups || [])
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

  const statCards = [
    {
      title: 'Total Pool',
      value: formatCurrency(stats.totalPool),
      icon: DollarSign,
      color: 'sage',
    },
    {
      title: 'Interest Earned',
      value: formatCurrency(stats.totalInterestEarned),
      icon: TrendingUp,
      color: 'terracotta',
    },
    {
      title: 'Active Groups',
      value: stats.activeGroups.toString(),
      icon: Users,
      color: 'sage',
    },
    {
      title: 'Upcoming Contributions',
      value: stats.upcomingContributions.toString(),
      icon: Calendar,
      color: 'terracotta',
    },
  ]

  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 100, duration: 0.5 }}
            >
              <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="flex flex-col items-center justify-between p-6">
                  <div className="w-12 h-12 bg-cream-dim rounded-xl flex items-center justify-center mb-3">
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-muted">{stat.title}</p>
                    <p className="font-display text-2xl text-charcoal">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

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
                  <DollarSign className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
                  <p className="text-charcoal-secondary">No active loans</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                    <span className="text-charcoal-muted">Total Active</span>
                    <span className="font-display text-xl text-charcoal">{stats.activeLoans}</span>
                  </div>
                  <Button onClick={() => router.push('/groups')} variant="outline" className="w-full">
                    View All Loans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History Section - Full Width */}
        <PaymentHistoryCard data={mockPaymentHistory} variant="full-width" />

        {/* Recent Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-charcoal">Your Groups</h2>
            <Button onClick={() => router.push('/groups/new')} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>

          {groups.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-sage" />
                </div>
                <h3 className="font-display text-xl text-charcoal mb-2">No Groups Yet</h3>
                <p className="text-charcoal-secondary mb-6">
                  Create your first sinking fund group and invite friends to start saving together.
                </p>
                <Button onClick={() => router.push('/groups/new')} className="w-full">
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 50, duration: 0.5 }}
                >
                  <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => router.push(`/groups/${group.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg text-charcoal">{group.name}</h3>
                            <p className="text-sm text-charcoal-muted line-clamp-2">
                              {group.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-sage flex-shrink-0" />
                      </div>

                      <div className="space-y-2 pt-4 border-t border-black/[0.06]">
                        <div className="flex items-center gap-2 text-sm text-charcoal-muted">
                          <Users className="w-4 h-4" />
                          <span>{group.memberCount} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-charcoal-muted">
                          <DollarSign className="w-4 h-4" />
                          <span>Pool: {formatCurrency(group.totalPool || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
