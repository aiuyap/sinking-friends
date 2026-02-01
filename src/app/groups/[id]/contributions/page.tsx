'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, DollarSign, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Contribution {
  id: string
  memberName: string
  scheduledDate: string
  paidDate?: string
  amount: number
  isMissed: boolean
}

export default function GroupContributionsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<Contribution[]>([])
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
        const total = (data.contributions || []).reduce((sum: number, c: any) => sum + c.amount, 0)
        const paid = (data.contributions || []).filter((c: any) => c.paidDate).reduce((sum: number, c: any) => sum + c.amount, 0)
        const pending = (data.contributions || []).filter((c: any) => !c.paidDate && !c.isMissed).reduce((sum: number, c: any) => sum + c.amount, 0)
        const missed = (data.contributions || []).filter((c: any) => c.isMissed).length
        
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

  const getStatusConfig = (contribution: Contribution) => {
    if (contribution.isMissed) {
      return { 
        label: 'Missed', 
        color: 'text-red-600 bg-red-50',
        icon: AlertCircle
      }
    }
    if (contribution.paidDate) {
      return { 
        label: 'Paid', 
        color: 'text-green-600 bg-green-50',
        icon: CheckCircle
      }
    }
    return { 
      label: 'Pending', 
      color: 'text-yellow-600 bg-yellow-50',
      icon: Clock
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
                  <AlertCircle className="w-5 h-5 text-danger" />
                </div>
                <p className="text-sm text-charcoal-muted mb-1">Missed</p>
                <p className="font-display text-2xl text-charcoal">{stats.missed}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contributions Table */}
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
          <Card>
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs text-charcoal-muted uppercase tracking-wider font-medium border-b border-black/[0.08] bg-gray-50/50">
                <div className="col-span-3">Member</div>
                <div className="col-span-3">Scheduled Date</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-black/[0.04]">
                {contributions.map((contribution, index) => {
                  const status = getStatusConfig(contribution)
                  const StatusIcon = status.icon

                  return (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-12 gap-3 px-6 py-4 text-sm items-center hover:bg-black/[0.02] transition-colors"
                    >
                      <div className="col-span-3">
                        <p className="font-medium text-charcoal">{contribution.memberName}</p>
                      </div>
                      <div className="col-span-3 text-charcoal-secondary">
                        {formatDate(new Date(contribution.scheduledDate))}
                      </div>
                      <div className="col-span-2 text-right font-mono text-charcoal">
                        {formatCurrency(contribution.amount)}
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        {!contribution.paidDate && !contribution.isMissed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(contribution.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
