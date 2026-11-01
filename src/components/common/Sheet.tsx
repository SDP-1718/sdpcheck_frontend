import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { lockModalScroll } from '../../utils/modalScrollLock'
import { assets } from '../../assets/common'

export default function Sheet({ title, children, onClose, className = '', showCloseButton = true }: { title: string; children: ReactNode; onClose: () => void; className?: string; showCloseButton?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current!
    const releaseScroll = lockModalScroll()
    element.showModal()
    return () => { element.close(); releaseScroll() }
  }, [])
  return <dialog ref={dialog} className={`sheet ${className}`} aria-labelledby={titleId} onCancel={event => { event.stopPropagation(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <img className="sheet-handle" src={assets.sheetHandle} alt="" />
    <header className="sheet-heading"><h2 id={titleId}>{title}</h2>{showCloseButton && <button type="button" className="icon-button close-button" aria-label="닫기" onClick={onClose}><img src={assets.close} alt="" /></button>}</header>
    {children}
  </dialog>
}
