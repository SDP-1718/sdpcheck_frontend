import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { usePreview } from '../../app/previewStore'
import Sheet from '../../components/common/Sheet'
import Toggle from '../../components/common/Toggle'
import ItemActionsSheet from '../../components/common/ItemActionsSheet'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import type { GenerateNoticeDraft } from '../../types/admin'

export function AdminNotices() {
  const { notices, setNotices } = usePreview()
  const navigate = useNavigate()
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const selected = notices.find(item => item.id === actionId)
  if (!notices.length) return <p className="admin-empty" role="status">등록된 공지가 없어요</p>
  return <>
    <div className="admin-notice-list">{[...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned)).map(item => <button type="button" key={item.id} className="admin-notice-card" aria-label={`공지 관리: ${item.title}`} onClick={() => setActionId(item.id)}>
      <div className="admin-notice-meta">{item.pinned && <span>고정</span>}<time>{item.date}</time></div><h2>{item.title}</h2>
    </button>)}</div>
    {selected && <ItemActionsSheet title="공지 관리" onClose={() => setActionId(null)} onEdit={() => { setActionId(null); navigate(`/admin/notices/${selected.id}/edit`) }}
      onDelete={() => { setActionId(null); setDeleteId(selected.id) }} />}
    {deleteId && <ConfirmDialog title="삭제할까요?" confirmLabel="삭제" onCancel={() => setDeleteId(null)} onConfirm={() => {
      setNotices(previous => previous.filter(item => item.id !== deleteId)); setDeleteId(null)
    }}>삭제하면 되돌릴 수 없어요</ConfirmDialog>}
  </>
}

export function NoticeEditor({ generateDraft }: { generateDraft?: GenerateNoticeDraft }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notices, setNotices } = usePreview()
  const existing = notices.find(item => item.id === id)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [pinned, setPinned] = useState(existing?.pinned ?? false)
  const [memo, setMemo] = useState('')
  const [draftStatus, setDraftStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function createDraft() {
    if (!memo.trim() || draftStatus === 'loading') return
    setDraftStatus('loading')
    try {
      if (!generateDraft) throw new Error('Draft generation is not connected')
      const draft = await generateDraft(memo.trim())
      setTitle(draft.title); setBody(draft.body); setDraftStatus('idle')
    } catch { setDraftStatus('error') }
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) return
    const notice = { id: existing?.id ?? crypto.randomUUID(), title: title.trim(), body: body.trim(), pinned, date: existing?.date ?? new Date().toLocaleDateString('sv-SE').replaceAll('-', '.'), author: '운영진' }
    setNotices(previous => existing ? previous.map(item => item.id === id ? notice : item) : [notice, ...previous])
    navigate('/admin/notices')
  }
  if (id && !existing) return <Sheet title="공지 수정" onClose={() => navigate('/admin/notices')}><p className="form-message">공지사항을 찾을 수 없어요.</p></Sheet>
  return <Sheet title="새 공지 작성" onClose={() => navigate('/admin/notices')} className="notice-sheet">
    <form onSubmit={submit}>
      <label className="memo-label" htmlFor="memo">AI로 초안 만들기 ✨</label>
      <textarea id="memo" className="memo-input" value={memo} onChange={event => setMemo(event.target.value)} placeholder="회의 메모나 정리 안 된 내용을 붙여넣으세요" />
      <button type="button" className="secondary draft-button" disabled={!memo.trim() || draftStatus === 'loading'} onClick={() => { void createDraft() }}>
        {draftStatus === 'loading' ? <><LoaderCircle className="draft-spinner" size={16} aria-hidden="true" />생성 중...</> : existing || draftStatus === 'error' ? '초안 생성 다시 하기' : '초안 생성하기'}
      </button>
      {draftStatus === 'error' && <p className="form-message" role="status">지금은 초안을 만들 수 없어요. 직접 작성하거나 다시 시도해주세요.</p>}
      <div className="editor-fields"><input aria-label="공지 제목" required value={title} onChange={event => setTitle(event.target.value)} placeholder="제목을 입력하세요" />
        <textarea aria-label="공지 내용" required value={body} onChange={event => setBody(event.target.value)} placeholder="내용을 입력하세요" /></div>
      <div className="notice-pin"><span>상단 고정</span><Toggle label="상단 고정" checked={pinned} onChange={setPinned} /></div>
      <button className="primary" disabled={!title.trim() || !body.trim() || draftStatus === 'loading'}>게시하기</button>
    </form>
  </Sheet>
}
