import { Spinner } from './Spinner'
import './LoadingOverlay.css'

export interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="ui-overlay">
      <Spinner size={48} color="#fff" />
      {message && <p className="ui-overlay__msg">{message}</p>}
    </div>
  )
}
