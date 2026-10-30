import { Link } from 'react-router'
import { usePreview } from '../../app/previewStore'
import { assets } from '../../assets/design'

function SectionTitle({ title, to }: { title: string; to: string }) {
  return <div className="section-title"><h2>{title}</h2><Link to={to}>더보기</Link></div>
}
export default function Home() {
  const { schedules } = usePreview()
  return <section className="home" data-node-id="18:91">
    <header className="greeting"><div><p className="muted">안녕하세요</p><h1>정은우님 · 17기</h1></div><Link className="avatar" to="/mypage" aria-label="마이페이지">정</Link></header>
    <section className="session-card"><div className="session-copy"><p>운영진이 다음 세션을 준비하고 있어요</p><h2>다음 세션이 아직 없어요</h2></div><img className="calendar-image calendar-shadow" src={assets.calendarShadow} alt="" /><img className="calendar-image" src={assets.calendar} alt="다음 세션 준비 중인 달력" /><button className="primary attendance-button" disabled>출석하기</button></section>
    <div className="home-stats"><div><h2>내 출석률</h2><p><strong>92%</strong><span>11/12회 출석</span></p></div><div><h2>누적 세션</h2><p><strong>12회</strong><span>2026-2H</span></p></div></div>
    <SectionTitle title="공지사항" to="/notices" />
    <div className="home-notices">{['정규 세션 장소 안내', '11월 기후 동행 멘토링 참여 안내'].map((title, i) => <Link key={title} to={`/notices/${i + 1}`}><span>{title}</span><img src={assets.chevron} alt="" /></Link>)}</div>
    <SectionTitle title="다가오는 일정" to="/schedule" />
    <div className="home-schedules">{schedules.slice(0, 2).map(item => <Link className="schedule-row" key={item.id} to="/schedule"><div className="date-tile"><span>{Number(item.date.slice(5, 7))}월</span><strong>{Number(item.date.slice(8))}</strong></div><div><h3>{item.title}</h3><p>{item.time} · {item.location}</p></div></Link>)}</div>
  </section>
}
