import './ProgressBar.css'

export interface ProgressBarProps {
  /** 0..1 */
  value: number
  exceeded?: boolean
  height?: number
}

export function ProgressBar({ value, exceeded, height = 8 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(value, 1)) * 100
  return (
    <div className={`ui-progress${exceeded ? ' is-exceeded' : ''}`} style={{ height }}>
      <div className="ui-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
