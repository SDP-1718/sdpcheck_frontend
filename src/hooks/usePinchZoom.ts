import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

export function usePinchZoom() {
 const [zoom,setZoom]=useState(1)
 const current=useRef(1),points=useRef(new Map<number,{x:number;y:number}>()),gesture=useRef<{distance:number;zoom:number}|null>(null)
 function change(value:number){const next=Math.round(Math.min(4,Math.max(1,value))*100)/100;current.current=next;setZoom(next)}
 function distance(){const [a,b]=[...points.current.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0}
 function reset(){points.current.clear();gesture.current=null;change(1)}
 function onPointerDown(event:PointerEvent<HTMLDivElement>){
  if(event.pointerType!=='touch')return
  points.current.set(event.pointerId,{x:event.clientX,y:event.clientY})
  event.currentTarget.setPointerCapture(event.pointerId)
  if(points.current.size===2)gesture.current={distance:distance(),zoom:current.current}
 }
 function onPointerMove(event:PointerEvent<HTMLDivElement>){
  if(!points.current.has(event.pointerId))return
  points.current.set(event.pointerId,{x:event.clientX,y:event.clientY})
  const start=gesture.current
  if(points.current.size>=2&&start&&start.distance>0)change(start.zoom*distance()/start.distance)
 }
 function onPointerEnd(event:PointerEvent<HTMLDivElement>){
  points.current.delete(event.pointerId);gesture.current=null
  if(points.current.size>=2)gesture.current={distance:distance(),zoom:current.current}
 }
 function onKeyDown(event:KeyboardEvent<HTMLDivElement>){
  if(['+','=','ArrowUp','-','ArrowDown','Home'].includes(event.key)){
   event.preventDefault();change(event.key==='Home'?1:current.current+(['-','ArrowDown'].includes(event.key)?-.25:.25))
  }
 }
 return {zoom,reset,handlers:{onPointerDown,onPointerMove,onPointerUp:onPointerEnd,onPointerCancel:onPointerEnd,onLostPointerCapture:onPointerEnd,onKeyDown}}
}
