'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ContributionList } from '@/components/contributions/ContributionCard'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react'

export default function GroupContributionsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<any[]>([])
  const [group, setGroup] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    missed: 0,
  })

  useEffect(() => {
    fetchContributions()
  }, [groupId])

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}/contributions`)
      if (response.ok) {
        const data = await response.json()
        setContributions(data.contributions || [])
        
        // Calculate stats
        const total = data.contributions.reduce((sum, c) => sum + c.amount, 0)
        const paid = data.contributions.filter(c => c.paidDate).reduce((sum, c) => sum + c.amount, 0)
        const pending = data.contributions.filter(c => !c.paidDate && !c.isMissed).reduce((sum, c) => sum + c.amount, 0)
        const missed = data.contributions.filter(c => c.isMissed).length
        
        setStats({ total, paid, pending, missed })
      }
    } catch (error) {
      console.error('Error fetching contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (contributionId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/contributions/${contributionId}`, {
        method: 'PUT',
      })

      if (response.ok) {
        // Refresh contributions
        fetchContributions()
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  return (
    <DashboardLayout title="Contributions">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
          {group && (
            <div className="text-right">
              <p className="text-sm text-charcoal-muted">Group:</p>
              <p className="font-display text-lg text-charcoal">{group.name}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-sage" />
                </div>
                <p className="text-sm text-charcoal-muted mb-1">Total Contributions</p>
                <p className="font-display text-2xl text-charcoal">{formatCurrency(stats.total)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-success-dim rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <p className="text-sm text-charcoal-muted mb-1">Paid</p>
                <p className="font-display text-2xl text-charcoal">{formatCurrency(stats.paid)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-terracotta" />
                </div>
                <p className="text-sm text-charcoal-muted mb-1">Pending</p>
                <p className="font-display text-2xl text-charcoal">{formatCurrency(stats.pending)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-danger-dim rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-danger" />
                </div>
                <p className="text-sm text-charcoal-muted mb-1">Missed</p>
                <p className="font-display text-2xl text-charcoal">{stats.missed}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contributions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
          </div>
        ) : contributions.length === 0 ? (
          <div className="bg-cream-dim rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-charcoal-muted mx-auto mb-4" />
            <h3 className="font-display text-xl text-charcoal mb-2">No Contributions Yet</h3>
            <p className="text-charcoal-secondary">
              Your contribution schedule will appear here once the group is active.
            </p>
          </div>
        ) : (
          <ContributionList
            contributions={contributions}
            onMarkAsPaid={handleMarkAsPaid}
          />
        )}
      </motion.div>
    </DashboardLayout>
  )
}
