import { useCallback } from 'react'
import { Link } from 'react-router'
import { useApiQuery } from '../../hooks/useApiQuery'
import { apiRequest } from '../../api/client'
import { ApiError,errorMessage } from '../../api/errors'
import { dateParts } from '../../api/dates'
import type { MySession } from '../../api/adminTypes'
import type { AttendanceOutcome } from '../../types/attendance'
import Attendance from '../attendance/Attendance'
import AttendanceResult from '../attendance/AttendanceResult'
import AsyncState from '../../components/common/AsyncState'
export default function LiveAttendance(){
 const current=useApiQuery<MySession>('/api/v1/sessions/current')
 const sessionId=current.data?.session?.sessionId
 const submit=useCallback(async(code:string):Promise<AttendanceOutcome>=>{
  if(!sessionId||!code.trim()||code.length>4096)throw new Error('올바른 출석 QR 코드를 스캔해주세요.')
  try{
   const result=await apiRequest<{sessionId:string;attendanceStatus:'PRESENT'|'LATE'|'ABSENT';checkedInAt:string}>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/check-ins`,{method:'POST',body:JSON.stringify({qrToken:code})})
   if(result.sessionId!==sessionId||!['PRESENT','LATE'].includes(result.attendanceStatus))throw new Error('출석 결과를 확인할 수 없어요.')
   return {status:result.attendanceStatus==='PRESENT'?'present':'late',checkedAt:dateParts(result.checkedInAt).time}
  }catch(error){
   if(error instanceof ApiError&&error.code==='CHECK_IN410_1')return {status:'expired'}
   if(error instanceof ApiError&&error.code==='CHECK_IN409_1')return {status:'duplicate'}
   if(error instanceof ApiError&&error.code==='CHECK_IN400_1')throw new Error('현재 세션의 올바른 QR 코드를 스캔해주세요.',{cause:error})
   if(error instanceof ApiError&&error.code==='SESSION409_1')throw new Error('출석 가능한 시간이 아니에요. 운영진에게 확인해주세요.',{cause:error})
   throw error
  }
 },[sessionId])
 if(current.error)return <AsyncState error message={errorMessage(current.error)} onRetry={current.retry}/>
 if(!current.data)return <AsyncState/>
 if(current.data.checkedIn)return <AttendanceResult result={{status:'duplicate',checkedAt:current.data.checkedInAt?dateParts(current.data.checkedInAt).time:undefined}}/>
 if(current.data.state!=='IN_PROGRESS'||!sessionId)return <section className="api-state"><p>지금은 출석할 수 있는 세션이 없어요.</p><Link className="secondary" to="/home">홈으로</Link></section>
 return <Attendance submitCode={submit}/>
}
