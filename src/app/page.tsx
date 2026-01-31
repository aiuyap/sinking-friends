'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Users, DollarSign, TrendingUp, Shield, Calendar, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const features = [
    {
      icon: Users,
      title: 'Collaborative Groups',
      description: 'Create sinking fund groups with friends, family, or colleagues.',
    },
    {
      icon: Calendar,
      title: 'Bi-Weekly Contributions',
      description: 'Set your personal schedule and contribute every payday.',
    },
    {
      icon: DollarSign,
      title: 'Access to Loans',
      description: 'Borrow against pooled money with co-maker support at 5% monthly interest.',
    },
    {
      icon: TrendingUp,
      title: 'Earn Interest',
      description: 'Active members share interest earned from loans to other members.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Google authentication keeps your data safe and private.',
    },
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Join or Create a Group',
      description: 'Set up your bi-weekly contribution amount and personal payday.',
    },
    {
      step: 2,
      title: 'Contribute Regularly',
      description: 'Add money to the pool every 2 weeks on your schedule.',
    },
    {
      step: 3,
      title: 'Borrow When Needed',
      description: 'Get loans up to 50% of your average annual savings with co-maker support.',
    },
    {
      step: 4,
      title: 'Earn Interest',
      description: 'Active members receive proportional interest share at year-end.',
    },
  ]

  return (
    <div className="min-h-screen bg-cream">
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

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-5xl lg:text-7xl text-charcoal mb-6 leading-tight">
              Collaborative Wealth, <span className="text-sage">Managed Together</span>
            </h1>
            <p className="text-xl text-charcoal-secondary mb-10 max-w-2xl mx-auto">
              Join a sinking fund group, contribute bi-weekly with friends, borrow against pooled money, 
              and earn interest from loans to other members.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={signInWithGoogle} size="lg" isLoading={loading}>
                Sign in with Google
              </Button>
              <Button variant="outline" size="lg">
                <ArrowRight className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="relative h-64 hidden lg:block mt-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute left-1/4 top-0 w-64 bg-white rounded-xl shadow-lg p-6 transform -rotate-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sage-dim rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sage" />
              </div>
              <div>
                <h3 className="font-display text-lg text-charcoal">Vacation Fund</h3>
                <p className="text-sm text-charcoal-muted">Family Savings Group</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-muted">Progress</span>
                <span className="font-medium text-sage">75%</span>
              </div>
              <div className="h-2 bg-cream-dim rounded-full">
                <div className="h-full w-3/4 bg-sage rounded-full"></div>
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
              <div className="w-10 h-10 bg-terracotta-dim rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-display text-lg text-charcoal">Emergency Fund</h3>
                <p className="text-sm text-charcoal-muted">Colleague Group</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-muted">Members</span>
                <span className="font-medium text-terracotta">5 active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-muted">Pool Size</span>
                <span className="font-mono text-terracotta">₱260K</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
            <p className="text-lg text-charcoal-secondary max-w-2xl mx-auto mb-12">
              Built for modern financial collaboration with family, friends, or colleagues.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-cream rounded-xl p-8 text-center group hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-sage" />
                </div>
                <h3 className="font-display text-xl text-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-charcoal-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-lg text-charcoal-secondary max-w-2xl mx-auto mb-12">
              Simple 4-step process to start saving and earning together.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-sage rounded-full text-white font-display text-2xl mb-4 mx-auto">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl text-charcoal mb-3">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-secondary">
                    {item.description}
                  </p>
                </div>

                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-8">
                    <ArrowRight className="w-full h-full text-charcoal-muted" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-sage" />
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-2">
                  5% Monthly Interest
                </h3>
                <p className="text-charcoal-secondary">
                  For official members borrowing from the pool.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-2">
                  2-Month Fixed Term
                </h3>
                <p className="text-charcoal-secondary">
                  Consistent repayment schedule for all loans.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sage-dim rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-sage" />
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-2">
                  Year-End Payout
                </h3>
                <p className="text-charcoal-secondary">
                  Active members receive proportional interest share.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl">Sinking Fund</span>
          </div>
          <p className="text-white/60 mb-4">
            Collaborative wealth management for everyone.
          </p>
          <div className="flex items-center gap-6 justify-center text-sm text-white/40">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              About
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              Privacy
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
