import './ProgressRing.css'

export interface ProgressRingProps {
  /** 0..1 */
  value: number
  size?: number
  stroke?: number
  exceeded?: boolean
  /** Text rendered in the center (e.g. current amount). */
  center?: string | number
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  exceeded,
  center,
}: ProgressRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(value, 1))
  const offset = c * (1 - pct)
  const cx = size / 2

  return (
    <div className={`ui-ring${exceeded ? ' is-exceeded' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ui-ring__track" cx={cx} cy={cx} r={r} strokeWidth={stroke} />
        <circle
          className="ui-ring__fill"
          cx={cx}
          cy={cx}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </svg>
      {center !== undefined && <span className="ui-ring__center">{center}</span>}
    </div>
  )
}
