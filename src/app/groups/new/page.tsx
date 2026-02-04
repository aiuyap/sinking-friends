'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, Plus, PhilippinePeso, Calendar, Clock, AlertTriangle, X } from 'lucide-react'

export default function NewGroupPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    loanInterestRateMember: 5,
    loanInterestRateNonMember: 10,
    termDuration: 2,
    gracePeriodDays: 7,
    yearEndDate: '',
    biWeeklyContribution: 2000,
    personalPayday: 15,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper functions
  const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  const getNextPaymentDates = (payday: number): { first: string; second: string } => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const currentDay = today.getDate()
    
    // First payment: next occurrence of payday
    let firstPayment = new Date(currentYear, currentMonth, payday)
    if (currentDay >= payday) {
      firstPayment.setMonth(currentMonth + 1)
    }
    
    // Second payment: 14 days after first
    let secondPayment = new Date(firstPayment)
    secondPayment.setDate(firstPayment.getDate() + 14)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    return {
      first: formatDate(firstPayment),
      second: formatDate(secondPayment)
    }
  }

  const formatPeso = (amount: number): string => {
    return `₱${amount.toLocaleString()}`
  }

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

    if (!formData.biWeeklyContribution || formData.biWeeklyContribution < 500) {
      setErrors({ biWeeklyContribution: 'Minimum contribution is ₱500' })
      return
    }

    if (!formData.personalPayday || formData.personalPayday < 1 || formData.personalPayday > 31) {
      setErrors({ personalPayday: 'Please select a valid payday' })
      return
    }

    // Show confirmation modal
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          interestRate: formData.loanInterestRateMember,
          termDuration: formData.termDuration,
          termStartDate: new Date().toISOString(),
          termEndDate: new Date(formData.yearEndDate).toISOString(),
          biWeeklyContribution: formData.biWeeklyContribution,
          personalPayday: formData.personalPayday,
          yearEndDate: formData.yearEndDate,
        }),
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

  const paymentDates = getNextPaymentDates(formData.personalPayday)

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

          {/* Your Contribution Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhilippinePeso className="w-5 h-5 text-sage" />
                Your Contribution Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bi-Weekly Contribution with Slider */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-charcoal">
                    <PhilippinePeso className="w-4 h-4 inline mr-1" />
                    Bi-Weekly Contribution Amount *
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="500"
                          max="10000"
                          step="500"
                          value={formData.biWeeklyContribution}
                          onChange={(e) => setFormData({ ...formData, biWeeklyContribution: Number(e.target.value) })}
                          className={`w-full h-2 bg-cream-dim rounded-lg appearance-none cursor-pointer ${
                            errors.biWeeklyContribution ? 'accent-danger' : 'accent-sage'
                          }`}
                        />
                        {/* Tick marks */}
                        <div className="flex justify-between mt-2 px-1">
                          {[1000, 2500, 5000, 7500, 10000].map((mark) => (
                            <div key={mark} className="flex flex-col items-center">
                              <div className="w-0.5 h-1.5 bg-charcoal-muted/30" />
                              <span className="text-[10px] text-charcoal-muted mt-1">
                                {mark >= 1000 ? `${mark/1000}k` : mark}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className={`w-28 text-right font-mono text-xl font-semibold ${
                        errors.biWeeklyContribution ? 'text-danger' : 'text-sage'
                      }`}>
                        {formatPeso(formData.biWeeklyContribution)}
                      </span>
                    </div>
                    
                    {errors.biWeeklyContribution && (
                      <p className="text-sm text-danger">{errors.biWeeklyContribution}</p>
                    )}
                    
                    <div className="flex gap-4 text-xs text-charcoal-muted pt-1">
                      <span>{formatPeso(formData.biWeeklyContribution * 2)} monthly</span>
                      <span>•</span>
                      <span>{formatPeso(formData.biWeeklyContribution * 26)} yearly</span>
                    </div>
                  </div>
                </div>

                {/* Personal Payday */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-charcoal">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Your Payday *
                  </label>
                  
                  <div className="space-y-3">
                    <select
                      value={formData.personalPayday}
                      onChange={(e) => setFormData({ ...formData, personalPayday: Number(e.target.value) })}
                      className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage ${
                        errors.personalPayday ? 'border-danger' : 'border-black/[0.08]'
                      }`}
                      required
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day}{getDaySuffix(day)} of each month
                        </option>
                      ))}
                    </select>
                    
                    {errors.personalPayday && (
                      <p className="text-sm text-danger">{errors.personalPayday}</p>
                    )}
                    
                    <div className="bg-sage-dim rounded-lg p-3 space-y-1">
                      <p className="text-xs font-medium text-charcoal">
                        Next payment dates:
                      </p>
                      <p className="text-xs text-charcoal-secondary">
                        1st: {paymentDates.first}
                      </p>
                      <p className="text-xs text-charcoal-secondary">
                        2nd: {paymentDates.second} <span className="text-charcoal-muted">(bi-weekly)</span>
                      </p>
                    </div>
                  </div>
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowConfirmModal(false)
            }}
          >
            <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Terracotta warning header */}
              <div className="bg-terracotta/10 border-b-2 border-terracotta px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal">Confirm Group Creation</h2>
                    <p className="text-xs text-charcoal-muted">Please review before proceeding</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-charcoal-muted">Group Name</span>
                    <span className="font-medium text-charcoal">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-charcoal-muted">Your Contribution</span>
                    <span className="font-medium text-sage">{formatPeso(formData.biWeeklyContribution)} bi-weekly</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-charcoal-muted">Your Payday</span>
                    <span className="font-medium text-charcoal">{formData.personalPayday}{getDaySuffix(formData.personalPayday)} of each month</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-charcoal-muted">Monthly Total</span>
                    <span className="font-medium text-charcoal">{formatPeso(formData.biWeeklyContribution * 2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-charcoal-muted">Annual Commitment</span>
                    <span className="font-medium text-charcoal">{formatPeso(formData.biWeeklyContribution * 26)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-charcoal-muted">Member Interest Rate</span>
                    <span className="font-medium text-charcoal">{formData.loanInterestRateMember}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-charcoal-muted">Year-End Date</span>
                    <span className="font-medium text-charcoal">
                      {new Date(formData.yearEndDate).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-danger-dim border border-danger/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-danger">Important</p>
                      <p className="text-xs text-charcoal-secondary mt-1">
                        Your contribution amount and payday cannot be changed after creating the group. 
                        Please verify these settings are correct.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Go Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white"
                    onClick={handleConfirmSubmit}
                    isLoading={isLoading}
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
