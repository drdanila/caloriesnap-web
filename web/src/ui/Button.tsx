import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  leftIcon,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth ? 'ui-btn--full' : '',
    loading ? 'ui-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : 18} />
      ) : (
        leftIcon && <span className="ui-btn__icon">{leftIcon}</span>
      )}
      {children && <span className="ui-btn__label">{children}</span>}
    </button>
  )
}
