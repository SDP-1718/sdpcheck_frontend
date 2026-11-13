import { useEffect,useRef,useState } from 'react'
import type { ChangeEvent,FormEvent } from 'react'
import { useNavigate,useParams } from 'react-router'
import { LoaderCircle,Plus,X } from 'lucide-react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useAction } from '../../../hooks/useAction'
import { apiRequest } from '../../../api/client'
import type { AdminNoticeList } from '../../../api/adminTypes'
import type { NoticeDetailResponse } from '../../../api/types'
import Sheet from '../../../components/common/Sheet'
import Toggle from '../../../components/common/Toggle'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import ItemActionsSheet from '../../../components/common/ItemActionsSheet'
import NoticeImage from '../../../components/common/NoticeImage'
import AsyncState from '../../../components/common/AsyncState'
import AdminNoticeCard from './AdminNoticeCard'
export default function LiveAdminNotices(){
 const query=useApiQuery<AdminNoticeList>('/api/v1/admin/notices'),action=useAction(),navigate=useNavigate()
 const [selected,setSelected]=useState<string|null>(null),[deleting,setDeleting]=useState<string|null>(null)
 const items=query.data?[...(query.data.pinnedNotice?[query.data.pinnedNotice]:[]),...query.data.items.filter(item=>item.id!==query.data?.pinnedNotice?.id)]:[]
 return <>
 {query.error?<AsyncState error onRetry={query.retry}/>:!query.data?<AsyncState/>:items.length?<div className="admin-notice-list">{items.map(item=><AdminNoticeCard key={item.id} notice={item} onClick={()=>setSelected(item.id)}/>)}</div>:<p className="admin-empty">등록된 공지가 없어요</p>}
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
 const fileInput=useRef<HTMLInputElement>(null),imageRail=useRef<HTMLDivElement>(null),previewUrls=useRef(new Set<string>()),mounted=useRef(true)
 const [batchBusy,setBatchBusy]=useState(false)
 useEffect(()=>{mounted.current=true;const urls=previewUrls.current;return()=>{mounted.current=false;urls.forEach(url=>URL.revokeObjectURL(url));urls.clear()}},[])
 const [title,setTitle]=useState(existing?.title??''),[body,setBody]=useState(existing?.content??''),[pinned,setPinned]=useState(existing?.isPinned??false),[memo,setMemo]=useState(''),[files,setFiles]=useState<{fileId:string;name:string;previewUrl:string}[]>([]),[fileError,setFileError]=useState('')
 const oldUrls=existing?.imageUrls??[],oldIds=oldUrls.map(fileIdFromUrl),canAppend=oldIds.every(Boolean),busy=save.pending||draft.pending||upload.pending||batchBusy
 async function generate(){
  if(!memo.trim()||busy)return
  const result=await draft.run(()=>apiRequest<{title:string;content:string;mode:string}>('/api/v1/admin/notices/ai-drafts',{method:'POST',body:JSON.stringify({memo:memo.trim()})}))
  if(result.ok){setTitle(result.value.title);setBody(result.value.content)}
 }
 async function attach(event:ChangeEvent<HTMLInputElement>){
  const selected=Array.from(event.target.files??[]);event.target.value='';setFileError('')
  if(busy||!canAppend||!selected.length)return
  if(selected.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)){setFileError('5MB 이하의 JPG·PNG·WebP 이미지를 선택해주세요.');return}
  setBatchBusy(true)
  try{
   for(const file of selected){
    if(!mounted.current)break
    const data=new FormData();data.append('file',file)
    const result=await upload.run(()=>apiRequest<{fileId:string}>('/api/v1/files',{method:'POST',body:data}))
    if(!result.ok||!mounted.current)break
    const previewUrl=URL.createObjectURL(file);previewUrls.current.add(previewUrl)
    setFiles(previous=>[{fileId:result.value.fileId,name:file.name,previewUrl},...previous])
    imageRail.current?.scrollTo({left:0,behavior:'smooth'})
   }
  }finally{if(mounted.current)setBatchBusy(false)}
 }
 async function submit(event:FormEvent){
  event.preventDefault();if(!title.trim()||!body.trim()||busy)return
  const imageIds=[...files.map(file=>file.fileId),...oldIds.filter((id):id is string=>!!id)]
  const input={title:title.trim(),content:body.trim(),isPinned:pinned,...(!existing||files.length?{imageIds}:{})}
  const result=await save.run(()=>apiRequest(existing?`/api/v1/admin/notices/${encodeURIComponent(existing.id)}`:'/api/v1/admin/notices',{method:existing?'PATCH':'POST',body:JSON.stringify(input)}))
  if(result.ok)navigate('/admin/notices',{replace:true})
 }
 return <Sheet title={existing?'공지 수정':'새 공지 작성'} onClose={()=>navigate('/admin/notices')} className="notice-sheet"><form onSubmit={event=>{void submit(event)}}><fieldset className="api-form-fields" disabled={busy}>
 <label className="memo-label" htmlFor="live-memo">AI로 초안 만들기 ✨</label><textarea id="live-memo" className="memo-input" maxLength={2000} value={memo} onChange={event=>setMemo(event.target.value)} placeholder="회의 메모나 정리 안 된 내용을 붙여넣으세요"/>
 <button type="button" className="secondary draft-button" disabled={!memo.trim()||busy} onClick={()=>{void generate()}}>{draft.pending?<><LoaderCircle className="draft-spinner" size={16}/>생성 중...</>:draft.error?'초안 생성 다시 하기':'초안 생성하기'}</button>
 <div className="editor-fields"><label className="editor-label">제목<input aria-label="공지 제목" value={title} onChange={event=>setTitle(event.target.value)} placeholder="제목을 입력하세요" required/></label><label className="editor-label">내용<textarea aria-label="공지 내용" value={body} onChange={event=>setBody(event.target.value)} placeholder="내용을 입력하세요" required/></label></div>
 <span className="admin-form-label" id="notice-files-label">이미지 첨부</span>
 <input ref={fileInput} id="notice-files" className="notice-file-input" hidden type="file" aria-labelledby="notice-files-label" accept="image/jpeg,image/png,image/webp" multiple disabled={busy||!canAppend} onChange={event=>{void attach(event)}}/>
 <div className="notice-attachments" role="group" aria-labelledby="notice-files-label"><button type="button" className="notice-image-add" aria-label="사진 추가" disabled={busy||!canAppend} onClick={()=>fileInput.current?.click()}>{batchBusy?<LoaderCircle size={24} className="draft-spinner" aria-label="사진 업로드 중"/>:<Plus size={28} aria-hidden="true"/>}</button>
 <div ref={imageRail} className="notice-image-rail" tabIndex={files.length||oldUrls.length?0:undefined} aria-label="첨부 사진 미리보기, 최근 추가한 사진부터 표시">
 {files.map(file=><div className="notice-image-tile" key={file.fileId}><img src={file.previewUrl} alt={file.name}/><button type="button" className="notice-image-remove" aria-label={`${file.name} 첨부 취소`} disabled={busy} onClick={()=>{URL.revokeObjectURL(file.previewUrl);previewUrls.current.delete(file.previewUrl);setFiles(previous=>previous.filter(item=>item.fileId!==file.fileId))}}><X size={16} aria-hidden="true"/></button></div>)}
 {oldUrls.map((url,index)=><div className="notice-image-tile" key={url}><NoticeImage url={url} index={index} thumbnail/></div>)}
 </div></div>
 {!canAppend&&<p className="form-message">기존 첨부 이미지를 유지합니다.</p>}
 <div className="notice-pin"><span>상단 고정</span><Toggle label="상단 고정" checked={pinned} onChange={setPinned}/></div>
 <button className="primary" disabled={!title.trim()||!body.trim()||busy}>{save.pending?'게시 중...':'게시하기'}</button>
 </fieldset>{(save.error||draft.error||upload.error||fileError)&&<p className="api-inline-empty" role="alert">{save.error||draft.error||upload.error||fileError}</p>}</form>
 </Sheet>
}
