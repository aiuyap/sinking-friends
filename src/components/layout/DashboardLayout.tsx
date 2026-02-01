'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop Sidebar */}
      <Sidebar user={user} onSignOut={logout} />

      {/* Mobile Menu Overlay with Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-charcoal/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 200 
              }}
              className="absolute left-0 top-0 h-full w-72 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar 
                user={user} 
                onSignOut={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                mobile={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-72">
        <Header 
          title={title} 
          onMenuClick={toggleMobileMenu}
        />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
