import { useState } from 'react'
import type { ChangeEvent,FormEvent } from 'react'
import { useNavigate,useParams } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useAction } from '../../../hooks/useAction'
import { apiRequest } from '../../../api/client'
import type { AdminNoticeList } from '../../../api/adminTypes'
import type { NoticeDetailResponse } from '../../../api/types'
import { dateParts } from '../../../api/dates'
import Sheet from '../../../components/common/Sheet'
import Toggle from '../../../components/common/Toggle'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import ItemActionsSheet from '../../../components/common/ItemActionsSheet'
import NoticeImage from '../../../components/common/NoticeImage'
import AsyncState from '../../../components/common/AsyncState'
export default function LiveAdminNotices(){
 const query=useApiQuery<AdminNoticeList>('/api/v1/admin/notices'),action=useAction(),navigate=useNavigate()
 const [selected,setSelected]=useState<string|null>(null),[deleting,setDeleting]=useState<string|null>(null)
 const items=query.data?[...(query.data.pinnedNotice?[query.data.pinnedNotice]:[]),...query.data.items.filter(item=>item.id!==query.data?.pinnedNotice?.id)]:[]
 return <>
 {query.error?<AsyncState error onRetry={query.retry}/>:!query.data?<AsyncState/>:items.length?<div className="admin-notice-list">{items.map(item=><button className="admin-notice-card" key={item.id} aria-label={`공지 관리: ${item.title}`} onClick={()=>setSelected(item.id)}><div className="admin-notice-meta">{item.isPinned&&<span>고정</span>}<time>{dateParts(item.createdAt).date.replaceAll('-','.')}</time></div><h2>{item.title}</h2></button>)}</div>:<p className="admin-empty">등록된 공지가 없어요</p>}
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}
 {selected&&<ItemActionsSheet title="공지 관리" onClose={()=>setSelected(null)} onEdit={()=>{navigate(`/admin/notices/${selected}/edit`);setSelected(null)}} onDelete={()=>{setDeleting(selected);setSelected(null)}}/>}
 {deleting&&<ConfirmDialog title="삭제할까요?" confirmLabel="삭제" onCancel={()=>setDeleting(null)} onConfirm={()=>{const id=deleting;setDeleting(null);void action.run(()=>apiRequest<void>(`/api/v1/admin/notices/${encodeURIComponent(id)}`,{method:'DELETE'})).then(result=>{if(result.ok)query.retry()})}}>삭제하면 되돌릴 수 없어요.</ConfirmDialog>}
 </>
}
export function LiveNoticeEditor(){
 const {id}=useParams()
 return id?<ExistingNotice id={id}/>:<NoticeForm/>
}
function ExistingNotice({id}:{id:string}){
 const query=useApiQuery<NoticeDetailResponse>(`/api/v1/notices/${encodeURIComponent(id)}`)
 if(query.error)return <AsyncState error onRetry={query.retry}/>
 if(!query.data)return <AsyncState/>
 return <NoticeForm key={query.data.id} existing={query.data}/>
}
function fileIdFromUrl(url:string){
 try{return new URL(url,'https://placeholder.invalid').pathname.match(/\/api\/v1\/files\/([0-9a-f-]{36})$/i)?.[1]??null}catch{return null}
}
function NoticeForm({existing}:{existing?:NoticeDetailResponse}){
 const navigate=useNavigate(),save=useAction(),draft=useAction(),upload=useAction()
 const [title,setTitle]=useState(existing?.title??''),[body,setBody]=useState(existing?.content??''),[pinned,setPinned]=useState(existing?.isPinned??false),[memo,setMemo]=useState(''),[files,setFiles]=useState<{fileId:string;name:string}[]>([]),[fileError,setFileError]=useState('')
 const oldUrls=existing?.imageUrls??[],oldIds=oldUrls.map(fileIdFromUrl),canAppend=oldIds.every(Boolean),busy=save.pending||draft.pending||upload.pending
 async function generate(){
  if(!memo.trim()||busy)return
  const result=await draft.run(()=>apiRequest<{title:string;content:string;mode:string}>('/api/v1/admin/notices/ai-drafts',{method:'POST',body:JSON.stringify({memo:memo.trim()})}))
  if(result.ok){setTitle(result.value.title);setBody(result.value.content)}
 }
 async function attach(event:ChangeEvent<HTMLInputElement>){
  const selected=Array.from(event.target.files??[]);event.target.value='';setFileError('')
  if(selected.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)){setFileError('5MB 이하의 JPG·PNG·WebP 이미지를 선택해주세요.');return}
  for(const file of selected){
   const data=new FormData();data.append('file',file)
   const result=await upload.run(()=>apiRequest<{fileId:string}>('/api/v1/files',{method:'POST',body:data}))
   if(!result.ok)break
   setFiles(previous=>[...previous,{fileId:result.value.fileId,name:file.name}])
  }
 }
 async function submit(event:FormEvent){
  event.preventDefault();if(!title.trim()||!body.trim()||busy)return
  const imageIds=[...oldIds.filter((id):id is string=>!!id),...files.map(file=>file.fileId)]
  const input={title:title.trim(),content:body.trim(),isPinned:pinned,...(!existing||files.length?{imageIds}:{})}
  const result=await save.run(()=>apiRequest(existing?`/api/v1/admin/notices/${encodeURIComponent(existing.id)}`:'/api/v1/admin/notices',{method:existing?'PATCH':'POST',body:JSON.stringify(input)}))
  if(result.ok)navigate('/admin/notices',{replace:true})
 }
 return <Sheet title={existing?'공지 수정':'새 공지 작성'} onClose={()=>navigate('/admin/notices')} className="notice-sheet"><form onSubmit={event=>{void submit(event)}}><fieldset className="api-form-fields" disabled={busy}>
 <label className="memo-label" htmlFor="live-memo">AI로 초안 만들기 ✨</label><textarea id="live-memo" className="memo-input" maxLength={2000} value={memo} onChange={event=>setMemo(event.target.value)} placeholder="회의 메모나 정리 안 된 내용을 붙여넣으세요"/>
 <button type="button" className="secondary draft-button" disabled={!memo.trim()||busy} onClick={()=>{void generate()}}>{draft.pending?<><LoaderCircle className="draft-spinner" size={16}/>생성 중...</>:draft.error?'초안 생성 다시 하기':'초안 생성하기'}</button>
 <div className="editor-fields"><input aria-label="공지 제목" value={title} onChange={event=>setTitle(event.target.value)} placeholder="제목을 입력하세요" required/><textarea aria-label="공지 내용" value={body} onChange={event=>setBody(event.target.value)} placeholder="내용을 입력하세요" required/></div>
 <label className="admin-form-label" htmlFor="notice-files">이미지 첨부</label><input id="notice-files" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy||!canAppend} onChange={event=>{void attach(event)}}/>
 {!canAppend&&<p className="form-message">기존 첨부 이미지를 유지합니다.</p>}
 {files.map(file=><div className="api-file-chip" key={file.fileId}><span>{file.name}</span><button type="button" aria-label={`${file.name} 첨부 취소`} onClick={()=>setFiles(previous=>previous.filter(item=>item.fileId!==file.fileId))}>취소</button></div>)}
 <div className="notice-pin"><span>상단 고정</span><Toggle label="상단 고정" checked={pinned} onChange={setPinned}/></div>
 <button className="primary" disabled={!title.trim()||!body.trim()||busy}>{save.pending?'게시 중...':'게시하기'}</button>
 </fieldset>{(save.error||draft.error||upload.error||fileError)&&<p className="api-inline-empty" role="alert">{save.error||draft.error||upload.error||fileError}</p>}</form>
 {oldUrls.map((url,index)=><NoticeImage key={url} url={url} index={index}/>)}
 </Sheet>
}
