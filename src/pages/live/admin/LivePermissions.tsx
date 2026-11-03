import { useEffect,useState } from 'react'
import { Check,ChevronDown } from 'lucide-react'
import { Header } from '../../../components/layout/Layout'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useAction } from '../../../hooks/useAction'
import { useAuth } from '../../../auth/AuthState'
import { apiRequest } from '../../../api/client'
import { updateRole } from '../../../api/admin'
import type { MemberStatistics,MemberStatisticsPage } from '../../../api/adminTypes'
import Sheet from '../../../components/common/Sheet'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import AsyncState from '../../../components/common/AsyncState'
async function listMembers(signal:AbortSignal){
 const items:MemberStatistics[]=[]
 for(let page=0;;page++){
  const result=await apiRequest<MemberStatisticsPage>(`/api/v1/admin/statistics/members?sort=NAME_ASC&page=${page}&size=100`,{signal})
  items.push(...result.members)
  if(!result.hasNext)return items
  if(!result.members.length)throw Error('Invalid member pagination')
 }
}
export default function LivePermissions(){
 const generations=useApiQuery<{generations:number[]}>('/api/v1/admin/members/generations'),action=useAction(),auth=useAuth()
 const [members,setMembers]=useState<MemberStatistics[]|null>(null),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0),[generation,setGeneration]=useState<number|null>(null),[generationOpen,setGenerationOpen]=useState(false),[selected,setSelected]=useState<MemberStatistics|null>(null),[target,setTarget]=useState<{member:MemberStatistics;role:'MEMBER'|'ADMIN'}|null>(null)
 useEffect(()=>{const controller=new AbortController();void listMembers(controller.signal).then(items=>{if(!controller.signal.aborted){setMembers(items);setFailed(false)}}).catch(()=>{if(!controller.signal.aborted)setFailed(true)});return()=>controller.abort()},[attempt])
 return <section className="permissions"><Header title="권한 관리" back="/mypage"/><div className="generation-filter"><span id="live-generation-label">기수</span><button aria-labelledby="live-generation-label live-generation-value" aria-haspopup="dialog" aria-expanded={generationOpen} onClick={()=>setGenerationOpen(true)}><span id="live-generation-value">{generation===null?'기수를 선택하세요':`${generation}기`}</span><ChevronDown size={16}/></button></div>
 <h2 className="section-label">이번 학기 부원</h2><p className="api-inline-empty">현재 권한은 표시되지 않습니다. 변경할 권한을 선택해주세요.</p>
 {failed?<AsyncState error onRetry={()=>setAttempt(v=>v+1)}/>:!members?<AsyncState/>:members.filter(member=>generation===null||member.generation===generation).map(member=><div className="permission-row" key={member.memberId}><div><p>{member.generation}기</p><h3>{member.name}</h3></div><button className="permission-button" disabled={action.pending} onClick={()=>setSelected(member)}>권한 설정</button></div>)}
 {members&&!members.some(member=>generation===null||member.generation===generation)&&<p className="permissions-empty">해당 기수의 부원이 없어요.</p>}
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}
 {generationOpen&&<Sheet title="기수 선택" className="permission-generation-sheet" showCloseButton={false} onClose={()=>setGenerationOpen(false)}>{generations.error?<AsyncState error onRetry={generations.retry}/>:!generations.data?<AsyncState/>:generations.data.generations.map(value=><button className="generation-option" key={value} aria-pressed={generation===value} onClick={()=>{setGeneration(value);setGenerationOpen(false)}}><span>{value}기</span>{generation===value&&<Check size={20}/>}</button>)}</Sheet>}
 {selected&&<Sheet title={`${selected.name} 권한 설정`} onClose={()=>setSelected(null)}><button className="secondary" onClick={()=>{setTarget({member:selected,role:'ADMIN'});setSelected(null)}}>관리자 권한 부여</button><button className="secondary session-settings" onClick={()=>{setTarget({member:selected,role:'MEMBER'});setSelected(null)}}>관리자 권한 해제</button></Sheet>}
 {target&&<ConfirmDialog title={target.role==='ADMIN'?'관리자 권한 부여':'관리자 권한 해제'} confirmLabel={target.role==='ADMIN'?'부여':'해제'} onCancel={()=>setTarget(null)} onConfirm={()=>{const changing=target;setTarget(null);void action.run(()=>updateRole(changing.member.memberId,changing.role)).then(result=>{if(result.ok)void auth.retry()})}}>{target.member.name} 님의 권한을 {target.role==='ADMIN'?'관리자':'학회원'}로 변경할까요?</ConfirmDialog>}
 </section>
}
