import { ButtonHTMLAttributes, ReactNode } from 'react'
import './IconButton.css'

type Variant = 'solid' | 'soft' | 'ghost' | 'onAccent'
type Size = 'sm' | 'md'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Accessible label — required since the button has no visible text. */
  label: string
  children: ReactNode
}

export function IconButton({
  variant = 'soft',
  size = 'md',
  label,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  const classes = ['ui-iconbtn', `ui-iconbtn--${variant}`, `ui-iconbtn--${size}`, className]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={classes} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  )
}
