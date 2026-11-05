import { Link, useNavigate } from 'react-router'
import { assets } from '../../assets/design'
import AsyncState from '../../components/common/AsyncState'
import { useApiQuery } from '../../hooks/useApiQuery'
import { dateParts } from '../../api/dates'
import { errorMessage } from '../../api/errors'
import { formatAttendanceRate } from '../../utils/attendance'
import type { HomeResponse } from '../../api/types'
export default function LiveHome(){
 const navigate=useNavigate()
 const query=useApiQuery<HomeResponse>('/api/v1/home')
 if(query.error)return <AsyncState error message={errorMessage(query.error)} onRetry={query.retry}/>
 if(!query.data)return <AsyncState/>
 const {member,statistics,notices,upcomingSchedules,session}=query.data
 const attendanceRate=formatAttendanceRate(statistics.attendanceRate)
 const checked=session?.attendanceStatus==='PRESENT'||session?.attendanceStatus==='LATE'
 return <section className="home">
 <header className="greeting"><div><p className="muted">안녕하세요</p><h1>{member.name}님 · {member.generation}기</h1></div><Link className="avatar" to="/mypage" aria-label="마이페이지">{member.name.slice(0,1)}</Link></header>
 <section className="session-card"><div className="session-copy"><p>{session?'다가오는 세션':'운영진이 다음 세션을 준비하고 있어요'}</p><h2>{session?.title??'다음 세션이 아직 없어요'}</h2>{session&&<p>{dateParts(session.scheduledStartAt).date} {dateParts(session.scheduledStartAt).time}</p>}</div><img className="calendar-image calendar-shadow" src={assets.calendarShadow} alt=""/><img className="calendar-image" src={assets.calendar} alt="세션 일정 달력"/><button className="primary attendance-button" disabled={checked || !session || !['AVAILABLE','LATE_AVAILABLE'].includes(session.checkInStatus)} onClick={()=>navigate('/attendance')}>{checked?'출석 완료':session?.checkInStatus==='AVAILABLE'||session?.checkInStatus==='LATE_AVAILABLE'?'출석하기':'출석하기'}</button></section>
 <div className="home-stats"><div><h2>내 출석률</h2><p><strong>{attendanceRate}</strong><span>{statistics.attendedSessionCount}/{statistics.totalSessionCount}회 출석</span></p></div><div><h2>누적 세션</h2><p><strong>{statistics.totalSessionCount}회</strong><span>{statistics.periodCode}</span></p></div></div>
 <div className="section-title"><h2>공지사항</h2><Link to="/notices">더보기</Link></div><div className="home-notices">{notices.length?notices.map(item=><Link to={`/notices/${item.id}`} key={item.id}><span>{item.title}</span><img src={assets.chevron} alt=""/></Link>):<p className="api-inline-empty">등록된 공지가 없어요</p>}</div>
 <div className="section-title"><h2>다가오는 일정</h2><Link to="/schedule">더보기</Link></div><div className="home-schedules">{upcomingSchedules.length?upcomingSchedules.map(item=>{const {date,time}=dateParts(item.startsAt);return <Link to="/schedule" className="schedule-row" key={item.id}><div className="date-tile"><span>{Number(date.slice(5,7))}월</span><strong>{Number(date.slice(8))}</strong></div><div><h3>{item.title}</h3><p>{time}{item.location&&` · ${item.location}`}</p></div></Link>}):<p className="api-inline-empty">등록된 일정이 없어요</p>}</div>
 </section>
}
