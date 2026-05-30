import { HTMLAttributes } from 'react'
import './Card.css'

type Padding = 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding
  /** Adds a springy lift on hover (use for clickable cards). */
  interactive?: boolean
}

export function Card({ padding = 'md', interactive, className = '', children, ...rest }: CardProps) {
  const classes = [
    'ui-card',
    `ui-card--p-${padding}`,
    interactive ? 'ui-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
