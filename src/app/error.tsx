'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-charcoal mb-2">
          Something went wrong
        </h1>
        <p className="text-charcoal-muted mb-8">
          We encountered an unexpected error. Don't worry, your data is safe. 
          Please try again or return to the dashboard.
        </p>

        {error.digest && (
          <p className="text-xs text-charcoal-muted mb-6 font-mono bg-gray-100 py-2 px-3 rounded-lg inline-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-charcoal/20 text-charcoal rounded-lg font-medium hover:bg-charcoal/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <p className="text-sm text-charcoal-muted mt-12">
          If this problem persists,{' '}
          <a href="mailto:support@sinkingfund.app" className="text-gold hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
