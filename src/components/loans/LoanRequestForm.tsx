'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { LoanEligibilityDisplay } from './LoanEligibilityDisplay'
import { CoMakerSelector } from './CoMakerSelector'
import { formatCurrency } from '@/lib/utils'
import { calculateMaxLoanAmount, type LoanEligibility } from '@/lib/calculators'
import { DollarSign, AlertCircle, Info } from 'lucide-react'

interface LoanRequestFormProps {
  groupId: string
  isOpen?: boolean
  onClose?: () => void
}

export default function LoanRequestForm({ groupId, isOpen: controlledIsOpen, onClose }: LoanRequestFormProps) {
  const router = useRouter()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Support both controlled and uncontrolled modes
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
  const [coMakerRequired, setCoMakerRequired] = useState(false)
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Fetch user's eligibility when modal opens
      fetchEligibility()
    }
  }, [isOpen])

  const fetchEligibility = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/loan-eligibility`)
      if (response.ok) {
        const data = await response.json()
        setEligibility(data.eligibility)
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    if (eligibility) {
      const enteredAmount = parseFloat(value) || 0
      setCoMakerRequired(enteredAmount > eligibility.monthlyContribution)
    }
  }

  const handleSubmit = async () => {
    if (!amount || !eligibility) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          isNonMember,
          nonMemberName: isNonMember ? nonMemberName : null,
          coMakerId: coMakerRequired ? selectedCoMakerId : null,
        }),
      })

      if (response.ok) {
        setIsOpen(false)
        router.push(`/groups/${groupId}`)
      }
    } catch (error) {
      console.error('Error creating loan:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!eligibility) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        Request Loan
      </Button>
    )
  }

  const maxLoan = eligibility.maxLoan
  const enteredAmount = parseFloat(amount) || 0
  const isValidAmount = enteredAmount > 0 && enteredAmount <= maxLoan
  const showCoMakerSection = enteredAmount > eligibility.monthlyContribution
  const coMakerSelected = coMakerRequired && selectedCoMakerId !== undefined

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Request Loan">
      <div className="space-y-6">
        <LoanEligibilityDisplay eligibility={eligibility} />

        <div className="bg-sage-dim rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
            <div className="text-sm text-sage">
              <p className="font-medium mb-1">Loan Information</p>
              <p className="text-charcoal-secondary">
                You can borrow up to <span className="font-semibold">{formatCurrency(maxLoan)}</span>
                <br />
                {showCoMakerSection 
                  ? `Exceeds monthly contribution (${formatCurrency(eligibility.monthlyContribution)}). Co-maker required.`
                  : `Within monthly contribution. No co-maker required.`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Loan Amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
            error={amount && (parseFloat(amount) || 0) > maxLoan ? `Exceeds max of ${formatCurrency(maxLoan)}` : undefined}
            icon={<DollarSign className="w-4 h-4" />}
          />

          {isValidAmount && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success-dim rounded-lg p-3"
            >
              <p className="text-sm text-success">
                ✓ Valid loan amount. {formatCurrency(enteredAmount)} within limit.
              </p>
            </motion.div>
          )}

          <div className="bg-cream-dim rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-charcoal mb-3">Borrower Information</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNonMember}
                  onChange={e => setIsNonMember(e.target.checked)}
                  className="w-4 h-4 text-sage"
                />
                <span className="text-sm text-charcoal">Borrowing for non-member</span>
              </label>

              {isNonMember && (
                <Input
                  label="Non-Member Name"
                  placeholder="Enter name"
                  value={nonMemberName}
                  onChange={e => setNonMemberName(e.target.value)}
                />
              )}
            </div>
          </div>

          {coMakerRequired && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-terracotta-dim rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                <div className="text-sm text-terracotta">
                  <p className="font-medium mb-1">Co-Maker Required</p>
                  <p className="text-charcoal-secondary">
                    Loan amount exceeds monthly contribution. Please select a co-maker 
                    who has no active loans and is not already a co-maker.
                  </p>
                </div>
              </div>

              <CoMakerSelector
                members={[]}
                selectedCoMakerId={selectedCoMakerId}
                onSelect={setSelectedCoMakerId}
                required={true}
              />
            </motion.div>
          )}

          {coMakerRequired && !coMakerSelected && (
            <div className="bg-danger-dim rounded-lg p-3">
              <p className="text-sm text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Please select a co-maker to proceed
              </p>
            </div>
          )}
        </div>

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
            disabled={!isValidAmount || (coMakerRequired && !coMakerSelected)}
          >
            Submit Loan Request
          </Button>
        </div>
      </div>
    </Modal>
  )
}
