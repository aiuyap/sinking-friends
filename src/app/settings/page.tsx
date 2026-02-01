'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  User, 
  Bell, 
  Shield, 
  LogOut,
  Mail,
  Camera,
  Check
} from 'lucide-react'

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile')
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailContributions: true,
    emailLoans: true,
    emailReminders: true,
    pushEnabled: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
    if (user) {
      setDisplayName(user.displayName || '')
      setEmail(user.email || '')
    }
  }, [user, authLoading])

  const handleSaveProfile = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    // TODO: Show toast notification
    alert('Profile saved!')
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    alert('Notification preferences saved!')
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (authLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const

  return (
    <DashboardLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-charcoal mb-2">Settings</h1>
          <p className="text-charcoal-muted">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-sage-dim text-sage'
                            : 'text-charcoal-secondary hover:bg-black/[0.03]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {user?.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={displayName} 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-sage flex items-center justify-center text-white text-2xl font-semibold">
                            {displayName[0] || email[0] || 'U'}
                          </div>
                        )}
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-cream transition-colors">
                          <Camera className="w-4 h-4 text-charcoal-muted" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-medium text-charcoal">{displayName || 'Your Name'}</h3>
                        <p className="text-sm text-charcoal-muted">{email}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                        className="bg-cream-dim cursor-not-allowed"
                      />
                      <p className="text-xs text-charcoal-muted">
                        Email is managed through your Google account and cannot be changed here.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-black/[0.06]">
                      <Button onClick={handleSaveProfile} isLoading={saving}>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-charcoal flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </h4>
                      
                      {[
                        { key: 'emailContributions', label: 'Contribution Reminders', description: 'Get notified before your contribution is due' },
                        { key: 'emailLoans', label: 'Loan Updates', description: 'Notifications about loan approvals, rejections, and payments' },
                        { key: 'emailReminders', label: 'Payment Reminders', description: 'Reminders for upcoming and overdue payments' },
                      ].map((item) => (
                        <label 
                          key={item.key}
                          className="flex items-start gap-4 p-4 rounded-lg border border-black/[0.06] hover:bg-cream-dim cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications] as boolean}
                              onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              notifications[item.key as keyof typeof notifications]
                                ? 'bg-sage border-sage'
                                : 'border-charcoal-muted'
                            }`}>
                              {notifications[item.key as keyof typeof notifications] && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-charcoal">{item.label}</p>
                            <p className="text-sm text-charcoal-muted">{item.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-black/[0.06]">
                      <Button onClick={handleSaveNotifications} isLoading={saving}>
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Security & Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Connected Account */}
                    <div>
                      <h4 className="font-medium text-charcoal mb-4">Connected Account</h4>
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-cream-dim">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal">Google Account</p>
                          <p className="text-sm text-charcoal-muted">{email}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Connected
                        </span>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-black/[0.06]">
                      <h4 className="font-medium text-danger mb-4">Danger Zone</h4>
                      <div className="p-4 rounded-lg border-2 border-danger/20 bg-danger/5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-charcoal">Sign Out</p>
                            <p className="text-sm text-charcoal-muted">
                              Sign out of your account on this device
                            </p>
                          </div>
                          <Button variant="danger" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
