import './Spinner.css'

export interface SpinnerProps {
  size?: number
  /** stroke color; defaults to currentColor so it inherits the parent */
  color?: string
}

export function Spinner({ size = 24, color = 'currentColor' }: SpinnerProps) {
  return (
    <span
      className="ui-spinner"
      style={{ width: size, height: size, borderTopColor: color }}
      role="status"
      aria-label="loading"
    />
  )
}
