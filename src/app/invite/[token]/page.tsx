'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { user, signInWithGoogle } = useAuth()
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading')
  const [invite, setInvite] = useState<any>(null)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setToken(resolved.token)
      validateInvite(resolved.token)
    }
    resolveParams()
  }, [params])

  const validateInvite = async (token: string) => {
    try {
      const response = await fetch(`/api/invites/${token}`)
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
          token: token,
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
              <div className="w-16 h-16 bg-success-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            )}
            {status === 'invalid' && (
              <div className="w-16 h-16 bg-danger-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
            )}
            {status === 'accepted' && (
              <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-sage" />
              </div>
            )}
            <CardTitle>
              {status === 'loading' && 'Validating Invitation...'}
              {status === 'valid' && 'You are invited!'}
              {status === 'invalid' && 'Invalid Invitation'}
              {status === 'accepted' && 'Invitation Accepted!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <p className="text-charcoal-secondary">Please wait while we verify your invitation.</p>
            )}
            {status === 'valid' && (
              <>
                <p className="text-charcoal-secondary mb-6">
                  You have been invited to join <strong>{invite?.group?.name || 'a group'}</strong>.
                  {invite?.email && ` This invitation is for ${invite.email}.`}
                </p>
                <Button onClick={handleAccept} className="w-full">
                  Accept Invitation
                </Button>
              </>
            )}
            {status === 'invalid' && (
              <p className="text-charcoal-secondary">
                This invitation is invalid or has expired. Please contact your group administrator for a new invitation.
              </p>
            )}
            {status === 'accepted' && (
              <p className="text-charcoal-secondary">
                Welcome to the group! Redirecting you to the dashboard...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
