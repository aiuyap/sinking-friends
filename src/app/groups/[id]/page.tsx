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
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Calendar, 
  Plus, 
  Settings, 
  TrendingUp, 
  FileText,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import LoanRequestForm from '@/components/loans/LoanRequestForm'
import { MemberCard } from '@/components/members/MemberCard'
import { LoanCard } from '@/components/loans/LoanCard'
import { InviteMemberModal } from '@/components/members/InviteMemberModal'

type Tab = 'overview' | 'rules' | 'members' | 'loans' | 'contributions' | 'year-end'

// Mock data for demo
const mockMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatarUrl: '', status: 'active' as const, contribution: 2500, totalContributions: 45000, nextPayday: new Date('2026-02-15') },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatarUrl: '', status: 'active' as const, contribution: 3000, totalContributions: 54000, nextPayday: new Date('2026-02-14') },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatarUrl: '', status: 'inactive' as const, contribution: 2000, totalContributions: 28000, nextPayday: new Date('2026-02-20') },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', avatarUrl: '', status: 'active' as const, contribution: 2500, totalContributions: 37500, nextPayday: new Date('2026-02-15') },
]

const mockLoans = [
  { id: '1', amount: 15000, borrowerName: 'John Doe', status: 'APPROVED' as const, interestRate: 5, dueDate: new Date('2026-04-01'), totalInterest: 1500 },
  { id: '2', amount: 8000, borrowerName: 'Jane Smith', status: 'PENDING' as const, interestRate: 5, dueDate: new Date('2026-05-01'), totalInterest: 800 },
  { id: '3', amount: 20000, borrowerName: 'External Borrower', status: 'APPROVED' as const, interestRate: 10, dueDate: new Date('2026-03-15'), totalInterest: 4000 },
]

const mockContributions = [
  { id: '1', memberName: 'John Doe', amount: 2500, scheduledDate: new Date('2026-02-01'), paidDate: new Date('2026-02-01'), status: 'paid' },
  { id: '2', memberName: 'Jane Smith', amount: 3000, scheduledDate: new Date('2026-02-01'), paidDate: new Date('2026-02-01'), status: 'paid' },
  { id: '3', memberName: 'Bob Johnson', amount: 2000, scheduledDate: new Date('2026-02-01'), paidDate: null, status: 'missed' },
  { id: '4', memberName: 'Alice Brown', amount: 2500, scheduledDate: new Date('2026-02-15'), paidDate: null, status: 'pending' },
  { id: '5', memberName: 'John Doe', amount: 2500, scheduledDate: new Date('2026-02-15'), paidDate: null, status: 'pending' },
]

