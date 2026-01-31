'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { user, signInWithGoogle } = useAuth()
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading')
  const [invite, setInvite] = useState<any>(null)

  useEffect(() => {
    validateInvite()
  }, [params.token])

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/invites/${params.token}`)
      if (response.ok) {
        const data = await response.json()
        setInvite(data.invite)
        setStatus('valid')
      } else {
        setStatus('invalid')
      }
    } catch (error) {
      setStatus('invalid')
    }
  }

  const handleAccept = async () => {
    if (!user) {
      await signInWithGoogle()
      return
    }

    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          userId: user.uid,
        }),
      })

      if (response.ok) {
        setStatus('accepted')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      console.error('Error accepting invite:', error)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardHeader className="pb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-sage animate-spin" />
              </div>
            )}
            {status === 'valid' && (
              <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-sage" />
              </div>
            )}
            {status === 'invalid' && (
              <div className="w-16 h-16 bg-danger-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
            )}
            {status === 'accepted' && (
              <div className="w-16 h-16 bg-success-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            )}
            <CardTitle>
              {status === 'loading' && 'Validating Invitation...'}
              {status === 'valid' && 'You are Invited!'}
              {status === 'invalid' && 'Invalid Invitation'}
              {status === 'accepted' && 'Welcome Aboard!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <p className="text-charcoal-secondary">
                Please wait while we validate your invitation...
              </p>
            )}
            {status === 'valid' && invite && (
              <div className="space-y-6">
                <p className="text-charcoal-secondary">
                  You have been invited to join <strong className="text-charcoal">{invite.group.name}</strong>
                </p>
                <Button className="w-full" onClick={handleAccept}>
                  {user ? 'Accept Invitation' : 'Sign in to Accept'}
                </Button>
              </div>
            )}
            {status === 'invalid' && (
              <div className="space-y-6">
                <p className="text-charcoal-secondary">
                  This invitation is invalid or has expired. Please ask the group admin to send a new invitation.
                </p>
                <Button variant="outline" className="w-full" onClick={() => router.push('/')}>Go Home</Button>
              </div>
            )}
            {status === 'accepted' && (
              <div className="space-y-6">
                <p className="text-charcoal-secondary">
                  You have successfully joined the group! Redirecting to dashboard...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
