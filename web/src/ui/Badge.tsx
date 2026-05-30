import { HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

type Tone = 'mint' | 'neutral' | 'success' | 'warning' | 'danger'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  children: ReactNode
}

export function Badge({ tone = 'neutral', className = '', children, ...rest }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${tone} ${className}`} {...rest}>
      {children}
    </span>
  )
}
