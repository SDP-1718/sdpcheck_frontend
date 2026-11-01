import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router'
import { usePreview } from '../../app/previewStore'
import { assets } from '../../assets/design'
import Sheet from '../../components/common/Sheet'
import Toggle from '../../components/common/Toggle'
import DateTimeFields from '../../components/common/DateTimeFields'
import { useSessionClock } from '../../hooks/useSessionClock'
import { previewCheckIns } from '../../mocks/admin'
import { parseLocalDate, shortDate, validTime } from '../../utils/date'
import type { AdminSession } from '../../types/admin'

function LiveSession({ session }: { session: AdminSession }) {
  const { setSessions } = usePreview()
  const [expanded, setExpanded] = useState(false)
  const finish = useCallback(() => setSessions(previous => previous.map(item => item.id === session.id ? { ...item, phase: 'ended' } : item)), [session.id, setSessions])
  const remaining = useSessionClock(session.endsAt, session.phase === 'active', finish)
  const ended = session.phase === 'ended' || remaining === 0
  return <>
    <section className={`qr-card ${ended ? 'session-is-ended' : ''}`} aria-label={ended ? '종료된 세션' : '진행 중인 세션'}>
      <img className="qr" src={assets.qr} alt="샘플 세션 QR 코드" />
      <div className="countdown-row"><div className="countdown"><img src={assets.countdown} alt="" /><strong>{ended ? 0 : remaining}</strong></div><p>다음 갱신까지<strong>{ended ? 0 : remaining}초</strong></p></div>
      <div className="checkin-summary"><span>실시간 체크인</span><span>6<span className="muted">/17명</span></span></div>
      <progress value={6} max={17} aria-label="실시간 체크인 6명 / 17명" />
      {ended && <button className="primary ended-session-button" disabled>세션이 종료되었습니다</button>}
    </section>
    <div className="section-title checkin-heading"><h2>체크인 현황</h2><button type="button" onClick={() => setExpanded(previous => !previous)}>{expanded ? '접기' : '더보기'}</button></div>
    {previewCheckIns.slice(0, expanded ? previewCheckIns.length : 4).map(item => <div className="checkin-row" key={item.id}><div><h3>{item.name}</h3><p>{item.time} 체크인</p></div><span className="attendance-badge">출석</span></div>)}
  </>
}

export default function Sessions() {
  const { sessions, setSessions } = usePreview()
  if (!sessions.length) return <p className="admin-empty" role="status">등록된 세션이 없어요</p>
  return <div>{sessions.map(session => session.phase === 'ready' ? <section className="admin-session-card" key={session.id}>
    <div className="session-card-heading"><p>{session.title}</p>{session.location && <span><MapPin size={12} aria-hidden="true" />{session.location}</span>}</div>
    <h2>{shortDate(session.date)} {session.time}</h2>
    <button type="button" className="primary" onClick={() => setSessions(previous => previous.map(item => item.id === session.id ? { ...item, phase: 'active', endsAt: Date.now() + 57_000 } : item))}>세션 시작하기</button>
  </section> : <LiveSession key={session.id} session={session} />)}</div>
}

export function SessionEditor() {
  const navigate = useNavigate()
  const { setSessions } = usePreview()
  const [title, setTitle] = useState('정규 세션')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [repeating, setRepeating] = useState(false)
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const ready = title.trim() && parseLocalDate(date) && validTime(time) && (!repeating || repeatDays.length > 0)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!ready) return
    setSessions(previous => [...previous, { id: crypto.randomUUID(), title: title.trim(), date, time, location: location.trim(), repeatDays: repeating ? [...repeatDays].sort() : [], phase: 'ready' }])
    navigate('/admin/sessions')
  }
  return <Sheet title="세션 만들기" className="admin-form-sheet session-sheet" onClose={() => navigate('/admin/sessions')}>
    <form onSubmit={submit}>
      <label className="admin-form-label first-label" htmlFor="session-title">세션명</label>
      <input id="session-title" className="admin-input" value={title} onChange={event => setTitle(event.target.value)} required />
      <DateTimeFields date={date} time={time} onDateChange={setDate} onTimeChange={setTime} labels />
      <label className="admin-form-label" htmlFor="session-location">장소(선택)</label>
      <input id="session-location" className="admin-input" value={location} onChange={event => setLocation(event.target.value)} placeholder="장소를 입력하세요 (선택)" />
      <div className="session-repeat"><span>매주 반복</span><Toggle label="매주 반복" checked={repeating} onChange={value => {
        setRepeating(value)
        if (value && !repeatDays.length) setRepeatDays([(parseLocalDate(date) ?? new Date()).getDay()])
      }} /></div>
      {repeating && <div className="session-weekdays" role="group" aria-label="반복 요일">{[1,2,3,4,5,6,0].map(day => <button type="button" key={day} aria-pressed={repeatDays.includes(day)} className={repeatDays.includes(day) ? 'is-selected' : ''}
        onClick={() => setRepeatDays(previous => previous.includes(day) ? previous.filter(value => value !== day) : [...previous, day])}>{['일','월','화','수','목','금','토'][day]}</button>)}</div>}
      <button className="primary admin-form-submit" disabled={!ready}>만들기</button>
    </form>
  </Sheet>
}
