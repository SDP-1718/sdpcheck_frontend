import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Check,ChevronDown } from 'lucide-react'
import { Header } from '../../../components/layout/Layout'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useAction } from '../../../hooks/useAction'
import { useAuth } from '../../../auth/AuthState'
import { updateRole } from '../../../api/admin'
import { errorMessage } from '../../../api/errors'
import type { AdminMember,AdminMemberPage } from '../../../api/adminTypes'
import Sheet from '../../../components/common/Sheet'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import AsyncState from '../../../components/common/AsyncState'

function MemberList({generation}:{generation:number|null}){
 const [page,setPage]=useState(0),[target,setTarget]=useState<AdminMember|null>(null)
 const members=useApiQuery<AdminMemberPage>(  `/api/v1/admin/members?page=${page}&size=50${generation===null?'':`&generation=${generation}`}`)
 const action=useAction(),auth=useAuth()
 return <>
 {members.error?<AsyncState error message={errorMessage(members.error)} onRetry={members.retry}/>:!members.data?<AsyncState/>:members.data.members.length?members.data.members.map(member=><div className="permission-row" key={member.memberId}><div><p>{member.generation}기 · {member.role==='ADMIN'?'운영진':'학회원'}</p><h3>{member.name}</h3></div><button className={`permission-button ${member.role==='ADMIN'?'revoke':''}`} disabled={action.pending} aria-label={`${member.name} 관리자 권한 ${member.role==='ADMIN'?'해제':'부여'}`} onClick={()=>setTarget(member)}>{member.role==='ADMIN'?'해제':'부여'}</button></div>):<p className="permissions-empty">{generation===null?'등록된 회원이 없어요.':'해당 기수의 회원이 없어요.'}</p>}
 <div className="api-pagination">{page>0&&<button className="secondary" disabled={action.pending||members.loading} onClick={()=>setPage(value=>value-1)}>이전</button>}{members.data?.hasNext&&<button className="secondary" disabled={action.pending||members.loading} onClick={()=>setPage(value=>value+1)}>다음</button>}</div>
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}
 {target&&<ConfirmDialog title={target.role==='MEMBER'?'관리자 권한 부여':'관리자 권한 해제'} confirmLabel={target.role==='MEMBER'?'부여':'해제'} onCancel={()=>setTarget(null)} onConfirm={()=>{
  const changing=target;setTarget(null)
  void action.run(()=>updateRole(changing.memberId,changing.role==='ADMIN'?'MEMBER':'ADMIN')).then(result=>{
   if(result.ok){members.retry();void auth.retry()}
  })
 }}>{target.name} 님의 권한을 {target.role==='MEMBER'?'관리자':'학회원'}로 변경할까요?</ConfirmDialog>}
 </>
}

export default function LivePermissions(){
 const generations=useApiQuery<{generations:number[]}>('/api/v1/admin/members/generations')
 const [params,setParams]=useSearchParams(),[generationOpen,setGenerationOpen]=useState(false)
 const value=params.get('generation')
 const generation=value&&/^\d+$/.test(value)&&Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):null
 function setGeneration(next:number|null){
  setParams(previous=>{const search=new URLSearchParams(previous);if(next===null)search.delete('generation');else search.set('generation',String(next));return search},{replace:true})
 }
 return <section className="permissions"><Header title="권한 관리" back="/mypage"/><div className="generation-filter"><span id="live-generation-label">기수</span><button aria-labelledby="live-generation-label live-generation-value" aria-haspopup="dialog" aria-expanded={generationOpen} onClick={()=>setGenerationOpen(true)}><span id="live-generation-value">{generation===null?'전체 기수':`${generation}기`}</span><ChevronDown size={16}/></button></div>
 <h2 className="section-label">학회원 목록</h2>
 <MemberList key={generation??'all'} generation={generation}/>
 {generationOpen&&<Sheet title="기수 선택" className="permission-generation-sheet" showCloseButton={false} onClose={()=>setGenerationOpen(false)}><button className="generation-option" aria-pressed={generation===null} onClick={()=>{setGeneration(null);setGenerationOpen(false)}}><span>전체 기수</span>{generation===null&&<Check size={20}/>}</button>{generations.error?<AsyncState error message={errorMessage(generations.error)} onRetry={generations.retry}/>:!generations.data?<AsyncState/>:generations.data.generations.map(value=><button className="generation-option" key={value} aria-pressed={generation===value} onClick={()=>{setGeneration(value);setGenerationOpen(false)}}><span>{value}기</span>{generation===value&&<Check size={20}/>}</button>)}</Sheet>}
 </section>
}
