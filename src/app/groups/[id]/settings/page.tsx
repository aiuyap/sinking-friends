'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { 
  ArrowLeft, 
  Settings, 
  DollarSign, 
  Calendar,
  Clock,
  AlertTriangle,
  Trash2,
  Save,
  CheckCircle
} from 'lucide-react'

export default function GroupSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  const { success, error, warning } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [group, setGroup] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  
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
      const response = await fetch(`/api/groups/${groupId}`)
      
      if (response.status === 401) {
        router.push('/')
        return
      }
      
      if (response.status === 403) {
        // Not a member or admin
        console.error('Access denied to group')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch group')
      }
      
      const data = await response.json()
      setGroup(data.group)
      
      // Initialize form data from group
      setFormData({
        name: data.group.name || '',
        description: data.group.description || '',
        loanInterestRateMember: data.group.loanInterestRateMember || 5,
        loanInterestRateNonMember: data.group.loanInterestRateNonMember || 10,
        termDuration: data.group.termDuration || 2,
        gracePeriodDays: data.group.settings?.gracePeriodDays || 7,
        yearEndDate: data.group.settings?.yearEndDate ? 
          new Date(data.group.settings.yearEndDate).toISOString().split('T')[0] : '',
      })
    } catch (error) {
      console.error('Error fetching group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          loanInterestRateMember: formData.loanInterestRateMember,
          loanInterestRateNonMember: formData.loanInterestRateNonMember,
          termDuration: formData.termDuration,
          settings: {
            gracePeriodDays: formData.gracePeriodDays,
            yearEndDate: formData.yearEndDate,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        error('Failed to Save', errorData.error || 'Could not save settings. Please try again.')
        return
      }

      setSaveSuccess(true)
      success('Settings Saved', 'Your changes have been saved successfully.')
      // Refresh group data
      await fetchGroupData()
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      error('Save Failed', 'Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    // Verify group name matches
    if (deleteConfirmText !== group?.name) {
      warning('Name Mismatch', 'Group name does not match. Please type the exact group name to confirm deletion.')
      return
    }
    
    setDeleting(true)
    
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        error('Delete Failed', errorData.error || 'Could not delete group. Please try again.')
        return
      }

      success('Group Deleted', 'The group has been permanently deleted.')
      router.push('/groups')
    } catch (err) {
      console.error('Error deleting group:', err)
      error('Delete Failed', 'Failed to delete group. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Check if user is admin from API response
  const isAdmin = group?.isAdmin || group?.userRole === 'ADMIN'

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

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-success-dim rounded-lg border border-success/20 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-success font-medium">Settings saved successfully!</span>
          </motion.div>
        )}

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
                  This action <strong>cannot be undone</strong>. This will permanently delete the group
                  <strong>"{group?.name}"</strong> and all its data including members, loans, and contributions.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Please type <strong>{group?.name}</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type "${group?.name}" to confirm`}
                    className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDelete}
                    isLoading={deleting}
                    disabled={deleteConfirmText !== group?.name}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Group
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
