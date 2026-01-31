'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Users, DollarSign, Calendar, Plus, Settings, TrendingUp, FileText } from 'lucide-react'
import LoanRequestForm from '@/components/loans/LoanRequestForm'

type Tab = 'overview' | 'members' | 'loans' | 'contributions' | 'year-end'

export default function GroupDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<any>(null)
  const [showLoanModal, setShowLoanModal] = useState(false)

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data.group)
      }
    } catch (error) {
      console.error('Error fetching group:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={group?.name || 'Group Details'}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    )
  }

  const isAdmin = group?.ownerId === user?.uid
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'loans', label: 'Loans' },
    { id: 'contributions', label: 'Contributions' },
    ...(isAdmin ? [{ id: 'year-end', label: 'Year-End' }] : []),
  ]

  return (
    <DashboardLayout title={group?.name || 'Group Details'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Group Info Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="font-display text-3xl text-charcoal mb-2">{group?.name || 'Loading...'}</h1>
                <p className="text-charcoal-secondary line-clamp-2">
                  {group?.description || 'No description'}
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                {isAdmin && (
                  <Badge variant="default">
                    Admin
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-black/[0.06]">
              <div className="text-center">
                <p className="text-sm text-charcoal-muted mb-1">Interest Rate (Members)</p>
                <p className="font-display text-xl text-charcoal">{group?.loanInterestRateMember || 5}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-charcoal-muted mb-1">Interest Rate (Non-Members)</p>
                <p className="font-display text-xl text-charcoal">{group?.loanInterestRateNonMember || 10}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-charcoal-muted mb-1">Loan Term</p>
                <p className="font-display text-xl text-charcoal">{group?.termDuration || 2} months</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-charcoal-muted mb-1">Year-End</p>
                <p className="font-mono text-lg text-charcoal">
                  {group?.settings?.yearEndDate 
                    ? formatDate(new Date(group.settings.yearEndDate))
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-black/[0.06]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-sage border-b-2 border-sage' 
                    : 'text-charcoal-muted border-b-2 border-transparent hover:border-black/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Pool Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-6 h-6 text-sage" />
                      </div>
                      <p className="text-sm text-charcoal-muted mb-1">Total Pool</p>
                      <p className="font-display text-2xl text-charcoal">{formatCurrency(group?.totalPool || 0)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-terracotta-dim rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-terracotta" />
                      </div>
                      <p className="text-sm text-charcoal-muted mb-1">Total Members</p>
                      <p className="font-display text-2xl text-charcoal">{group?.memberCount || 0}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-sage" />
                      </div>
                      <p className="text-sm text-charcoal-muted mb-1">Interest Earned</p>
                      <p className="font-display text-2xl text-charcoal">{formatCurrency(group?.totalInterest || 0)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Button onClick={() => setShowLoanModal(true)} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Request Loan
                      </Button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Button onClick={() => router.push(`/groups/${groupId}/members`)} variant="outline" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Members
                        </Button>
                        <Button onClick={() => router.push(`/groups/${groupId}/contributions`)} variant="outline" className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          View Contributions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-charcoal">Group Members</h2>
                  {isAdmin && (
                    <Button onClick={() => router.push(`/groups/${groupId}/members`)} size="sm">
                      Manage All
                    </Button>
                  )}
                </div>
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="w-16 h-16 text-charcoal-muted mx-auto mb-3" />
                    <h3 className="font-display text-xl text-charcoal mb-2">Coming Soon</h3>
                    <p className="text-charcoal-secondary">
                      Member management features will be available soon.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'loans' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-charcoal">Active Loans</h2>
                  <Button onClick={() => setShowLoanModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Request Loan
                  </Button>
                </div>
                <Card className="text-center py-12">
                  <CardContent>
                    <DollarSign className="w-16 h-16 text-charcoal-muted mx-auto mb-3" />
                    <h3 className="font-display text-xl text-charcoal mb-2">Coming Soon</h3>
                    <p className="text-charcoal-secondary">
                      Loan management features will be available soon.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'contributions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-charcoal">Contributions</h2>
                  <Button onClick={() => router.push(`/groups/${groupId}/contributions`)} variant="outline">
                    View All
                  </Button>
                </div>
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="w-16 h-16 text-charcoal-muted mx-auto mb-3" />
                    <h3 className="font-display text-xl text-charcoal mb-2">Coming Soon</h3>
                    <p className="text-charcoal-secondary">
                      Contribution management features will be available soon.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'year-end' && isAdmin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-charcoal">Year-End Distribution</h2>
                  <Button onClick={() => router.push(`/groups/${groupId}/year-end`)} variant="outline">
                    Manage
                  </Button>
                </div>
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-16 h-16 text-charcoal-muted mx-auto mb-3" />
                    <h3 className="font-display text-xl text-charcoal mb-2">Coming Soon</h3>
                    <p className="text-charcoal-secondary">
                      Year-end distribution features will be available soon.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Loan Request Modal */}
        <LoanRequestForm groupId={groupId} />
      </motion.div>
    </DashboardLayout>
  )
}
