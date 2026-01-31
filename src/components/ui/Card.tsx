import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ className, children, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-black/[0.06] shadow-sm',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border-2 border-sage/30',
  }

  return (
    <div
      className={cn(
        'relative rounded-xl p-6 transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'default' && (
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-sage/60" />
      )}
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-2xl text-charcoal', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-black/[0.06]', className)} {...props}>
      {children}
    </div>
  )
}
