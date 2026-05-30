import './Stat.css'

type Tone = 'mint' | 'green' | 'neutral'

export interface StatProps {
  value: string | number
  label: string
  tone?: Tone
  /** Render inside its own Card-like surface. */
  boxed?: boolean
}

export function Stat({ value, label, tone = 'green', boxed }: StatProps) {
  return (
    <div className={`ui-stat ui-stat--${tone}${boxed ? ' ui-stat--boxed' : ''}`}>
      <span className="ui-stat__value">{value}</span>
      <span className="ui-stat__label">{label}</span>
    </div>
  )
}