export default function GroupDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<any>(null)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

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
      } else {
        // Use mock data for demo if API fails
        setGroup({
          id: groupId,
          name: 'Family Savings Circle',
          description: 'Our family sinking fund for emergencies and big purchases',
          loanInterestRateMember: 5,
          loanInterestRateNonMember: 10,
          termDuration: 2,
          totalPool: 156000,
          memberCount: 8,
          totalInterest: 12500,
          ownerId: user?.uid,
          settings: {
            yearEndDate: '2026-12-20'
          }
        })
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      // Use mock data for demo
      setGroup({
        id: groupId,
        name: 'Family Savings Circle',
        description: 'Our family sinking fund for emergencies and big purchases',
        loanInterestRateMember: 5,
        loanInterestRateNonMember: 10,
        termDuration: 2,
        totalPool: 156000,
        memberCount: 8,
        totalInterest: 12500,
        ownerId: user?.uid,
        settings: {
          yearEndDate: '2026-12-20'
        }
      })
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
    { id: 'rules', label: 'Rules' },
    { id: 'members', label: 'Members' },
    { id: 'loans', label: 'Loans' },
    { id: 'contributions', label: 'Contributions' },
    ...(isAdmin ? [{ id: 'year-end', label: 'Year-End' }] : []),
  ]

  const contributionStats = {
    total: mockContributions.length,
    paid: mockContributions.filter(c => c.status === 'paid').length,
    pending: mockContributions.filter(c => c.status === 'pending').length,
    missed: mockContributions.filter(c => c.status === 'missed').length,
  }

  return (
    <DashboardLayout title={group?.name || 'Group Details'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/groups')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/groups/${groupId}/settings`)}
                >
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-black/[0.06]">
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
                    : 'Dec 20, 2026'
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
                      <p className="font-display text-2xl text-charcoal">{group?.memberCount || mockMembers.length}</p>
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
                        <Button onClick={() => setActiveTab('members')} variant="outline" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          View Members
                        </Button>
                        <Button onClick={() => setActiveTab('contributions')} variant="outline" className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          View Contributions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'rules' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Rules Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl text-charcoal">Group Rules & Policies</h2>
                    <p className="text-charcoal-muted">Understanding how this group operates</p>
                  </div>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/groups/${groupId}/settings`)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Rules
                    </Button>
                  )}
                </div>

                {/* Rules Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Loan Eligibility */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center mb-4">
                        <DollarSign className="w-5 h-5 text-sage" />
                      </div>
                      <h3 className="font-display text-lg text-charcoal mb-3">Loan Eligibility</h3>
                      <ul className="space-y-2 text-sm text-charcoal-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-sage">•</span>
                          <span><strong>New members (&lt; 6 months):</strong> Can borrow minimum of monthly contribution or 50% of average annual savings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-sage">•</span>
                          <span><strong>Established members (≥ 6 months):</strong> Can borrow maximum of monthly contribution or 50% of average annual savings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-sage">•</span>
                          <span>Loans exceeding monthly contribution require a co-maker</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Interest Rates */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-5 h-5 text-terracotta" />
                      </div>
                      <h3 className="font-display text-lg text-charcoal mb-3">Interest Rates</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-cream-dim rounded-lg">
                          <span className="text-charcoal-secondary">Members</span>
                          <span className="font-display text-xl text-sage">{group?.loanInterestRateMember || 5}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-cream-dim rounded-lg">
                          <span className="text-charcoal-secondary">Non-Members</span>
                          <span className="font-display text-xl text-terracotta">{group?.loanInterestRateNonMember || 10}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grace Period */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-display text-lg text-charcoal mb-3">Grace Period Policy</h3>
                      <ul className="space-y-2 text-sm text-charcoal-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span><strong>7 days</strong> grace period after due date before marking missed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>Reminders sent <strong>2 days</strong> before payment due date</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>No penalties during grace period</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Missed Payment Consequences */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-display text-lg text-charcoal mb-3">Missed Payment Consequences</h3>
                      <ul className="space-y-2 text-sm text-charcoal-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span><strong>3 consecutive missed payments</strong> = inactive status</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span>Inactive members <strong>lose interest share</strong> at year-end</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span>Still receive their contributions back, just no interest</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Co-maker Requirements */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-display text-lg text-charcoal mb-3">Co-maker Requirements</h3>
                      <ul className="space-y-2 text-sm text-charcoal-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>Required when loan exceeds <strong>monthly contribution amount</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>Co-maker must be an <strong>active member</strong> of the group</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          <span>Co-maker shares responsibility for loan repayment</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Year-End Distribution */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                        <Calendar className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-display text-lg text-charcoal mb-3">Year-End Distribution</h3>
                      <ul className="space-y-2 text-sm text-charcoal-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Scheduled for <strong>{group?.settings?.yearEndDate ? formatDate(new Date(group.settings.yearEndDate)) : 'Dec 20, 2026'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span><strong>5 days grace period</strong> after year-end for final payments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Interest distributed <strong>proportionally</strong> based on contributions</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl text-charcoal">Group Members</h2>
                    <p className="text-charcoal-muted">{mockMembers.length} members in this group</p>
                  </div>
                  {isAdmin && (
                    <Button onClick={() => setShowInviteModal(true)} size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {mockMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MemberCard {...member} />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/groups/${groupId}/members`)}
                  >
                    Manage All Members
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'loans' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl text-charcoal">Loans</h2>
                    <p className="text-charcoal-muted">{mockLoans.length} loans in this group</p>
                  </div>
                  <Button onClick={() => setShowLoanModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Request Loan
                  </Button>
                </div>

                {/* Loan Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Pending</p>
                      <p className="font-display text-xl text-yellow-600">
                        {mockLoans.filter(l => l.status === 'PENDING').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Active</p>
                      <p className="font-display text-xl text-sage">
                        {mockLoans.filter(l => l.status === 'APPROVED').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Total Lent</p>
                      <p className="font-display text-xl text-charcoal">
                        {formatCurrency(mockLoans.reduce((sum, l) => sum + l.amount, 0))}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4">
                  {mockLoans.map((loan, index) => (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <LoanCard 
                        {...loan} 
                        onViewDetails={(id) => router.push(`/groups/${groupId}/loans/${id}`)}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/groups/${groupId}/loans`)}
                  >
                    View All Loans
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'contributions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl text-charcoal">Contributions</h2>
                    <p className="text-charcoal-muted">Recent contribution activity</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/groups/${groupId}/contributions`)}
                  >
                    View All
                  </Button>
                </div>

                {/* Contribution Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Total</p>
                      <p className="font-display text-xl text-charcoal">{contributionStats.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Paid</p>
                      <p className="font-display text-xl text-green-600">{contributionStats.paid}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Pending</p>
                      <p className="font-display text-xl text-yellow-600">{contributionStats.pending}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-charcoal-muted">Missed</p>
                      <p className="font-display text-xl text-red-600">{contributionStats.missed}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-3">
                  {mockContributions.map((contribution, index) => (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                contribution.status === 'paid' ? 'bg-green-100' :
                                contribution.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                              }`}>
                                {contribution.status === 'paid' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {contribution.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                                {contribution.status === 'missed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                              </div>
                              <div>
                                <p className="font-medium text-charcoal">{contribution.memberName}</p>
                                <p className="text-sm text-charcoal-muted">
                                  Due: {formatDate(contribution.scheduledDate)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-lg text-charcoal">{formatCurrency(contribution.amount)}</p>
                              <Badge 
                                variant={
                                  contribution.status === 'paid' ? 'success' :
                                  contribution.status === 'pending' ? 'warning' : 'danger'
                                }
                              >
                                {contribution.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'year-end' && isAdmin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl text-charcoal">Year-End Distribution</h2>
                    <p className="text-charcoal-muted">Scheduled for December 20, 2026</p>
                  </div>
                  <Button onClick={() => router.push(`/groups/${groupId}/year-end`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Report
                  </Button>
                </div>

                {/* Year-End Summary */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-6 h-6 text-sage" />
                      </div>
                      <p className="text-sm text-charcoal-muted mb-1">Total Pool</p>
                      <p className="font-display text-2xl text-charcoal">{formatCurrency(156000)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-terracotta-dim rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-terracotta" />
                      </div>
                      <p className="text-sm text-charcoal-muted mb-1">Interest Earned</p>
                      <p className="font-display text-2xl text-charcoal">{formatCurrency(12500)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-sage" />
                      </div>
                      <p className="text-sm text-charcoal-muted mb-1">Eligible Members</p>
                      <p className="font-display text-2xl text-charcoal">7 / 8</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg text-charcoal mb-4">Distribution Preview</h3>
                    <div className="space-y-3">
                      {mockMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-cream-dim rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white text-sm">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-charcoal">{member.name}</p>
                              <p className="text-sm text-charcoal-muted">
                                Contributions: {formatCurrency(member.totalContributions)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-lg text-sage">
                              {formatCurrency(member.totalContributions + (member.status === 'active' ? 1500 : 0))}
                            </p>
                            <p className="text-xs text-charcoal-muted">
                              {member.status === 'active' ? 'Includes interest share' : 'No interest (inactive)'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-charcoal-muted mt-4 text-center">
                      View full report for complete distribution details
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Loan Request Modal */}
        <LoanRequestForm 
          groupId={groupId} 
          isOpen={showLoanModal}
          onClose={() => setShowLoanModal(false)} 
        />

        {/* Invite Member Modal */}
        <InviteMemberModal 
          isOpen={showInviteModal} 
          onClose={() => setShowInviteModal(false)} 
          groupId={groupId}
        />
      </motion.div>
    </DashboardLayout>
  )
}
