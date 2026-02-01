'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { 
  ArrowLeft, 
  Settings, 
  DollarSign, 
  Calendar,
  Percent,
  Clock,
  AlertTriangle,
  Trash2,
  Save
} from 'lucide-react'

export default function GroupSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [group, setGroup] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    loanInterestRateMember: 5,
    loanInterestRateNonMember: 10,
    termDuration: 2,
    gracePeriodDays: 7,
    yearEndDate: '',
  })

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    try {
      setLoading(true)
      // For demo, use mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockGroup = {
        id: groupId,
        name: 'Family Savings Circle',
        description: 'Our family sinking fund for emergencies and big purchases',
        loanInterestRateMember: 5,
        loanInterestRateNonMember: 10,
        termDuration: 2,
        ownerId: user?.uid,
        settings: {
          gracePeriodDays: 7,
          yearEndDate: '2026-12-20'
        }
      }
      setGroup(mockGroup)
      setFormData({
        name: mockGroup.name,
        description: mockGroup.description || '',
        loanInterestRateMember: mockGroup.loanInterestRateMember,
        loanInterestRateNonMember: mockGroup.loanInterestRateNonMember,
        termDuration: mockGroup.termDuration,
        gracePeriodDays: mockGroup.settings?.gracePeriodDays || 7,
        yearEndDate: mockGroup.settings?.yearEndDate || '',
      })
    } catch (error) {
      console.error('Error fetching group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    alert('Settings saved successfully!')
  }

  const handleDelete = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Group deleted!')
    router.push('/groups')
  }

  const isAdmin = group?.ownerId === user?.uid

  if (loading) {
    return (
      <DashboardLayout title="Group Settings">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAdmin) {
    return (
      <DashboardLayout title="Group Settings">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-charcoal mb-2">Access Denied</h2>
          <p className="text-charcoal-muted mb-6">Only group admins can access settings.</p>
          <Button onClick={() => router.push(`/groups/${groupId}`)}>
            Back to Group
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Group Settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-sage-dim rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-sage" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-charcoal">Group Settings</h1>
            <p className="text-charcoal-muted">Manage your group configuration</p>
          </div>
        </div>

        {/* General Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Group Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
            />
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your group"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Loan Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-sage" />
              Loan Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Interest Rate (Members)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={formData.loanInterestRateMember}
                    onChange={(e) => setFormData(prev => ({ ...prev, loanInterestRateMember: Number(e.target.value) }))}
                    className="flex-1 h-2 bg-cream-dim rounded-lg appearance-none cursor-pointer accent-sage"
                  />
                  <span className="w-16 text-center font-mono text-sage">
                    {formData.loanInterestRateMember}%
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted mt-1">Monthly interest for group members</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Interest Rate (Non-Members)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={formData.loanInterestRateNonMember}
                    onChange={(e) => setFormData(prev => ({ ...prev, loanInterestRateNonMember: Number(e.target.value) }))}
                    className="flex-1 h-2 bg-cream-dim rounded-lg appearance-none cursor-pointer accent-terracotta"
                  />
                  <span className="w-16 text-center font-mono text-terracotta">
                    {formData.loanInterestRateNonMember}%
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted mt-1">Monthly interest for external borrowers</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Loan Term Duration
                </label>
                <select
                  value={formData.termDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, termDuration: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
                >
                  <option value={1}>1 month</option>
                  <option value={2}>2 months</option>
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Grace Period
                </label>
                <select
                  value={formData.gracePeriodDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, gracePeriodDays: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
                >
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                </select>
                <p className="text-xs text-charcoal-muted mt-1">Days after due date before marking missed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year-End Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sage" />
              Year-End Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Distribution Date
              </label>
              <input
                type="date"
                value={formData.yearEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, yearEndDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
              />
              <p className="text-xs text-charcoal-muted mt-1">
                When contributions and interest will be distributed to members
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end mb-8">
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="border-2 border-danger/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium text-charcoal mb-1">Delete Group</h4>
                <p className="text-sm text-charcoal-muted">
                  Permanently delete this group and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-danger/5 rounded-lg border border-danger/20"
              >
                <p className="text-sm text-charcoal mb-4">
                  Are you sure you want to delete <strong>{group?.name}</strong>? 
                  This will remove all members, loans, contributions, and history.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    Yes, Delete Group
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
