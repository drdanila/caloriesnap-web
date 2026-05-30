import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode, forwardRef } from 'react'
import './FormField.css'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`ui-input ${className}`} {...rest} />
  }
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', children, ...rest }, ref) {
    return (
      <select ref={ref} className={`ui-input ui-select ${className}`} {...rest}>
        {children}
      </select>
    )
  }
)

export interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <span className="ui-field__error">{error}</span>}
    </div>
  )
}
