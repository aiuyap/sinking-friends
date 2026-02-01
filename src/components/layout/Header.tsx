import React from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NotificationBell } from './NotificationBell'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl text-charcoal">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
