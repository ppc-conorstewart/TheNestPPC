// src/components/ui/Button.jsx
import React from 'react'

/**
 * Simple className concatenator to replace `classnames`
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * A button with a Willow-palette gradient and hover state.
 *
 * Props:
 *  - variant: string (currently only 'willow')
 *  - children: ReactNode
 *  - className: additional tailwind classes
 *  - ...props: other button attributes (onClick, type, etc.)
 */
export default function Button({
  variant = 'willow',
  children,
  className = '',
  ...props
}) {
  // base styles for all variants
  const base = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'p-0.5',
    'text-sm',
    'font-medium',
    'rounded-base',
    'focus:outline-none',
    'focus:ring-4',
    'transition-all',
  ]

  // variant-specific styles
  const variants = {
    willow: {
      container: [
        'group',
        'bg-gradient-to-br',
        'from-willow-300',
        'to-willow-600',
        'hover:text-white',
        'dark:text-white',
        'focus:ring-willow-100',
        'dark:focus:ring-willow-800',
      ],
      inner: [
        'relative',
        'px-5',
        'py-2.5',
        'transition-all',
        'ease-in',
        'duration-75',
        'bg-willow-50',
        'dark:bg-willow-900',
        'rounded-md',
        'group-hover:bg-transparent',
        'group-hover:dark:bg-transparent',
        'text-willow-900',
        'dark:text-white',           // ← ensure text is visible on dark bg
      ],
    },
    // future variants can go here…
  }

  const { container, inner } = variants[variant] || variants.willow

  return (
    <button
      className={cn(...base, ...container, className)}
      {...props}
    >
      <span className={cn(...inner)}>{children}</span>
    </button>
  )
}
