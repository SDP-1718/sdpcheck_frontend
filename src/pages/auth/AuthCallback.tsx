import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../../auth/AuthState'
import AsyncState from '../../components/common/AsyncState'
import { MemberInformation } from '../onboarding/MemberInformation'
import { ApiError } from '../../api/errors'
import { RegistrationError } from '../../types/registration'
import { useMockApi } from '../../api/config'

export function AuthCallback(){
 const {session,retry}=useAuth()
 if(session.status==='loading')return <AsyncState message="로그인 정보를 확인하고 있어요"/>
 if(session.status==='onboarding')return <Navigate to="/onboarding/profile" replace/>
 if(session.status==='authenticated')return <Navigate to="/home" replace/>
 return <section className="api-state" role="alert"><p>로그인을 완료하지 못했어요. 다시 로그인해주세요.</p><button className="secondary" onClick={()=>{void retry()}}>다시 확인</button><Link to="/onboarding">로그인 화면으로</Link></section>
}
export function AuthMemberInformation(){
 const {session,retry,register}=useAuth()
 const [registrationStarted,setRegistrationStarted] = useState(false)
 if(useMockApi)return <MemberInformation/>
 if(session.status==='loading')return <AsyncState/>
 if(session.status==='error')return <AsyncState error onRetry={()=>{void retry()}}/>
 if(session.status==='anonymous')return <Navigate to="/onboarding" replace/>
 if(session.status==='authenticated'&&!registrationStarted)return <Navigate to="/home" replace/>
 return <MemberInformation registerMember={async input=>{
  setRegistrationStarted(true); try{const member=await register(input);return {name:member.name,generation:member.generation}}
  catch(error){setRegistrationStarted(false);if(error instanceof ApiError&&error.status===400)throw new RegistrationError('invitation');throw error}
 }}/>
}
