'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop Sidebar */}
      <Sidebar user={user} onSignOut={logout} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-charcoal/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 h-full w-72 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar user={user} onSignOut={() => {
              logout()
              setMobileMenuOpen(false)
            }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        <Header 
          title={title} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
