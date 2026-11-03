import { apiRequest, clearAccessToken, getAuthEpoch, setAccessToken } from './client'
import { apiBaseUrl } from './config'
import { ApiError } from './errors'
import type { AccessTokenResponse, MyInfo } from './types'
import type { MemberRegistration } from '../types/registration'
let issuing: Promise<AccessTokenResponse> | null = null
export const kakaoLoginUrl = `${apiBaseUrl}/api/v1/auth/kakao/login`
export function issueAccessToken() {
 if (!issuing) {
  const epoch = getAuthEpoch()
  issuing = apiRequest<AccessTokenResponse>('/api/v1/auth/access-token', {method:'POST'}, false).then(result => {
   if (epoch !== getAuthEpoch()) throw new ApiError(401, 'SESSION_CHANGED', '로그인이 종료되었습니다.')
   if (!result || typeof result.accessToken !== 'string' || !result.accessToken || typeof result.onboardingCompleted !== 'boolean') throw new ApiError(502,'INVALID_RESPONSE','로그인 응답을 확인할 수 없습니다.')
   setAccessToken(result.accessToken)
   return result
  }).finally(()=>{issuing=null})
 }
 return issuing
}
export const fetchMyInfo = () => apiRequest<MyInfo>('/api/v1/members/me')
export async function completeOnboarding(input: MemberRegistration) {
 await apiRequest<{name:string; generation:number}>('/api/v1/auth/onboarding',{method:'POST',body:JSON.stringify({name:input.name,generation:input.generation,inviteCode:input.invitationCode})})
 // The response does not include a new access token. Obtain one with the updated member status.
 return issueAccessToken()
}
export async function logout() {
 clearAccessToken()
 await apiRequest<void>('/api/v1/auth/logout',{method:'POST'},false)
}
