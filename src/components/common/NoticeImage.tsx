import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { apiBaseUrl } from '../../api/config'
export default function NoticeImage({url,index}:{url:string;index:number}){
 const [source,setSource]=useState<{url:string;objectUrl:string}|null>(null)
 const [failed,setFailed]=useState(false)
 useEffect(()=>{
  const controller=new AbortController()
  let objectUrl:string|undefined
  let parsed:URL
  try{parsed=new URL(url,apiBaseUrl)}catch{return}
  const apiOrigin=new URL(apiBaseUrl).origin
  if(parsed.origin!==apiOrigin||!parsed.pathname.startsWith('/api/v1/files/'))return
  void apiRequest<Blob>(parsed.pathname,{signal:controller.signal},true,true).then(blob=>{
   if(controller.signal.aborted)return
   objectUrl=URL.createObjectURL(blob);setSource({url,objectUrl})
  }).catch(()=>{if(!controller.signal.aborted)setFailed(true)})
  return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)}
 },[url])
 let parsed:URL
 try{parsed=new URL(url,apiBaseUrl)}catch{return <p className="api-inline-empty">첨부 이미지 주소를 확인할 수 없어요.</p>}
 if(!['https:','http:'].includes(parsed.protocol))return null
 const protectedImage=parsed.origin===new URL(apiBaseUrl).origin&&parsed.pathname.startsWith('/api/v1/files/')
 if(failed)return <p className="api-inline-empty">첨부 이미지를 불러오지 못했어요.</p>
 if(protectedImage&&source?.url!==url)return <p className="api-inline-empty" role="status">이미지를 불러오는 중...</p>
 return <img className="notice-attachment" src={protectedImage?source!.objectUrl:parsed.href} alt={`공지 첨부 이미지 ${index+1}`}/>
}
