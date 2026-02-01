'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    // Return a no-op version if used outside provider (for backward compatibility)
    return {
      toast: (options: Omit<Toast, 'id'>) => {
        console.log('Toast (no provider):', options)
      },
      success: (title: string, description?: string) => {
        console.log('Toast success:', title, description)
      },
      error: (title: string, description?: string) => {
        console.log('Toast error:', title, description)
      },
      warning: (title: string, description?: string) => {
        console.log('Toast warning:', title, description)
      },
      info: (title: string, description?: string) => {
        console.log('Toast info:', title, description)
      }
    }
  }

  const { addToast } = context

  return {
    toast: addToast,
    success: (title: string, description?: string) => 
      addToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => 
      addToast({ title, description, variant: 'error' }),
    warning: (title: string, description?: string) => 
      addToast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) => 
      addToast({ title, description, variant: 'info' }),
  }
}

function ToastContainer() {
  const context = useContext(ToastContext)
  if (!context) return null

  const { toasts, removeToast } = context

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const variantConfig = {
  default: {
    bg: 'bg-white',
    border: 'border-black/[0.08]',
    icon: Info,
    iconColor: 'text-charcoal-muted'
  },
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600'
  },
  warning: {
    bg: 'bg-white',
    border: 'border-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600'
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600'
  }
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = variantConfig[toast.variant]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${config.bg} ${config.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px]`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-charcoal-muted mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/[0.05] rounded transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4 text-charcoal-muted" />
      </button>
    </motion.div>
  )
}
