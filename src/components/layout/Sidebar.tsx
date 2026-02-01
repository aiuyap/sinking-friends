import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  DollarSign,
  Settings, 
  LogOut
} from 'lucide-react'
interface SidebarProps {
  user: any
  onSignOut: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:border-r lg:border-black/[0.06] bg-white">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-20 px-8 border-b border-black/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl text-charcoal">Sinking Fund</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-sage-dim text-sage' 
                    : 'text-charcoal-secondary hover:bg-black/[0.03] hover:text-charcoal'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-black/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-cream-dim">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white font-semibold">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-charcoal-muted truncate">
                {user?.email}
              </p>
            </div>
            <button 
              onClick={onSignOut}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-charcoal-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
