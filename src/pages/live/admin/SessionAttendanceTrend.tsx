import { useApiQuery } from '../../../hooks/useApiQuery'
import type { SessionAttendanceStatisticsResponse } from '../../../api/adminTypes'
import { dateParts } from '../../../api/dates'
import { errorMessage } from '../../../api/errors'
import { formatAttendanceRate } from '../../../utils/attendance'
import AsyncState from '../../../components/common/AsyncState'

export default function SessionAttendanceTrend(){
 const query=useApiQuery<SessionAttendanceStatisticsResponse>('/api/v1/admin/statistics/sessions')
 if(query.error)return <AsyncState error message={errorMessage(query.error)} onRetry={query.retry}/>
 if(!query.data)return <AsyncState message="출석 추이를 불러오고 있어요"/>
 if(!query.data.sessions.length)return <p className="api-inline-empty">종료된 정규 세션이 없어요.</p>
 const sessions=query.data.sessions.map(session=>({...session,...dateParts(session.startsAt)}))
 const description=sessions.map(session=>`${session.sessionTitle} ${session.date} ${session.time}, 출석률 ${formatAttendanceRate(session.attendanceRate)}`).join('; ')
 return <div className="chart session-trend" role="img" aria-label={`세션별 출석 추이: ${description}`}>{sessions.map(session=>{
  const rate=typeof session.attendanceRate==='number'&&Number.isFinite(session.attendanceRate)?Math.max(0,Math.min(100,session.attendanceRate)):0
  return <div className="chart-column" key={session.sessionId} aria-hidden="true"><span className="trend-track"><span className="chart-bar" style={{height:`${rate}%`}}/></span><span>{Number(session.date.slice(5,7))}/{Number(session.date.slice(8))}</span></div>
 })}</div>
}
