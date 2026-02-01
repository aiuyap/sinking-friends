'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, AlertCircle, Info, Users, Loader2 } from 'lucide-react'

interface LoanRequestFormProps {
  groupId: string
  isOpen?: boolean
  onClose?: () => void
}

interface CoMaker {
  id: string
  userId: string
  name: string
  email: string
  image?: string
  isActive?: boolean
  isCurrentUser?: boolean
}

interface EligibilityData {
  maxLoan: number
  monthlyContribution: number
  avgAnnualSavings: number
  activeMonths: number
  isEligibleForBorrowing: boolean
}

export default function LoanRequestForm({ groupId, isOpen: controlledIsOpen, onClose }: LoanRequestFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = (value: boolean) => {
    if (controlledIsOpen !== undefined && onClose && !value) {
      onClose()
    } else {
      setInternalIsOpen(value)
    }
  }
  
  const [amount, setAmount] = useState('')
  const [isNonMember, setIsNonMember] = useState(false)
  const [nonMemberName, setNonMemberName] = useState('')
  const [selectedCoMakerId, setSelectedCoMakerId] = useState<string>()
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false)
  const [isLoadingCoMakers, setIsLoadingCoMakers] = useState(false)
  const [coMakers, setCoMakers] = useState<CoMaker[]>([])
  const [coMakerError, setCoMakerError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchEligibility()
      // Reset form when modal opens
      setAmount('')
      setIsNonMember(false)
      setNonMemberName('')
      setSelectedCoMakerId(undefined)
      setCoMakers([])
      setCoMakerError(null)
    }
  }, [isOpen])

  // Fetch co-makers only when needed (amount exceeds monthly contribution)
  useEffect(() => {
    const enteredAmount = parseFloat(amount) || 0
    if (isOpen && eligibility && enteredAmount > eligibility.monthlyContribution && coMakers.length === 0) {
      fetchCoMakers()
    }
  }, [amount, eligibility, isOpen])

  const fetchEligibility = async () => {
    setIsLoadingEligibility(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/loan-eligibility`)
      if (response.ok) {
        const data = await response.json()
        setEligibility(data.eligibility)
      } else {
        error('Error', 'Failed to load loan eligibility')
      }
    } catch (err) {
      console.error('Error fetching eligibility:', err)
      error('Error', 'Failed to load loan eligibility')
    } finally {
      setIsLoadingEligibility(false)
    }
  }

  const fetchCoMakers = async () => {
    setIsLoadingCoMakers(true)
    setCoMakerError(null)
    try {
      const response = await fetch(`/api/groups/${groupId}/members`)
      if (response.ok) {
        const data = await response.json()
        // Filter out current user and inactive members
        const eligibleCoMakers = data.members.filter((m: CoMaker) => m.isActive && !m.isCurrentUser)
        setCoMakers(eligibleCoMakers)
        if (eligibleCoMakers.length === 0) {
          setCoMakerError('No eligible co-makers available. All members either have active loans or are already co-makers.')
        }
      } else {
        setCoMakerError('Failed to load co-makers')
      }
    } catch (err) {
      console.error('Error fetching co-makers:', err)
      setCoMakerError('Failed to load co-makers')
    } finally {
      setIsLoadingCoMakers(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const handleSubmit = async () => {
    if (!amount || !eligibility) return

    const enteredAmount = parseFloat(amount)
    if (enteredAmount <= 0 || enteredAmount > eligibility.maxLoan) {
      error('Invalid Amount', `Please enter an amount between ₱1 and ${formatCurrency(eligibility.maxLoan)}`)
      return
    }

    const coMakerRequired = enteredAmount > eligibility.monthlyContribution
    if (coMakerRequired && !selectedCoMakerId) {
      error('Co-Maker Required', 'Please select a co-maker for this loan amount')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: enteredAmount,
          isNonMember,
          nonMemberName: isNonMember ? nonMemberName : null,
          coMakerId: coMakerRequired ? selectedCoMakerId : null,
        }),
      })

      if (response.ok) {
        success('Loan Requested', `Your loan request for ${formatCurrency(enteredAmount)} has been submitted successfully.`)
        setIsOpen(false)
        router.push(`/groups/${groupId}/loans`)
      } else {
        const errorData = await response.json()
        error('Request Failed', errorData.error || 'Failed to submit loan request')
      }
    } catch (err) {
      console.error('Error creating loan:', err)
      error('Request Failed', 'Failed to submit loan request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingEligibility) {
    return (
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Request Loan">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sage" />
        </div>
      </Modal>
    )
  }

  if (!eligibility) {
    return null
  }

  const maxLoan = eligibility.maxLoan
  const enteredAmount = parseFloat(amount) || 0
  const isValidAmount = enteredAmount > 0 && enteredAmount <= maxLoan
  const coMakerRequired = enteredAmount > eligibility.monthlyContribution
  const progressPercent = maxLoan > 0 ? (enteredAmount / maxLoan) * 100 : 0

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Request Loan" className="max-w-2xl">
      <div className="space-y-6">
        {/* Eligibility Card */}
        <Card className="bg-sage-dim border-sage/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-charcoal">Loan Eligibility</h3>
              <span className="text-sm text-sage bg-sage/10 px-2 py-1 rounded-full">
                {eligibility.activeMonths} months active
              </span>
            </div>
            
            <div className="text-center py-2">
              <p className="text-sm text-charcoal-muted mb-1">Maximum Loan Amount</p>
              <p className="font-display text-3xl text-charcoal">{formatCurrency(maxLoan)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sage/20">
              <div>
                <p className="text-xs text-charcoal-muted">Monthly Contribution</p>
                <p className="font-mono text-charcoal">{formatCurrency(eligibility.monthlyContribution)}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-muted">Avg Annual Savings</p>
                <p className="font-mono text-charcoal">{formatCurrency(eligibility.avgAnnualSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Amount Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-sage" />
              Loan Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={handleAmountChange}
              error={amount && enteredAmount > maxLoan ? `Maximum is ${formatCurrency(maxLoan)}` : undefined}
              icon={<DollarSign className="w-4 h-4" />}
            />

            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={maxLoan}
                  step="100"
                  value={enteredAmount}
                  onChange={handleSliderChange}
                  className="flex-1 h-2 bg-cream-dim rounded-lg appearance-none cursor-pointer accent-sage"
                />
                <span className="font-mono text-sm text-sage w-20 text-right">
                  {formatCurrency(enteredAmount)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-charcoal-muted">
                <span>₱0</span>
                <span>{formatCurrency(maxLoan)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {enteredAmount > 0 && (
              <div className="space-y-1">
                <div className="h-2 bg-cream-dim rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                    className={`h-full rounded-full ${
                      enteredAmount > maxLoan ? 'bg-danger' : 
                      enteredAmount > eligibility.monthlyContribution ? 'bg-terracotta' : 
                      'bg-sage'
                    }`}
                  />
                </div>
                <p className="text-xs text-charcoal-muted text-center">
                  {enteredAmount > maxLoan ? 'Exceeds maximum limit' : 
                   enteredAmount > eligibility.monthlyContribution ? 'Co-maker required' : 
                   `${Math.round(progressPercent)}% of maximum`}
                </p>
              </div>
            )}

            {isValidAmount && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-success-dim rounded-lg p-3 flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-success" />
                <p className="text-sm text-success">
                  Valid amount: {formatCurrency(enteredAmount)}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Borrower Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Borrower Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-cream-dim rounded-lg hover:bg-black/[0.03] transition-colors">
              <input
                type="checkbox"
                checked={isNonMember}
                onChange={e => setIsNonMember(e.target.checked)}
                className="w-4 h-4 text-sage rounded"
              />
              <span className="text-sm text-charcoal">Borrowing for a non-member</span>
            </label>

            <AnimatePresence>
              {isNonMember && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="Non-Member Name *"
                    placeholder="Enter the borrower's name"
                    value={nonMemberName}
                    onChange={e => setNonMemberName(e.target.value)}
                    required={isNonMember}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Co-Maker Section - Only show when needed */}
        <AnimatePresence>
          {coMakerRequired && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-terracotta/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-terracotta">
                    <Users className="w-5 h-5" />
                    Co-Maker Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-terracotta-dim rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-terracotta">
                        Loan amount exceeds your monthly contribution of {formatCurrency(eligibility.monthlyContribution)}. 
                        A co-maker is required.
                      </p>
                    </div>
                  </div>

                  {isLoadingCoMakers ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-sage" />
                    </div>
                  ) : coMakerError ? (
                    <div className="bg-danger-dim rounded-lg p-3 text-danger text-sm">
                      {coMakerError}
                    </div>
                  ) : coMakers.length === 0 ? (
                    <div className="bg-cream-dim rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
                      <p className="text-sm text-charcoal-muted">No eligible co-makers available</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {coMakers.map((coMaker) => (
                        <button
                          key={coMaker.id}
                          onClick={() => setSelectedCoMakerId(coMaker.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            selectedCoMakerId === coMaker.id
                              ? 'border-sage bg-sage-dim'
                              : 'border-black/[0.06] bg-white hover:border-sage/30'
                          }`}
                        >
                          {coMaker.image ? (
                            <img 
                              src={coMaker.image} 
                              alt={coMaker.name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white font-semibold">
                              {coMaker.name?.[0] || '?'}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-charcoal">{coMaker.name}</p>
                            <p className="text-xs text-charcoal-muted">{coMaker.email}</p>
                          </div>
                          {selectedCoMakerId === coMaker.id && (
                            <div className="w-5 h-5 rounded-full bg-sage flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-black/[0.06]">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!isValidAmount || (coMakerRequired && !selectedCoMakerId) || (isNonMember && !nonMemberName.trim())}
          >
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  )
}
