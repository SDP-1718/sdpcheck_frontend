import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { RotateCw } from 'lucide-react'

const threshold=64

function blockedTarget(target:EventTarget|null,root:HTMLElement){
 if(!(target instanceof Element)||document.querySelector('dialog[open]'))return true
 if(target.closest('input,textarea,select,video,[contenteditable="true"],[role="slider"],.time-wheel-column,.attendance-viewfinder'))return true
 let element:Element|null=target
 while(element&&element!==root){
  const style=getComputedStyle(element)
  if(/auto|scroll/.test(style.overflowY)&&element.scrollHeight>element.clientHeight+1)return true
  element=element.parentElement
 }
 return false
}

export default function PullToRefresh({enabled,children}:{enabled:boolean;children:ReactNode}){
 const root=useRef<HTMLDivElement>(null)
 const [distance,setDistance]=useState(0),[refreshing,setRefreshing]=useState(false)
 useEffect(()=>{
  const element=root.current
  if(!enabled||!element)return
  let gesture:{x:number;y:number;distance:number}|null=null,loading=false,timer:number|undefined
  document.documentElement.classList.add('pull-refresh-enabled')
  const reset=()=>{gesture=null;if(!loading)setDistance(0)}
  function start(event:TouchEvent){
   if(loading||event.touches.length!==1||window.scrollY>0||blockedTarget(event.target,element!)){reset();return}
   const touch=event.touches[0];gesture={x:touch.clientX,y:touch.clientY,distance:0}
  }
  function move(event:TouchEvent){
   if(!gesture)return
   if(event.touches.length!==1||window.scrollY>0||document.querySelector('dialog[open]')){reset();return}
   const touch=event.touches[0],vertical=touch.clientY-gesture.y,horizontal=Math.abs(touch.clientX-gesture.x)
   if(vertical<0||horizontal>Math.max(12,vertical)){reset();return}
   if(vertical<=0)return
   if(!event.cancelable){reset();return}
   event.preventDefault()
   gesture.distance=Math.min(96,vertical*.55)
   setDistance(gesture.distance)
  }
  function end(){
   if(gesture&&gesture.distance>=threshold&&!loading&&!document.querySelector('dialog[open]')){
    loading=true;gesture=null;setRefreshing(true);setDistance(threshold)
    timer=window.setTimeout(()=>window.location.reload(),120)
   }else reset()
  }
  element.addEventListener('touchstart',start,{passive:true})
  element.addEventListener('touchmove',move,{passive:false})
  element.addEventListener('touchend',end,{passive:true})
  element.addEventListener('touchcancel',reset,{passive:true})
  return()=>{
   element.removeEventListener('touchstart',start);element.removeEventListener('touchmove',move);element.removeEventListener('touchend',end);element.removeEventListener('touchcancel',reset)
   if(timer!==undefined)window.clearTimeout(timer)
   document.documentElement.classList.remove('pull-refresh-enabled')
  }
 },[enabled])
 return <div ref={root} className="pull-refresh-content">{enabled&&distance>8&&<div className={`pull-refresh-indicator ${refreshing?'is-refreshing':''}`} role="status"><RotateCw size={18} aria-hidden="true" style={refreshing?undefined:{transform:`rotate(${distance*3}deg)`}}/><span>{refreshing?'새로고침 중...':distance>=threshold?'놓으면 새로고침':'아래로 당겨 새로고침'}</span></div>}{children}</div>
}
