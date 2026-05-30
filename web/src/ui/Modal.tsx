import { ReactNode, useEffect } from 'react'
import './Modal.css'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** 'sheet' = bottom-anchored card (mobile), 'center' = centered dialog. */
  variant?: 'sheet' | 'center'
  ariaLabel?: string
}

export function Modal({ open, onClose, children, variant = 'center', ariaLabel }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`ui-modal ui-modal--${variant}`} role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="ui-modal__backdrop" onClick={onClose} />
      <div className="ui-modal__panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
