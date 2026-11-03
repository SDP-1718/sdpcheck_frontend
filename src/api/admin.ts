import { apiRequest } from './client'
import { ApiError } from './errors'
import type { SessionDetail, SessionQr, SessionCheckIns, AdminScheduleItem } from './adminTypes'
export interface SessionInput {title:string;sessionDate:string;startTime:string;endTime?:string|null;location:string|null;repeatWeekly?:boolean;repeatDays?:string[]}
export const createSession=(input:SessionInput)=>apiRequest<SessionDetail&{createdCount:number}>('/api/v1/admin/sessions',{method:'POST',body:JSON.stringify(input)})
export const updateSession=(id:string,input:SessionInput)=>apiRequest<SessionDetail>(`/api/v1/admin/sessions/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)})
export const getSession=(id:string,signal?:AbortSignal)=>apiRequest<SessionDetail>(`/api/v1/admin/sessions/${encodeURIComponent(id)}`,{signal})
export const getQr=(id:string,signal?:AbortSignal)=>apiRequest<SessionQr>(`/api/v1/admin/sessions/${encodeURIComponent(id)}/qr`,{signal})
export const getCheckIns=(id:string,signal?:AbortSignal)=>apiRequest<SessionCheckIns>(`/api/v1/admin/sessions/${encodeURIComponent(id)}/check-ins`,{signal})
export const changeSession=(id:string,action:'start'|'end')=>apiRequest<{sessionId:string;status:SessionDetail['status']}>(`/api/v1/admin/sessions/${encodeURIComponent(id)}/${action}`,{method:'POST'})
export const deleteSession=(id:string)=>apiRequest<void>(`/api/v1/admin/sessions/${encodeURIComponent(id)}`,{method:'DELETE'})
export const updateRole=(memberId:number,role:'MEMBER'|'ADMIN')=>apiRequest<{memberId:number;name:string;generation:number;role:'MEMBER'|'ADMIN'}>(`/api/v1/admin/members/${memberId}/role`,{method:'PATCH',body:JSON.stringify({role})})
export async function deleteSchedule(item:AdminScheduleItem){
 if(item.type!=='GENERAL'||!item.canManage)throw new ApiError(403,'FORBIDDEN','이 일정은 관리할 수 없습니다.')
 return apiRequest<void>(`/api/v1/admin/schedules/${encodeURIComponent(item.id)}?version=${item.version}`,{method:'DELETE'})
}
export function actionMessage(error:unknown){
 if(error instanceof ApiError){
  if(error.status===401)return '다시 로그인해주세요.'
  if(error.status===403)return '이 작업을 수행할 권한이 없습니다.'
  if(error.status===409)return '다른 변경이 있거나 처리할 수 없는 상태입니다. 최신 정보를 확인한 뒤 다시 시도해주세요.'
  if(error.status===429)return '요청이 많아요. 잠시 후 다시 시도해주세요.'
  if(error.status===400)return error.message||'입력한 내용을 확인해주세요.'
 }
 return '요청을 처리하지 못했어요. 다시 시도해주세요.'
}
