import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { assets } from '../../assets/common'

export default function Sheet({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = previousOverflow }
  }, [])
  return <dialog ref={dialog} className={`sheet ${className}`} aria-labelledby="sheet-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <img className="sheet-handle" src={assets.sheetHandle} alt="" />
    <header className="sheet-heading"><h2 id="sheet-title">{title}</h2><button type="button" className="icon-button close-button" aria-label="닫기" onClick={onClose}><img src={assets.close} alt="" /></button></header>
    {children}
  </dialog>
}
