import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-[120px] font-display text-charcoal leading-none">404</h1>
          <div className="w-24 h-1 bg-gold mx-auto mt-4" />
        </div>
        
        <h2 className="text-2xl font-semibold text-charcoal mb-2">
          Page not found
        </h2>
        <p className="text-charcoal-muted mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-charcoal text-white rounded-lg font-medium hover:bg-charcoal/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-charcoal/20 text-charcoal rounded-lg font-medium hover:bg-charcoal/5 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-charcoal-muted mt-12">
          Need help?{' '}
          <a href="mailto:support@sinkingfund.app" className="text-gold hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
