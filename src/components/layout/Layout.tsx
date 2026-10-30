import { Link, Outlet, useLocation } from 'react-router'
import { assets } from '../../assets/common'

export function Header({ title, back = '/home' }: { title: string; back?: string }) {
  return <header className="page-header"><Link to={back} className="back-button" aria-label="뒤로"><img src={assets.back} alt="" /></Link><h1>{title}</h1></header>
}
export function BottomNav({ admin = false }: { admin?: boolean }) {
  const { pathname } = useLocation()
  const items = admin ? [ ['/home', '홈', assets.homeInactive], ['/admin/sessions', '관리', assets.adminActive], ['/mypage', '마이', assets.personInactive] ] : [ ['/home', '홈', assets.homeActive], ['/mypage', '마이페이지', assets.personInactive] ]
  return <nav className="bottom-nav" aria-label="주 메뉴">{items.map(([to, label, icon]) => {
    const selected = to.startsWith('/admin') ? pathname.startsWith('/admin') : pathname === to
    return <Link key={to} to={to} className={selected ? 'active' : ''} aria-current={selected ? 'page' : undefined}>
      <img src={icon} alt="" className={to.startsWith('/admin') && !selected ? 'inactive-admin-icon' : undefined} /><span>{label}</span>
    </Link>
  })}</nav>
}
export default function Layout() {
  const { pathname } = useLocation()
  const showNav = pathname === '/home' || pathname === '/mypage' || pathname.startsWith('/admin')
  return <div className={`app-shell ${showNav ? 'with-nav' : ''}`}><main key={pathname}><Outlet /></main>{showNav && <BottomNav admin={pathname.startsWith('/admin') || pathname === '/mypage'} />}</div>
}
