'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, DollarSign, ArrowRight, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalGroups: 0,
    totalMembers: 0,
    pendingInvites: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      setGroups(data.groups || [])
      setStats(data.stats || {
        totalBalance: 0,
        totalGroups: 0,
        totalMembers: 0,
        pendingInvites: 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(stats.totalBalance),
      icon: DollarSign,
      color: 'sage',
    },
    {
      title: 'Active Groups',
      value: stats.totalGroups,
      icon: Users,
      color: 'terracotta',
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'sage',
    },
    {
      title: 'Pending Invites',
      value: stats.pendingInvites,
      icon: TrendingUp,
      color: 'terracotta',
    },
  ]

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardContent className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'sage' ? 'bg-sage-dim' : 'bg-terracotta-dim'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'sage' ? 'text-sage' : 'text-terracotta'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-charcoal-muted">{stat.title}</p>
                  <p className="font-display text-2xl text-charcoal">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Groups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl text-charcoal">Your Groups</h2>
          <Button onClick={() => router.push('/groups/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Group
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-sage" />
              </div>
              <h3 className="font-display text-xl text-charcoal mb-2">No groups yet</h3>
              <p className="text-charcoal-secondary mb-6 max-w-md mx-auto">
                Create your first sinking fund group and invite friends to start managing wealth together.
              </p>
              <Button onClick={() => router.push('/groups/new')}>
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: any, index: number) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-sage-dim rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-sage" />
                      </div>
                      <Badge variant={group.role === 'ADMIN' ? 'default' : 'outline'}>
                        {group.role}
                      </Badge>
                    </div>
                    <CardTitle>{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal-secondary text-sm mb-4 line-clamp-2">
                      {group.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-charcoal-muted">
                        <Users className="w-4 h-4" />
                        <span>{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1 text-sage font-medium">
                        <span>View</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
