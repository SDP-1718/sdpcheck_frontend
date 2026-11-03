import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthState'
import type { Session } from './AuthState'
import { completeOnboarding, fetchMyInfo, issueAccessToken, logout as requestLogout } from '../api/auth'
import { clearAccessToken } from '../api/client'
import { useMockApi } from '../api/config'
import { ApiError } from '../api/errors'
import type { AccessTokenResponse } from '../api/types'
import type { MemberRegistration } from '../types/registration'

async function resolveSession(access: AccessTokenResponse): Promise<Session> {
 if (!access.onboardingCompleted) return {status:'onboarding',name:access.name}
 const member = await fetchMyInfo()
 if (!member || typeof member.name !== 'string' || !Number.isInteger(member.generation) || !['MEMBER','ADMIN'].includes(member.role)) throw new ApiError(502,'INVALID_RESPONSE','회원 정보를 확인할 수 없습니다.')
 return {status:'authenticated',member}
}
export function AuthProvider({children}:{children:ReactNode}) {
 const [session,setSession]=useState<Session>({status:useMockApi?'anonymous':'loading'})
 const [logoutFailed,setLogoutFailed]=useState(false)
 const retry=useCallback(async()=>{
  setSession({status:'loading'})
  try { setSession(await resolveSession(await issueAccessToken())) }
  catch(error) { clearAccessToken(); setSession({status:error instanceof ApiError && error.status===401?'anonymous':'error'}) }
 },[])
 useEffect(()=>{
  if(useMockApi)return
  let active=true
  const expired=()=>{if(active)setSession({status:'anonymous'})}
  window.addEventListener('sdp:session-expired',expired)
  void issueAccessToken().then(resolveSession).then(value=>{if(active)setSession(value)}).catch(error=>{
   if(active){clearAccessToken();setSession({status:error instanceof ApiError&&error.status===401?'anonymous':'error'})}
  })
  return()=>{active=false;window.removeEventListener('sdp:session-expired',expired)}
 },[])
 async function register(input:MemberRegistration) {
  let access:AccessTokenResponse
  try { access=await completeOnboarding(input) }
  catch(error){ if(error instanceof ApiError&&error.status===409)access=await issueAccessToken();else throw error }
  const next=await resolveSession(access)
  setSession(next)
  if(next.status!=='authenticated')throw new ApiError(409,'ONBOARDING_INCOMPLETE','회원정보 등록을 확인할 수 없습니다.')
  return next.member
 }
 async function logout(){
  setLogoutFailed(false)
  try{await requestLogout()}
  catch(error){setLogoutFailed(true);throw error}
  finally{setSession({status:'anonymous'})}
 }
 return <AuthContext.Provider value={{logoutFailed,session,retry,register,logout}}>{children}</AuthContext.Provider>
}
