import { useEffect,useState } from 'react'
import type { FormEvent } from 'react'
import { Link,useNavigate,useParams } from 'react-router'
import QRCode from 'qrcode'
import { MoreHorizontal } from 'lucide-react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { usePollingQuery } from '../../../hooks/usePollingQuery'
import { useAction } from '../../../hooks/useAction'
import { createSession,updateSession,changeSession,deleteSession,getQr,getSession } from '../../../api/admin'
import type { AdminScheduleItem,AdminScheduleList,SessionDetail,SessionCheckIns,SessionQr } from '../../../api/adminTypes'
import { apiRequest } from '../../../api/client'
import { ApiError } from '../../../api/errors'
import { dateParts } from '../../../api/dates'
import { shortDate,parseLocalDate,validTime } from '../../../utils/date'
import QrCountdown from '../../../components/common/QrCountdown'
import Sheet from '../../../components/common/Sheet'
import DateTimeFields from '../../../components/common/DateTimeFields'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Toggle from '../../../components/common/Toggle'
import AsyncState from '../../../components/common/AsyncState'
import ItemActionsSheet from '../../../components/common/ItemActionsSheet'
const labels={PRESENT:'출석',LATE:'지각',ABSENT:'결석',NOT_CHECKED_IN:'미출석'}
function SessionBoard({session}:{session:SessionDetail}){
 const navigate=useNavigate(),action=useAction()
 const [expanded,setExpanded]=useState(false),[endOpen,setEndOpen]=useState(false),[settings,setSettings]=useState(false),[deleteOpen,setDeleteOpen]=useState(false)
 const [attendanceTarget,setAttendanceTarget]=useState<{memberId:number;name:string}|null>(null)
 const live=usePollingQuery<SessionCheckIns>(session.status==='SCHEDULED'?null:`/api/v1/admin/sessions/${session.sessionId}/check-ins`)
 const status=live.data?.sessionStatus??session.status
 const active=status==='IN_PROGRESS'
 const [qr,setQr]=useState<SessionQr|null>(null),[qrError,setQrError]=useState(false),[qrRevision,setQrRevision]=useState(0),[now,setNow]=useState(Date.now),[image,setImage]=useState<{token:string;source:string}|null>(null)
 useEffect(()=>{if(!active)return;const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[active])
 useEffect(()=>{
  if(!active)return
  const controller=new AbortController();let timer:number|undefined
  async function load(){
   try{
    const next=await getQr(session.sessionId,controller.signal)
    if(controller.signal.aborted)return
    if(!next.qrToken||!Number.isFinite(Date.parse(next.expiresAt))||Date.parse(next.expiresAt)<=Date.now())throw Error('Invalid QR response')
    setQr(next);setQrError(false);setNow(Date.now())
    timer=window.setTimeout(()=>{void load()},Math.max(250,Date.parse(next.expiresAt)-Date.now()))
   }catch(error){
    if(controller.signal.aborted)return
    setQrError(true)
    if(error instanceof ApiError&&[401,403,404].includes(error.status))return
    timer=window.setTimeout(()=>{void load()},5000)
   }
  }
  void load()
  return()=>{controller.abort();if(timer)window.clearTimeout(timer)}
 },[active,session.sessionId,qrRevision])
 useEffect(()=>{
  if(!qr)return
  let stopped=false
  void QRCode.toDataURL(qr.qrToken,{width:398,margin:4,errorCorrectionLevel:'M'}).then(source=>{if(!stopped)setImage({token:qr.qrToken,source})}).catch(()=>{if(!stopped)setQrError(true)})
  return()=>{stopped=true}
 },[qr])
 const remaining=active&&qr?Math.max(0,Math.ceil((Date.parse(qr.expiresAt)-now)/1000)):0
 const validQr=!!qr&&!!image&&image.token===qr.qrToken&&remaining>0
 async function start(){const result=await action.run(()=>changeSession(session.sessionId,'start'));if(result.ok)navigate(`/admin/sessions/${session.sessionId}`,{replace:true});if(result.ok)window.dispatchEvent(new Event('sdp:session-updated'))}
 return <>
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}
 {status==='SCHEDULED'?<section className="admin-session-card"><p>{session.title}</p><h2>{shortDate(session.sessionDate)} {session.startTime.slice(0,5)}</h2>{session.location&&<p>{session.location}</p>}<button className="primary" disabled={action.pending} onClick={()=>{void start()}}>세션 시작하기</button><button className="secondary session-settings" onClick={()=>setSettings(true)}>세션 설정</button></section>:<>
 <section className={`qr-card ${!active?'session-is-ended':''}`} aria-label={active?'진행 중인 세션':'종료된 세션'}>
 {image&&(validQr||!active)?<img className="qr generated-qr" src={image.source} alt={active?'출석체크 QR 코드':'종료된 세션 QR 코드'}/>:<div className="qr-placeholder" role="status">{active?(qrError?'QR을 불러오지 못했어요':'QR을 갱신하고 있어요'):'세션이 종료되었습니다'}</div>}
 <div className="countdown-row"><QrCountdown remaining={remaining}/><p>다음 갱신까지<strong>{remaining}초</strong></p></div>
 {qrError&&active&&<button className="secondary" onClick={()=>setQrRevision(v=>v+1)}>QR 다시 불러오기</button>}
 {live.data&&<><div className="checkin-summary"><span>실시간 체크인</span><span>{live.data.summary.checkedInCount}/{live.data.summary.totalCount}명</span></div><progress value={live.data.summary.checkedInCount} max={Math.max(1,live.data.summary.totalCount)} aria-label="실시간 체크인"/></>}
 {active?<button className="secondary session-settings" disabled={action.pending} onClick={()=>setEndOpen(true)}>세션 종료하기</button>:<button className="primary ended-session-button" disabled>세션이 종료되었습니다</button>}
 </section>
 <div className="section-title checkin-heading"><h2>체크인 현황</h2><button onClick={()=>setExpanded(v=>!v)}>{expanded?'접기':'더보기'}</button></div>
 {live.error&&<AsyncState error onRetry={live.retry}/>} {!live.data&&!live.error&&<AsyncState/>}
 {live.data?.members.slice(0,expanded?undefined:4).map(member=><div className="checkin-row" key={member.memberId}><div><h3>{member.name}</h3><p>{member.checkedInAt?`${dateParts(member.checkedInAt).time} 체크인`:`${member.generation}기`}</p></div><button type="button" disabled={action.pending} aria-label={`${member.name} 출석 상태 변경`} className={`attendance-badge status-${member.status.toLowerCase()}`} onClick={()=>setAttendanceTarget(member)}>{labels[member.status]}</button></div>)}
 </>}
 {attendanceTarget&&<Sheet title={`${attendanceTarget.name} 출석 상태`} onClose={()=>setAttendanceTarget(null)}>{(['PRESENT','LATE','ABSENT'] as const).map(value=><button className="generation-option" key={value} onClick={()=>{const member=attendanceTarget;setAttendanceTarget(null);void action.run(()=>apiRequest(`/api/v1/admin/sessions/${session.sessionId}/attendances/${member.memberId}`,{method:'PATCH',body:JSON.stringify({status:value})})).then(result=>{if(result.ok)live.retry()})}}>{labels[value]}</button>)}</Sheet>}
 {settings&&<ItemActionsSheet title="세션 관리" onClose={()=>setSettings(false)} onEdit={()=>{setSettings(false);navigate(`/admin/sessions/${session.sessionId}/edit`)}} onDelete={()=>{setSettings(false);setDeleteOpen(true)}}/>}
 {deleteOpen&&<ConfirmDialog title="세션을 삭제할까요?" confirmLabel="삭제" onCancel={()=>setDeleteOpen(false)} onConfirm={()=>{setDeleteOpen(false);void action.run(()=>deleteSession(session.sessionId)).then(result=>{if(result.ok)navigate('/admin/sessions',{replace:true})})}}>삭제한 세션은 되돌릴 수 없어요.</ConfirmDialog>}
 {endOpen&&<ConfirmDialog title="세션을 종료할까요?" confirmLabel="종료" onCancel={()=>setEndOpen(false)} onConfirm={()=>{setEndOpen(false);void action.run(()=>changeSession(session.sessionId,'end')).then(result=>{if(result.ok)live.retry()})}}>종료하면 더 이상 QR 출석을 받을 수 없어요.</ConfirmDialog>}
 </>
}
function SessionDetails({id}:{id:string}){
 const query=useApiQuery<SessionDetail>(`/api/v1/admin/sessions/${encodeURIComponent(id)}`)
 const retry=query.retry
 useEffect(()=>{const refresh=()=>retry();window.addEventListener('sdp:session-updated',refresh);return()=>window.removeEventListener('sdp:session-updated',refresh)},[retry])
 if(query.error)return <AsyncState error onRetry={query.retry}/>
 if(!query.data)return <AsyncState/>
 return <SessionBoard key={query.data.sessionId+query.data.status} session={query.data}/>
}
export default function LiveSessions(){
 const {sessionId}=useParams()
 return sessionId?<SessionDetails id={sessionId}/>:<SessionList/>
}
function SessionList(){
 const [page,setPage]=useState(1),[deleteTarget,setDeleteTarget]=useState<AdminScheduleItem|null>(null),[deleteBlocked,setDeleteBlocked]=useState(false)
 const action=useAction()
 async function requestDelete(item:AdminScheduleItem){
  const result=await action.run(()=>getSession(item.id))
  if(!result.ok)return
  if(result.value.status!=='SCHEDULED'){setDeleteBlocked(true);return}
  setDeleteTarget(item)
 }
 const query=useApiQuery<AdminScheduleList>(`/api/v1/admin/schedules?type=SESSION&page=${page}&size=20`)
 if(query.error)return <AsyncState error onRetry={query.retry}/>
 if(!query.data)return <AsyncState/>
 return <>{query.data.items.length?query.data.items.map(item=><section className="admin-session-card session-list-card" key={item.id}><button type="button" className="icon-button session-delete-menu" aria-label={`${item.title} 삭제 메뉴`} aria-haspopup="dialog" disabled={action.pending} onClick={()=>{void requestDelete(item)}}><MoreHorizontal size={22} aria-hidden="true"/></button><p>{item.title}</p><h2>{dateParts(item.startsAt).date} {dateParts(item.startsAt).time}</h2><Link className="primary" to={`/admin/sessions/${item.id}`}>세션 보기</Link></section>):<p className="admin-empty" role="status">등록된 세션이 없어요</p>}
 <div className="api-pagination">{page>1&&<button className="secondary" onClick={()=>setPage(v=>v-1)}>이전</button>}{page<query.data.page.totalPages&&<button className="secondary" onClick={()=>setPage(v=>v+1)}>다음</button>}</div>
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}
 {deleteBlocked&&<Sheet title="세션 삭제 안내" onClose={()=>setDeleteBlocked(false)}><p className="confirmation-copy">시작 전 예약 세션만 삭제할 수 있어요. 진행 중이거나 종료된 세션은 삭제할 수 없습니다.</p><button type="button" className="secondary" onClick={()=>setDeleteBlocked(false)}>확인</button></Sheet>}
 {deleteTarget&&<ConfirmDialog title="세션을 삭제할까요?" confirmLabel="삭제" onCancel={()=>setDeleteTarget(null)} onConfirm={()=>{
  const item=deleteTarget;setDeleteTarget(null)
  void action.run(()=>deleteSession(item.id)).then(result=>{
   if(result.ok){if(query.data?.items.length===1&&page>1)setPage(value=>value-1);else query.retry()}
  })
 }}>{deleteTarget.title} 세션을 삭제합니다. 삭제한 세션은 되돌릴 수 없어요.</ConfirmDialog>}
 </>
}
export function LiveSessionEditor(){
 const {sessionId}=useParams()
 return sessionId?<ExistingSessionForm id={sessionId}/>:<SessionForm/>
}
function ExistingSessionForm({id}:{id:string}){
 const query=useApiQuery<SessionDetail>(`/api/v1/admin/sessions/${encodeURIComponent(id)}`)
 if(query.error)return <AsyncState error onRetry={query.retry}/>
 if(!query.data)return <AsyncState/>
 return <SessionForm key={query.data.sessionId} existing={query.data}/>
}
function SessionForm({existing}:{existing?:SessionDetail}){
 const navigate=useNavigate(),action=useAction()
 const [title,setTitle]=useState(existing?.title??'정규 세션'),[date,setDate]=useState(existing?.sessionDate??''),[time,setTime]=useState(existing?.startTime.slice(0,5)??''),[location,setLocation]=useState(existing?.location??''),[repeating,setRepeating]=useState(false),[repeatDays,setRepeatDays]=useState<number[]>([])
 const valid=!!title.trim()&&!!parseLocalDate(date)&&validTime(time)&&(!repeating||repeatDays.length>0)&&(!existing||existing.status==='SCHEDULED')
 async function submit(event:FormEvent){
  event.preventDefault();if(!valid)return
  const input={title:title.trim(),sessionDate:date,startTime:time,location:location.trim()||null,...(!existing?{repeatWeekly:repeating,repeatDays:repeating?repeatDays.map(day=>['SUN','MON','TUE','WED','THU','FRI','SAT'][day]):[]}: {})}
  const result=await action.run(()=>existing?updateSession(existing.sessionId,input):createSession(input))
  if(result.ok)navigate(`/admin/sessions/${result.value.sessionId}`,{replace:true})
 }
 return <Sheet title={existing?'세션 수정':'세션 만들기'} className="admin-form-sheet session-sheet" onClose={()=>navigate(existing?`/admin/sessions/${existing.sessionId}`:'/admin/sessions')}><form onSubmit={event=>{void submit(event)}}><fieldset disabled={action.pending} className="api-form-fields">
 <label className="admin-form-label first-label" htmlFor="live-session-title">세션명</label><input id="live-session-title" className="admin-input" maxLength={100} value={title} onChange={event=>setTitle(event.target.value)} required/>
 <DateTimeFields date={date} time={time} onDateChange={setDate} onTimeChange={setTime} labels/>
 <label className="admin-form-label" htmlFor="live-session-place">장소(선택)</label><input id="live-session-place" className="admin-input" maxLength={200} value={location} onChange={event=>setLocation(event.target.value)} placeholder="장소를 입력하세요 (선택)"/>
 {!existing&&<><div className="session-repeat"><span>매주 반복</span><Toggle label="매주 반복" checked={repeating} onChange={value=>{setRepeating(value);if(value&&!repeatDays.length)setRepeatDays([(parseLocalDate(date)??new Date()).getDay()])}}/></div>{repeating&&<div className="session-weekdays" role="group" aria-label="반복 요일">{[1,2,3,4,5,6,0].map(day=><button type="button" key={day} aria-pressed={repeatDays.includes(day)} className={repeatDays.includes(day)?'is-selected':''} onClick={()=>setRepeatDays(previous=>previous.includes(day)?previous.filter(value=>value!==day):[...previous,day])}>{['일','월','화','수','목','금','토'][day]}</button>)}</div>}</>}
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}<button className="primary admin-form-submit" disabled={!valid||action.pending}>{action.pending?'저장 중...':existing?'저장하기':'만들기'}</button>
 </fieldset></form></Sheet>
}
