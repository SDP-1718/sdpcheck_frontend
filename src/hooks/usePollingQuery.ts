import { useCallback,useEffect,useState } from 'react'
import { apiRequest } from '../api/client'
export function usePollingQuery<T>(path:string|null,interval=5000){
 const [revision,setRevision]=useState(0),[state,setState]=useState<{path:string;data?:T;error?:unknown}>({path:''})
 useEffect(()=>{
  if(!path)return
  const controller=new AbortController()
  let timer:number|undefined
  async function load(){
   try{
    const data=await apiRequest<T>(path!,{signal:controller.signal})
    if(!controller.signal.aborted)setState({path:path!,data})
   }catch(error){if(!controller.signal.aborted)setState(previous=>({path:path!,data:previous.path===path?previous.data:undefined,error}))}
   if(!controller.signal.aborted)timer=window.setTimeout(()=>{void load()},interval)
  }
  void load()
  return()=>{controller.abort();if(timer)window.clearTimeout(timer)}
 },[path,interval,revision])
 const current=state.path===path?state:undefined
 const retry=useCallback(()=>setRevision(value=>value+1),[])
 return {data:current?.data,error:current?.error,retry,loading:!!path&&!current}
}
