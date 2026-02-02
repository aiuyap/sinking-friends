'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  PhilippinePeso, 
  ArrowRight, 
  Users, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

type LoanStatus = 'PENDING' | 'APPROVED' | 'REPAID' | 'REJECTED'
type LoanTab = 'ALL' | 'PENDING' | 'ACTIVE' | 'REPAID' | 'REJECTED'

interface Loan {
  id: string
  groupId: string
  groupName: string
  amount: number
  interestRate: number
  totalInterest: number
  totalDue: number
  totalRepaid: number
  remainingBalance: number
  progress: number
  status: LoanStatus
  termMonths: number
  dueDate: string
  approvedDate: string | null
  createdAt: string
  coMakers: Array<{ id: string; name: string }>
  repaymentCount: number
}

interface LoanStats {
  total: number
  pending: number
  active: number
  repaid: number
  rejected: number
  totalBorrowed: number
  totalRepaid: number
}

const statusConfig: Record<LoanStatus, { color: string; icon: React.ElementType; label: string }> = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: PhilippinePeso, label: 'Active' },
  REPAID: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Repaid' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
}

export default function MyLoansPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [stats, setStats] = useState<LoanStats>({
    total: 0,
    pending: 0,
    active: 0,
    repaid: 0,
    rejected: 0,
    totalBorrowed: 0,
    totalRepaid: 0
  })
  const [selectedTab, setSelectedTab] = useState<LoanTab>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
    if (user) {
      fetchMyLoans()
    }
  }, [user, authLoading])

  const fetchMyLoans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/my-loans')
      
      if (!response.ok) {
        throw new Error('Failed to fetch loans')
      }
      
      const data = await response.json()
      setLoans(data.loans || [])
      setStats(data.stats || {
        total: 0,
        pending: 0,
        active: 0,
        repaid: 0,
        rejected: 0,
        totalBorrowed: 0,
        totalRepaid: 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredLoans = loans.filter(loan => {
    if (selectedTab === 'ALL') return true
    if (selectedTab === 'ACTIVE') return loan.status === 'APPROVED'
    return loan.status === selectedTab
  })

  const tabs: { id: LoanTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: stats.total },
    { id: 'PENDING', label: 'Pending', count: stats.pending },
    { id: 'ACTIVE', label: 'Active', count: stats.active },
    { id: 'REPAID', label: 'Repaid', count: stats.repaid },
    { id: 'REJECTED', label: 'Rejected', count: stats.rejected }
  ]

  if (loading || authLoading) {
    return (
      <DashboardLayout title="My Loans">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Loans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-charcoal-muted mb-1">Total Loans</p>
              <p className="font-display text-2xl text-charcoal">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-charcoal-muted mb-1">Active</p>
              <p className="font-display text-2xl text-sage">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-charcoal-muted mb-1">Total Borrowed</p>
              <p className="font-display text-2xl text-charcoal">{formatCurrency(stats.totalBorrowed)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-charcoal-muted mb-1">Total Repaid</p>
              <p className="font-display text-2xl text-charcoal">{formatCurrency(stats.totalRepaid)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl text-charcoal">Your Loans</h2>
            <p className="text-charcoal-muted">View all your loans across groups</p>
          </div>
          <Button onClick={() => router.push('/groups')}>
            Request New Loan
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchMyLoans} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-sage text-white'
                  : 'bg-white text-charcoal-secondary hover:bg-black/[0.03]'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Loans List */}
        {filteredLoans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PhilippinePeso className="w-8 h-8 text-sage" />
              </div>
              <h3 className="font-display text-xl text-charcoal mb-2">
                {selectedTab === 'ALL' ? 'No Loans Yet' : `No ${selectedTab.toLowerCase()} loans`}
              </h3>
              <p className="text-charcoal-secondary mb-6">
                {selectedTab === 'ALL' 
                  ? 'You haven\'t taken any loans yet. Request your first loan from a group.'
                  : `You don't have any ${selectedTab.toLowerCase()} loans at the moment.`}
              </p>
              <Button onClick={() => router.push('/groups')}>
                Browse Groups
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLoans.map((loan, index) => {
              const StatusIcon = statusConfig[loan.status].icon
              
              return (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <Card 
                    className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
                    onClick={() => router.push(`/groups/${loan.groupId}/loans/${loan.id}`)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center flex-shrink-0">
                            <PhilippinePeso className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-lg text-charcoal truncate">
                              {formatCurrency(loan.amount)}
                            </h3>
                            <p className="text-sm text-charcoal-muted truncate">
                              {loan.groupName}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusConfig[loan.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[loan.status].label}
                        </Badge>
                      </div>

                      {/* Progress (for active loans) */}
                      {loan.status === 'APPROVED' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-charcoal-muted">Repayment Progress</span>
                            <span className="font-mono text-sage">{loan.progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-cream-dim rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-sage rounded-full transition-all"
                              style={{ width: `${loan.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-charcoal-muted">
                              Paid: {formatCurrency(loan.totalRepaid)}
                            </span>
                            <span className="text-charcoal-muted">
                              Remaining: {formatCurrency(loan.remainingBalance)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
                        <div className="flex items-center gap-2 text-sm text-charcoal-muted">
                          {loan.status === 'APPROVED' && (
                            <span>Due Date:</span>
                          )}
                          <span className="font-bold text-charcoal">{formatDate(loan.dueDate)}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-sage" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
