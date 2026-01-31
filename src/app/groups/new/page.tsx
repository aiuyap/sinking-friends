'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Plus } from 'lucide-react'

export default function NewGroupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interestRate: 5,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Group name is required' })
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
        throw new Error('Failed to create group')
      }

      const data = await response.json()
      router.push(`/groups/${data.id}`)
    } catch (error) {
      console.error('Error creating group:', error)
      setErrors({ submit: 'Failed to create group. Please try again.' })
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
        className="max-w-2xl mx-auto"
      >
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Sinking Fund Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Group Name"
                placeholder="e.g., Family Savings, Vacation Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />

              <TextArea
                label="Description (Optional)"
                placeholder="What is this group for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Monthly Interest Rate (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) })}
                    className="flex-1 h-2 bg-cream-dim rounded-lg appearance-none cursor-pointer accent-sage"
                  />
                  <span className="font-mono text-lg text-sage w-16 text-right">
                    {formData.interestRate}%
                  </span>
                </div>
                <p className="text-sm text-charcoal-muted mt-2">
                  This rate will be applied monthly to calculate interest on balances.
                </p>
              </div>

              {errors.submit && (
                <div className="p-4 bg-danger-dim text-danger rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

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
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
