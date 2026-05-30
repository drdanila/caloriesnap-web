import { ReactNode } from 'react'
import './BottomNav.css'

export interface NavItem<T extends string> {
  key: T
  label: string
  icon: ReactNode
}

export interface BottomNavProps<T extends string> {
  items: NavItem<T>[]
  active: T
  onChange: (key: T) => void
}

export function BottomNav<T extends string>({ items, active, onChange }: BottomNavProps<T>) {
  return (
    <nav className="ui-bottomnav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`ui-bottomnav__item${active === item.key ? ' is-active' : ''}`}
          onClick={() => onChange(item.key)}
          aria-current={active === item.key ? 'page' : undefined}
        >
          <span className="ui-bottomnav__icon">{item.icon}</span>
          <span className="ui-bottomnav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
