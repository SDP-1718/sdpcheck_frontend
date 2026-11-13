import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { apiBaseUrl, apiServerUrl } from '../../api/config'

function parseImage(url: string) {
 try {
  const parsed = new URL(url, apiBaseUrl)
  if (!['https:', 'http:'].includes(parsed.protocol)) return null
  const protectedImage = [new URL(apiBaseUrl).origin, new URL(apiServerUrl).origin, 'https://sdpcheck.duckdns.org'].includes(parsed.origin)
   && parsed.pathname.startsWith('/api/v1/files/')
  return { parsed, protectedImage }
 } catch { return null }
}

export default function NoticeImage({url,index,thumbnail=false}:{url:string;index:number;thumbnail?:boolean}){
 const [source,setSource]=useState<{url:string;objectUrl:string}|null>(null)
 const [failedUrl,setFailedUrl]=useState<string|null>(null)
 useEffect(()=>{
  const controller=new AbortController()
  let objectUrl:string|undefined
  const image=parseImage(url)
  if(!image?.protectedImage)return
  void apiRequest<Blob>(image.parsed.pathname+image.parsed.search,{signal:controller.signal},true,true).then(blob=>{
   if(controller.signal.aborted)return
   objectUrl=URL.createObjectURL(blob);setSource({url,objectUrl})
  }).catch(()=>{if(!controller.signal.aborted)setFailedUrl(url)})
  return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)}
 },[url])
 const placeholder=(message:string)=>thumbnail?<span className="notice-thumbnail-placeholder" role="img" aria-label={message}/>:<p className="api-inline-empty">{message}</p>
 const image=parseImage(url)
 if(!image)return placeholder('첨부 이미지 주소를 확인할 수 없어요.')
 if(failedUrl===url)return placeholder('첨부 이미지를 불러오지 못했어요.')
 if(image.protectedImage&&source?.url!==url)return thumbnail?placeholder('이미지를 불러오는 중...'):<p className="api-inline-empty" role="status">이미지를 불러오는 중...</p>
 return <img className={thumbnail?'notice-thumbnail-image':'notice-attachment'} onError={()=>setFailedUrl(url)} src={image.protectedImage?source!.objectUrl:image.parsed.href} alt={`공지 첨부 이미지 ${index+1}`}/>
}
