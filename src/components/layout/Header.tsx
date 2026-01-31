import React from 'react'
import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
          <button className="relative p-2 hover:bg-black/[0.03] rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-charcoal-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
          </button>
        </div>
      </div>
    </header>
  )
}
