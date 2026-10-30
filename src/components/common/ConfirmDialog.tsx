import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, children, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = previousOverflow }
  }, [])

  return (
    <dialog ref={dialog} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={onCancel} onClick={event => { if (event.target === event.currentTarget) onCancel() }}>
      <div className="confirm-dialog-content">
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{children}</p>
      </div>
      <div className="confirm-dialog-actions">
        <button type="button" onClick={onCancel}>취소</button>
        <button type="button" className="confirm-action" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  )
}
