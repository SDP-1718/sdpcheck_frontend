import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { assets } from '../../assets/design'

const tabs = [['sessions', '세션'], ['notices', '공지'], ['schedule', '일정'], ['statistics', '통계']]
export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const section = pathname.split('/')[2]
  const label = section === 'sessions' ? '세션 만들기' : section === 'notices' ? '새공지' : '새일정'
  return <section className="admin-page">
    <header className="admin-header"><div><p>운영진</p><h1>관리</h1></div>{section !== 'statistics' && <button type="button" className="add-button" onClick={() => navigate(`/admin/${section}/new`)}><img src={assets.plus} alt="" />{label}</button>}</header>
    <nav className="admin-tabs" aria-label="관리 메뉴">{tabs.map(([path, title]) => <NavLink key={path} to={`/admin/${path}`}>{title}</NavLink>)}</nav>
    <Outlet />
  </section>
}
