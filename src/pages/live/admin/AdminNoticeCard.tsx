import { useEffect, useRef, useState } from 'react'
import type { NoticeDetailResponse, NoticeSummary } from '../../../api/types'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { dateParts } from '../../../api/dates'
import NoticeImage from '../../../components/common/NoticeImage'

function CardContent({notice}:{notice:NoticeSummary}) {
 const query=useApiQuery<NoticeDetailResponse>(`/api/v1/notices/${encodeURIComponent(notice.id)}`)
 const image=query.data?.imageUrls?.[0]
 return <div className="admin-notice-content"><div className="admin-notice-copy"><h2>{notice.title}</h2><p className="admin-notice-preview">{query.data?.content??(query.error?'내용을 불러오지 못했어요.':'내용을 불러오는 중...')}</p></div>{image&&<span className="admin-notice-thumbnail"><NoticeImage url={image} index={0} thumbnail/></span>}</div>
}

export default function AdminNoticeCard({notice,onClick}:{notice:NoticeSummary;onClick:()=>void}) {
 const button=useRef<HTMLButtonElement>(null),[visible,setVisible]=useState(false)
 useEffect(()=>{
  if(!button.current)return
  if(!('IntersectionObserver' in window)){void Promise.resolve().then(()=>setVisible(true));return}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:'160px'})
  observer.observe(button.current)
  return()=>observer.disconnect()
 },[])
 return <button ref={button} type="button" className="admin-notice-card" aria-label={`공지 관리: ${notice.title}`} onClick={onClick}><div className="admin-notice-meta">{notice.isPinned&&<span>고정</span>}<time>{dateParts(notice.createdAt).date.replaceAll('-','.')}</time></div>{visible?<CardContent notice={notice}/>:<div className="admin-notice-content"><div className="admin-notice-copy"><h2>{notice.title}</h2><p className="admin-notice-preview">내용을 불러오는 중...</p></div></div>}</button>
}
