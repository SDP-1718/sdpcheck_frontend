import { Link, Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthState'
import { useMockApi } from '../api/config'
import AsyncState from '../components/common/AsyncState'

export function RequireSession({admin=false}:{admin?:boolean}) {
 const {session,retry}=useAuth()
 if(useMockApi)return <Outlet/>
 if(session.status==='loading')return <AsyncState/>
 if(session.status==='error')return <AsyncState error onRetry={()=>{void retry()}}/>
 if(session.status==='anonymous')return <Navigate to="/onboarding" replace/>
 if(session.status==='onboarding')return <Navigate to="/onboarding/profile" replace/>
 if(admin&&session.member.role!=='ADMIN')return <section className="api-state"><p>관리자만 접근할 수 있는 화면입니다.</p><Link className="secondary" to="/home">홈으로</Link></section>
 return <Outlet/>
}
