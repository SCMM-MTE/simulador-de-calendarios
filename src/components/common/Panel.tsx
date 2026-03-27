/**
 * Componente Panel Reutilizable (para settings/configuración)
 */

import React from 'react'
import clsx from 'clsx'

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  icon?: string
  variant?: 'default' | 'info' | 'warning' | 'success' | 'error'
  collapsible?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      title,
      icon,
      variant = 'default',
      collapsible = false,
      defaultOpen = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    const variantClasses = {
      default: 'bg-white/80 border-gray-200',
      info: 'bg-blue-50/70 border-blue-200',
      warning: 'bg-yellow-50/70 border-yellow-200',
      success: 'bg-green-50/70 border-green-200',
      error: 'bg-red-50/70 border-red-200',
    }

    const titleColorClasses = {
      default: 'text-gray-800 border-gray-200',
      info: 'text-blue-800 border-blue-200',
      warning: 'text-yellow-800 border-yellow-200',
      success: 'text-green-800 border-green-200',
      error: 'text-red-800 border-red-200',
    }

    return (
      <div
        ref={ref}
        className={clsx('panel rounded-lg border p-5', variantClasses[variant], className)}
        {...props}
      >
        {title && (
          <div
            className={clsx(
              'mb-4 flex items-center justify-between border-b pb-2',
              titleColorClasses[variant]
            )}
          >
            <h3 className="font-black uppercase text-xs tracking-widest">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h3>
            {collapsible && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-lg font-bold transition-transform"
                style={{ transform: `rotate(${isOpen ? 0 : -90}deg)` }}
              >
                ▼
              </button>
            )}
          </div>
        )}

        {(!collapsible || isOpen) && <div className="space-y-4">{children}</div>}
      </div>
    )
  }
)

Panel.displayName = 'Panel'
