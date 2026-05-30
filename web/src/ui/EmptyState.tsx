import { ReactNode } from 'react'
import './EmptyState.css'

export interface EmptyStateProps {
  emoji?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function EmptyState({ emoji, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="ui-empty">
      {emoji && <div className="ui-empty__emoji">{emoji}</div>}
      <p className="ui-empty__title">{title}</p>
      {subtitle && <span className="ui-empty__subtitle">{subtitle}</span>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  )
}
