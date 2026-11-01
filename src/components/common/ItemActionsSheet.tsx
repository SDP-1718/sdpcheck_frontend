import { Pencil, Trash2 } from 'lucide-react'
import Sheet from './Sheet'

export default function ItemActionsSheet({ title, onEdit, onDelete, onClose }: {
  title: string; onEdit: () => void; onDelete: () => void; onClose: () => void
}) {
  return <Sheet title={title} className="item-actions-sheet" onClose={onClose}>
    <button type="button" className="item-action" onClick={onEdit}><Pencil size={18} aria-hidden="true" />수정</button>
    <button type="button" className="item-action is-danger" onClick={onDelete}><Trash2 size={18} aria-hidden="true" />삭제</button>
    <button type="button" className="secondary item-actions-cancel" onClick={onClose}>취소</button>
  </Sheet>
}
