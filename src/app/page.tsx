'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { DollarSign, Users, TrendingUp, Shield } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Collaborative Groups',
    description: 'Create sinking fund groups and invite friends to join your financial journey.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor payments, interest, and balances with beautiful visualizations.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Bank-level security with Google authentication keeps your data safe.',
  },
]

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl text-charcoal">Sinking Fund</span>
            </div>
            <Button onClick={signInWithGoogle} isLoading={loading}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-5xl lg:text-7xl text-charcoal mb-6 leading-tight">
              Wealth, <span className="text-sage">Managed</span> Together
            </h1>
            <p className="text-xl text-charcoal-secondary mb-10 max-w-2xl mx-auto">
              Create collaborative sinking funds, track payments and interest, and achieve your financial goals with friends and family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={signInWithGoogle} isLoading={loading}>
                Sign in with Google
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Floating Cards Animation */}
          <div className="mt-20 relative h-64 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute left-1/4 top-0 w-64 bg-white rounded-xl shadow-lg p-6 transform -rotate-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-sage" />
                </div>
                <span className="font-semibold text-charcoal">Vacation Fund</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-muted">Progress</span>
                  <span className="font-medium text-charcoal">75%</span>
                </div>
                <div className="h-2 bg-cream-dim rounded-full">
                  <div className="h-full w-3/4 bg-sage rounded-full" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute right-1/4 top-8 w-64 bg-white rounded-xl shadow-lg p-6 transform rotate-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-terracotta/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-terracotta" />
                </div>
                <span className="font-semibold text-charcoal">5 Members</span>
              </div>
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-cream-dim border-2 border-white" />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-charcoal mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-charcoal-secondary max-w-2xl mx-auto">
              Built for modern financial collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-cream rounded-xl p-8 text-center group hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-sage" />
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-3">
                  {feature.title}
                </h3>
                <p className="text-charcoal-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl">Sinking Fund</span>
          </div>
          <p className="text-white/60">
            Collaborative wealth management for everyone.
          </p>
        </div>
      </footer>
    </div>
  )
}
