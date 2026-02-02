'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, Plus, PhilippinePeso, Calendar, Clock } from 'lucide-react'

export default function NewGroupPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    loanInterestRateMember: 5,
    loanInterestRateNonMember: 10,
    termDuration: 2,
    gracePeriodDays: 7,
    yearEndDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate required fields
    if (!formData.name.trim()) {
      setErrors({ name: 'Group name is required' })
      return
    }

    if (!formData.yearEndDate) {
      setErrors({ yearEndDate: 'Year-end distribution date is required' })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create group')
      }

      const data = await response.json()
      success('Group Created', 'Your new group has been created successfully!')
      router.push(`/groups/${data.id}`)
    } catch (err: any) {
      console.error('Error creating group:', err)
      error('Creation Failed', err.message || 'Failed to create group. Please try again.')
      setErrors({ submit: err.message || 'Failed to create group. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout title="Create New Group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-sage-dim rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-sage" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-charcoal">Create New Group</h1>
            <p className="text-charcoal-muted">Set up your sinking fund group with custom settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Group Name *"
                placeholder="e.g., Family Savings, Vacation Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />

              <TextArea
                label="Description"
                placeholder="What is this group for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Loan Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhilippinePeso className="w-5 h-5 text-sage" />
                Loan Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Interest Rate (Members) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.loanInterestRateMember}
                      onChange={(e) => setFormData({ ...formData, loanInterestRateMember: Number(e.target.value) })}
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
                    Interest Rate (Non-Members) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={formData.loanInterestRateNonMember}
                      onChange={(e) => setFormData({ ...formData, loanInterestRateNonMember: Number(e.target.value) })}
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
                    Loan Term Duration *
                  </label>
                  <select
                    value={formData.termDuration}
                    onChange={(e) => setFormData({ ...formData, termDuration: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
                    required
                  >
                    <option value={1}>1 month</option>
                    <option value={2}>2 months</option>
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                  </select>
                  <p className="text-xs text-charcoal-muted mt-1">Duration of loan repayment period</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Grace Period *
                  </label>
                  <select
                    value={formData.gracePeriodDays}
                    onChange={(e) => setFormData({ ...formData, gracePeriodDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
                    required
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sage" />
                Year-End Distribution *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Distribution Date *
                </label>
                <input
                  type="date"
                  value={formData.yearEndDate}
                  onChange={(e) => setFormData({ ...formData, yearEndDate: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage ${
                    errors.yearEndDate ? 'border-danger' : 'border-black/[0.08]'
                  }`}
                  required
                />
                {errors.yearEndDate && (
                  <p className="text-sm text-danger mt-1">{errors.yearEndDate}</p>
                )}
                <p className="text-xs text-charcoal-muted mt-1">
                  When contributions and interest will be distributed to members
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.submit && (
            <div className="p-4 bg-danger-dim text-danger rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              isLoading={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  )
}
