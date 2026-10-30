import { Link } from 'react-router'
import { Header } from '../components/layout/Layout'

export default function Placeholder({ title }: { title: string }) {
  return (
    <section>
      <Header title={title} />
      <div className="unavailable">
        <h2>{title} 화면 준비 중</h2>
        <p>공통 레이아웃과 페이지 이동을 확인할 수 있습니다.</p>
        <Link className="primary" to="/home">홈으로 이동</Link>
        <Link to="/admin/sessions">관리자 화면</Link>
        <Link to="/mypage">마이페이지</Link>
      </div>
    </section>
  )
}
