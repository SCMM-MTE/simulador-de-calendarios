/**
 * Componente Card Reutilizable
 */

import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    const baseClasses = 'rounded-lg bg-white'

    const variantClasses = {
      default: 'border border-gray-200 shadow-sm',
      elevated: 'shadow-md border border-gray-100',
      bordered: 'border-2 border-gray-300',
    }

    const paddingClasses = {
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
