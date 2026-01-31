import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({
  className,
  label,
  error,
  icon,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 bg-white border border-black/[0.08] rounded-lg',
            'text-charcoal placeholder:text-charcoal-muted',
            'focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage',
            'transition-all duration-200',
            icon && 'pl-12',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function TextArea({
  className,
  label,
  error,
  ...props
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 bg-white border border-black/[0.08] rounded-lg',
          'text-charcoal placeholder:text-charcoal-muted',
          'focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage',
          'transition-all duration-200 resize-y min-h-[100px]',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}
    </div>
  )
}
