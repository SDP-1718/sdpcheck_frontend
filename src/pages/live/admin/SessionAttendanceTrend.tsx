import { useState } from 'react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import type { SessionAttendanceStatisticsResponse } from '../../../api/adminTypes'
import { dateParts } from '../../../api/dates'
import { errorMessage } from '../../../api/errors'
import { formatAttendanceRate } from '../../../utils/attendance'
import AsyncState from '../../../components/common/AsyncState'

export default function SessionAttendanceTrend(){
 const query=useApiQuery<SessionAttendanceStatisticsResponse>('/api/v1/admin/statistics/sessions')
 const [selectedId,setSelectedId]=useState<string|null>(null)
 if(query.error)return <AsyncState error message={errorMessage(query.error)} onRetry={query.retry}/>
 if(!query.data)return <AsyncState message="출석 추이를 불러오고 있어요"/>
 if(!query.data.sessions.length)return <p className="api-inline-empty">종료된 정규 세션이 없어요.</p>
 const sessions=query.data.sessions
 const selected=sessions.find(session=>session.sessionId===selectedId)??sessions[sessions.length-1]
 const selectedDate=dateParts(selected.startsAt)
 return <section className="session-trend" aria-label="세션별 출석 추이">
 <div className="chart" role="group" aria-label="세션을 선택하면 출석 현황을 확인할 수 있어요">{sessions.map(session=>{
  const {date,time}=dateParts(session.startsAt)
  const rate=typeof session.attendanceRate==='number'&&Number.isFinite(session.attendanceRate)?session.attendanceRate:null
  return <button type="button" className="trend-column" key={session.sessionId} aria-pressed={selected.sessionId===session.sessionId} aria-controls="session-trend-detail" aria-label={`${session.sessionTitle} ${date} ${time}, 출석률 ${formatAttendanceRate(rate)}`} onClick={()=>setSelectedId(session.sessionId)}>
   <span className="trend-rate">{formatAttendanceRate(rate)}</span>
   <span className="trend-track" aria-hidden="true">{rate===null?<span className="trend-unavailable"/>:<span className="chart-bar" style={{height:`${Math.max(0,Math.min(100,rate))}%`}}/>}</span>
   <span className="trend-date">{Number(date.slice(5,7))}/{Number(date.slice(8))}</span>
  </button>
 })}</div>
 <div className="trend-detail" id="session-trend-detail" aria-live="polite" aria-atomic="true"><h3>{selected.sessionTitle}</h3><p>{selectedDate.date.replaceAll('-','.')} · {selectedDate.time}</p><dl><div><dt>대상</dt><dd>{selected.totalCount}명</dd></div><div><dt>출석</dt><dd>{selected.presentCount}명</dd></div><div><dt>지각</dt><dd>{selected.lateCount}명</dd></div><div><dt>결석</dt><dd>{selected.absentCount}명</dd></div></dl></div>
 </section>
}
