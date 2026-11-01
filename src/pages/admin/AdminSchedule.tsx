import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { usePreview } from '../../app/previewStore'
import Sheet from '../../components/common/Sheet'
import DateTimeFields from '../../components/common/DateTimeFields'
import ItemActionsSheet from '../../components/common/ItemActionsSheet'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { parseLocalDate, validTime } from '../../utils/date'

export function AdminSchedule() {
  const { schedules, setSchedules } = usePreview()
  const navigate = useNavigate()
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const selected = schedules.find(item => item.id === actionId)
  if (!schedules.length) return <p className="admin-empty" role="status">등록된 일정이 없어요</p>
  return <>
    <div className="admin-schedule-list">{schedules.map(item => <button type="button" key={item.id} className="schedule-row" aria-label={`일정 관리: ${item.title}`} onClick={() => setActionId(item.id)}>
      <div className="date-tile"><span>{Number(item.date.slice(5, 7))}월</span><strong>{Number(item.date.slice(8))}</strong></div>
      <div><h3>{item.title}</h3><p>{item.time}{item.location && ` · ${item.location}`}</p></div>
    </button>)}</div>
    {selected && <ItemActionsSheet title="일정 관리" onClose={() => setActionId(null)} onEdit={() => { setActionId(null); navigate(`/admin/schedule/${selected.id}/edit`) }}
      onDelete={() => { setActionId(null); setDeleteId(selected.id) }} />}
    {deleteId && <ConfirmDialog title="삭제할까요?" confirmLabel="삭제" onCancel={() => setDeleteId(null)} onConfirm={() => {
      setSchedules(previous => previous.filter(item => item.id !== deleteId)); setDeleteId(null)
    }}>삭제하면 되돌릴 수 없어요</ConfirmDialog>}
  </>
}

export function ScheduleEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { schedules, setSchedules } = usePreview()
  const existing = schedules.find(item => item.id === id)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [date, setDate] = useState(existing?.date ?? '')
  const [time, setTime] = useState(existing?.time ?? '')
  const [location, setLocation] = useState(existing?.location ?? '')
  const ready = title.trim() && parseLocalDate(date) && validTime(time)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!ready) return
    const item = { id: existing?.id ?? crypto.randomUUID(), title: title.trim(), date, time, location: location.trim() }
    setSchedules(previous => existing ? previous.map(current => current.id === id ? item : current) : [...previous, item])
    navigate('/admin/schedule')
  }
  if (id && !existing) return <Sheet title="새 일정 등록" onClose={() => navigate('/admin/schedule')}><p className="form-message">일정을 찾을 수 없어요.</p></Sheet>
  return <Sheet title="새 일정 등록" onClose={() => navigate('/admin/schedule')} className="admin-form-sheet schedule-sheet">
    <form onSubmit={submit}>
      <input aria-label="일정명" className="editor-inline-title" required value={title} onChange={event => setTitle(event.target.value)} placeholder="일정명" />
      <DateTimeFields date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
      <label className="admin-form-label" htmlFor="event-location">장소(선택)</label>
      <input className="admin-input" id="event-location" value={location} onChange={event => setLocation(event.target.value)} placeholder="장소를 입력하세요 (선택)" />
      <button className="primary admin-form-submit" disabled={!ready}>만들기</button>
    </form>
  </Sheet>
}
