import { useCallback,useEffect,useRef,useState } from 'react'
import { actionMessage } from '../api/admin'
export function useAction(){
 const busy=useRef(false),mounted=useRef(true)
 const [pending,setPending]=useState(false),[error,setError]=useState('')
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
 const run=useCallback(async<T,>(action:()=>Promise<T>):Promise<{ok:true;value:T}|{ok:false}>=>{
  if(busy.current)return {ok:false}
  busy.current=true;setPending(true);setError('')
  try{const value=await action();return mounted.current?{ok:true,value}:{ok:false}}
  catch(failure){if(mounted.current)setError(actionMessage(failure));return {ok:false}}
  finally{busy.current=false;if(mounted.current)setPending(false)}
 },[])
 return {pending,error,run}
}
