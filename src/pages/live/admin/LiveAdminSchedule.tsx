import { useEffect,useState } from 'react'
import type { FormEvent } from 'react'
import { Link,useNavigate,useParams } from 'react-router'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useAction } from '../../../hooks/useAction'
import { apiRequest } from '../../../api/client'
import { deleteSchedule } from '../../../api/admin'
import type { AdminScheduleItem,AdminScheduleList } from '../../../api/adminTypes'
import { dateParts } from '../../../api/dates'
import Sheet from '../../../components/common/Sheet'
import DateTimeFields from '../../../components/common/DateTimeFields'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import ItemActionsSheet from '../../../components/common/ItemActionsSheet'
import AsyncState from '../../../components/common/AsyncState'
import { parseLocalDate,validTime } from '../../../utils/date'
export default function LiveAdminSchedule(){
 const [page,setPage]=useState(1),[selected,setSelected]=useState<AdminScheduleItem|null>(null),[deleting,setDeleting]=useState<AdminScheduleItem|null>(null)
 const query=useApiQuery<AdminScheduleList>(`/api/v1/admin/schedules?page=${page}&size=20`),action=useAction(),navigate=useNavigate()
 return <>
 {query.error?<AsyncState error onRetry={query.retry}/>:!query.data?<AsyncState/>:query.data.items.length?<div className="admin-schedule-list">{query.data.items.map(item=>{const {date,time}=dateParts(item.startsAt);return <button className="schedule-row" key={item.id} onClick={()=>item.type==='SESSION'?navigate(`/admin/sessions/${item.id}`):setSelected(item)} aria-label={`일정 관리: ${item.title}`}><div className="date-tile"><span>{Number(date.slice(5,7))}월</span><strong>{Number(date.slice(8))}</strong></div><div><h3>{item.title}</h3><p>{time}{item.location&&` · ${item.location}`}</p></div></button>})}</div>:<p className="admin-empty">등록된 일정이 없어요</p>}
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}
 <div className="api-pagination">{page>1&&<button className="secondary" onClick={()=>setPage(v=>v-1)}>이전</button>}{query.data&&page<query.data.page.totalPages&&<button className="secondary" onClick={()=>setPage(v=>v+1)}>다음</button>}</div>
 {selected&&(selected.canManage?<ItemActionsSheet title="일정 관리" onClose={()=>setSelected(null)} onEdit={()=>{navigate(`/admin/schedule/${selected.id}/edit`,{state:{schedule:selected}});setSelected(null)}} onDelete={()=>{setDeleting(selected);setSelected(null)}}/>:<Sheet title="일정 안내" onClose={()=>setSelected(null)}><p className="api-inline-empty">이 일정은 수정할 수 없어요.</p></Sheet>)}
 {deleting&&<ConfirmDialog title="삭제할까요?" confirmLabel="삭제" onCancel={()=>setDeleting(null)} onConfirm={()=>{const target=deleting;setDeleting(null);void action.run(()=>deleteSchedule(target)).then(result=>{if(result.ok)query.retry()})}}>삭제하면 되돌릴 수 없어요.</ConfirmDialog>}
 </>
}
async function findSchedule(id:string,signal?:AbortSignal){
 let page=1
 while(true){
  const result=await apiRequest<AdminScheduleList>(`/api/v1/admin/schedules?type=GENERAL&page=${page}&size=100`,{signal})
  const item=result.items.find(candidate=>candidate.id===id)
  if(item)return item
  if(page>=result.page.totalPages)return null
  page++
 }
}
export function LiveScheduleEditor(){
 const {id}=useParams()
 return id?<ExistingSchedule id={id}/>:<ScheduleForm/>
}
function ExistingSchedule({id}:{id:string}){
 const [state,setState]=useState<{id:string;item?:AdminScheduleItem|null;error?:boolean}>({id:''})
 const navigate=useNavigate()
 // Loading through the list also validates the current version after a direct URL/reload.
 const [attempt,setAttempt]=useState(0)
 useScheduleLoad(id,attempt,setState)
 if(state.id!==id)return <AsyncState/>
 if(state.error)return <AsyncState error onRetry={()=>setAttempt(v=>v+1)}/>
 if(!state.item)return <Sheet title="일정 수정" onClose={()=>navigate('/admin/schedule')}><p className="api-inline-empty">일정을 찾을 수 없어요.</p></Sheet>
 return <ScheduleForm key={state.item.id+state.item.version} existing={state.item}/>
}
function useScheduleLoad(id:string,attempt:number,setState:(state:{id:string;item?:AdminScheduleItem|null;error?:boolean})=>void){
 useEffect(()=>{const controller=new AbortController();void findSchedule(id,controller.signal).then(item=>{if(!controller.signal.aborted)setState({id,item})}).catch(()=>{if(!controller.signal.aborted)setState({id,error:true})});return()=>controller.abort()},[id,attempt,setState])
}
function ScheduleForm({existing}:{existing?:AdminScheduleItem}){
 const initial=existing?dateParts(existing.startsAt):{date:'',time:''},navigate=useNavigate(),action=useAction()
 const [title,setTitle]=useState(existing?.title??''),[date,setDate]=useState(initial.date),[time,setTime]=useState(initial.time),[place,setPlace]=useState(existing?.location??'')
 const allowed=!existing||(existing.type==='GENERAL'&&existing.canManage)
 const valid=!!title.trim()&&!!parseLocalDate(date)&&validTime(time)&&allowed
 async function submit(event:FormEvent){
  event.preventDefault();if(!valid)return
  const input={title:title.trim(),startsAt:`${date}T${time}:00+09:00`,location:place.trim()||null,...(existing?{version:existing.version}:{})}
  const result=await action.run(()=>apiRequest(existing?`/api/v1/admin/schedules/${existing.id}`:'/api/v1/admin/schedules',{method:existing?'PATCH':'POST',body:JSON.stringify(input)}))
  if(result.ok)navigate('/admin/schedule',{replace:true})
 }
 return <Sheet title={existing?'일정 수정':'새 일정 등록'} onClose={()=>navigate('/admin/schedule')} className="admin-form-sheet schedule-sheet"><form onSubmit={event=>{void submit(event)}}><fieldset disabled={action.pending||!allowed} className="api-form-fields"><input aria-label="일정명" className="editor-inline-title" maxLength={100} value={title} onChange={event=>setTitle(event.target.value)} placeholder="일정명" required/><DateTimeFields date={date} time={time} onDateChange={setDate} onTimeChange={setTime}/><label className="admin-form-label" htmlFor="live-event-place">장소(선택)</label><input id="live-event-place" className="admin-input" maxLength={200} value={place} onChange={event=>setPlace(event.target.value)} placeholder="장소를 입력하세요 (선택)"/>{action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}<button className="primary admin-form-submit" disabled={!valid||action.pending}>{action.pending?'저장 중...':existing?'저장하기':'만들기'}</button></fieldset></form>{!allowed&&<p className="api-inline-empty">이 일정은 수정할 수 없어요.</p>}<Link className="sr-only" to="/admin/schedule">일정 목록</Link></Sheet>
}
