import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import type { PageResponse } from '../api/types'
export function useApiQuery<T>(path:string) {
 const [revision,setRevision]=useState(0)
 const [state,setState]=useState<{path:string;data?:T;error?:unknown}>({path:''})
 useEffect(()=>{
  const controller=new AbortController()
  void apiRequest<T>(path,{signal:controller.signal}).then(data=>{if(!controller.signal.aborted)setState({path,data})}).catch(error=>{
   if(!controller.signal.aborted)setState({path,error})
  })
  return()=>controller.abort()
 },[path,revision])
 const current=state.path===path?state:undefined
 return {data:current?.data,error:current?.error,loading:!current,retry:()=>{setState({path:''});setRevision(v=>v+1)}}
}
export function useApiPages<T>(basePath:string) {
 const [page,setPage]=useState(0),[items,setItems]=useState<T[]>([]),[revision,setRevision]=useState(0)
 const [state,setState]=useState<{page:number;hasNext:boolean;error?:unknown}>({page:-1,hasNext:false})
 useEffect(()=>{
  const controller=new AbortController()
  void apiRequest<PageResponse<T>>(`${basePath}?page=${page}&size=20`,{signal:controller.signal}).then(result=>{
   if(controller.signal.aborted)return
   setItems(previous=>page===0?result.items:[...previous,...result.items])
   setState({page,hasNext:result.hasNext})
  }).catch(error=>{if(!controller.signal.aborted)setState({page,hasNext:false,error})})
  return()=>controller.abort()
 },[basePath,page,revision])
 return {items,loading:state.page!==page,error:state.error,hasNext:state.hasNext,loadMore:()=>setPage(v=>v+1),retry:()=>{setState(previous=>({...previous,page:-1,error:undefined}));setRevision(v=>v+1)}}
}
