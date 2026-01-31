import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" />
      <div 
        className={cn(
          'relative bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto',
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06]">
          <h2 className="font-display text-2xl text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/[0.03] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-charcoal-secondary" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
