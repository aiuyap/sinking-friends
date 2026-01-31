'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus, 
  ArrowLeft,
  UserPlus,
  Trash2
} from 'lucide-react'

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [group, setGroup] = useState<any>(null)
  const [funds, setFunds] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'funds' | 'members'>('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [fundForm, setFundForm] = useState({ name: '', memberName: '', amount: '' })

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (!response.ok) throw new Error('Failed to fetch group')
      const data = await response.json()
      setGroup(data.group)
      setFunds(data.funds || [])
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      
      if (response.ok) {
        setInviteEmail('')
        setShowInviteModal(false)
        fetchGroupData()
      }
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const handleCreateFund = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fundForm.name,
          memberName: fundForm.memberName,
          amount: parseFloat(fundForm.amount),
        }),
      })
      
      if (response.ok) {
        setFundForm({ name: '', memberName: '', amount: '' })
        setShowFundModal(false)
        fetchGroupData()
      }
    } catch (error) {
      console.error('Error creating fund:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Group Details">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
        </div>
      </DashboardLayout>
    )
  }

  if (!group) {
    return (
      <DashboardLayout title="Group Not Found">
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-charcoal-secondary">Group not found or you don't have access.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const totalBalance = funds.reduce((sum, fund) => sum + (fund.amount || 0), 0)

  return (
    <DashboardLayout title={group.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button & Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant={group.isAdmin ? 'default' : 'outline'}>
              {group.isAdmin ? 'Admin' : 'Member'}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Group Info Card */}
        <Card className="mb-8">
          <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl text-charcoal mb-2">{group.name}</h1>
              <p className="text-charcoal-secondary">{group.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-charcoal-muted">Interest Rate</p>
                <p className="font-display text-2xl text-sage">{group.interestRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-charcoal-muted">Total Balance</p>
                <p className="font-display text-2xl text-charcoal">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-black/[0.06]">
          {(['overview', 'funds', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'text-sage border-b-2 border-sage' 
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-sage" />
                    </div>
                    <CardTitle className="text-xl">Active Funds</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-4xl text-charcoal mb-2">{funds.length}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('funds')}
                  >
                    View All Funds
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-terracotta" />
                    </div>
                    <CardTitle className="text-xl">Group Members</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-4xl text-charcoal mb-2">{members.length}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('members')}
                  >
                    Manage Members
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'funds' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-charcoal">Funds</h2>
              {group.isAdmin && (
                <Button onClick={() => setShowFundModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fund
                </Button>
              )}
            </div>

            {funds.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-sage" />
                  </div>
                  <h3 className="font-display text-xl text-charcoal mb-2">No funds yet</h3>
                  <p className="text-charcoal-secondary mb-4">
                    Create your first fund to start tracking payments and interest.
                  </p>
                  {group.isAdmin && (
                    <Button onClick={() => setShowFundModal(true)}>
                      Create Fund
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funds.map((fund: any) => (
                  <Card key={fund.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{fund.name}</CardTitle>
                      <p className="text-sm text-charcoal-muted">{fund.memberName}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-charcoal-muted">Current Balance</p>
                        <p className="font-mono text-2xl text-charcoal">
                          {formatCurrency(fund.amount)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push(`/groups/${groupId}/funds/${fund.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-charcoal">Members</h2>
              {group.isAdmin && (
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {members.map((member: any) => (
                <Card key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {member.user?.image ? (
                      <img 
                        src={member.user.image} 
                        alt={member.user.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-white font-semibold">
                        {member.user?.name?.[0] || member.user?.email?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-charcoal">{member.user?.name || member.user?.email}</p>
                      <Badge variant={member.role === 'ADMIN' ? 'default' : 'outline'} className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Invite Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite Member"
        >
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleInvite}
                disabled={!inviteEmail}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </Modal>

        {/* Fund Modal */}
        <Modal
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          title="Create New Fund"
        >
          <div className="space-y-4">
            <Input
              label="Fund Name"
              placeholder="e.g., Personal Loan"
              value={fundForm.name}
              onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })}
            />
            <Input
              label="Member Name"
              placeholder="Who is this fund for?"
              value={fundForm.memberName}
              onChange={(e) => setFundForm({ ...fundForm, memberName: e.target.value })}
            />
            <Input
              label="Initial Amount"
              type="number"
              placeholder="0.00"
              value={fundForm.amount}
              onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
            />
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowFundModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCreateFund}
                disabled={!fundForm.name || !fundForm.memberName}
              >
                Create Fund
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </DashboardLayout>
  )
}
