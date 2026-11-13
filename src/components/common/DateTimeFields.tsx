import { useRef, useState } from 'react'
import type { Dispatch, PointerEvent, SetStateAction } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Sheet from './Sheet'
import { assets } from '../../assets/design'
import { dateValue, parseLocalDate, shortDate, validTime } from '../../utils/date'

function DatePicker({ value, onSelect, onClose }: { value: string; onSelect: (value: string) => void; onClose: () => void }) {
  const selected = parseLocalDate(value)
  const [month, setMonth] = useState(() => {
    const date = selected ?? new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })
  const firstWeekday = month.getDay()
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7
  return <Sheet title="날짜 선택" className="date-picker-sheet" onClose={onClose}>
    <div className="calendar-month">
      <button type="button" aria-label="이전 달" onClick={() => setMonth(previous => new Date(previous.getFullYear(), previous.getMonth() - 1, 1))}><ChevronLeft size={20} /></button>
      <h3 aria-live="polite">{month.getFullYear()}년 {month.getMonth() + 1}월</h3>
      <button type="button" aria-label="다음 달" onClick={() => setMonth(previous => new Date(previous.getFullYear(), previous.getMonth() + 1, 1))}><ChevronRight size={20} /></button>
    </div>
    <div className="calendar-weekdays" aria-hidden="true">{['일','월','화','수','목','금','토'].map(day => <span key={day}>{day}</span>)}</div>
    <div className="calendar-days" role="group" aria-label={`${month.getFullYear()}년 ${month.getMonth() + 1}월 날짜`}>
      {Array.from({ length: cellCount }, (_, index) => {
        const day = index - firstWeekday + 1
        if (day < 1 || day > dayCount) return <span key={index} />
        const date = new Date(month.getFullYear(), month.getMonth(), day)
        const next = dateValue(date)
        return <button type="button" key={index} className={next === value ? 'is-selected' : ''} aria-pressed={next === value}
          aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${day}일`} onClick={() => onSelect(next)}>{day}</button>
      })}
    </div>
  </Sheet>
}

function TimeWheelColumn({value,onChange,max,step,unit}:{value:number;onChange:Dispatch<SetStateAction<number>>;max:number;step:number;unit:'시'|'분'}) {
 const drag=useRef<{id:number;y:number;value:number;moved:boolean}|null>(null),suppressClick=useRef(false)
 const wrap=(next:number)=>(next%max+max)%max
 function move(event:PointerEvent<HTMLDivElement>){
  const start=drag.current
  if(!start||start.id!==event.pointerId)return
  const delta=start.y-event.clientY
  if(Math.abs(delta)>8){start.moved=true;event.currentTarget.setPointerCapture(event.pointerId)}
  if(start.moved)onChange(wrap(start.value+Math.round(delta/52)*step))
 }
 function end(event:PointerEvent<HTMLDivElement>){
  if(drag.current?.id!==event.pointerId)return
  suppressClick.current=drag.current.moved;drag.current=null
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)
 }
 return <div className="time-wheel-column" role="group" aria-label={unit==='시'?'시 선택':'분 선택'} tabIndex={0}
  onPointerDown={event=>{if(event.pointerType==='mouse'&&event.button!==0)return;suppressClick.current=false;drag.current={id:event.pointerId,y:event.clientY,value,moved:false}}}
  onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{drag.current=null;suppressClick.current=false}} onLostPointerCapture={event=>{if(event.target===event.currentTarget)drag.current=null}}
  onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false}}}
  onKeyDown={event=>{suppressClick.current=false;if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();onChange(previous=>wrap(previous+(event.key==='ArrowUp'?-step:step)))}}}
  onWheel={event=>{if(event.deltaY)onChange(previous=>wrap(previous+(event.deltaY>0?step:-step)))}}>
  {[-2,-1,0,1,2].map(offset=>{const next=wrap(value+offset*step);return <button type="button" key={offset} className={offset===0?'is-selected':''} aria-pressed={offset===0} aria-label={`${next}${unit}`} onClick={()=>onChange(next)}>{String(next).padStart(2,'0')}</button>})}
 </div>
}

function TimePicker({ value, onSelect, onClose }: { value: string; onSelect: (value: string) => void; onClose: () => void }) {
  const initial = validTime(value) ? value.split(':').map(Number) : [19, 0]
  const [hour, setHour] = useState(initial[0])
  const [minute, setMinute] = useState(initial[1])
  return <Sheet title="시간 선택" className="time-picker-sheet" onClose={onClose}>
    <div className="time-wheel"><div className="time-wheel-highlight" aria-hidden="true" /><TimeWheelColumn value={hour} onChange={setHour} max={24} step={1} unit="시"/><span className="time-wheel-colon" aria-hidden="true">:</span><TimeWheelColumn value={minute} onChange={setMinute} max={60} step={5} unit="분"/></div>
    <button type="button" className="primary" onClick={() => onSelect(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}>확인</button>
  </Sheet>
}

export default function DateTimeFields({ date, time, onDateChange, onTimeChange, labels = false }: {
  date: string; time: string; onDateChange: (value: string) => void; onTimeChange: (value: string) => void; labels?: boolean
}) {
  const [picker, setPicker] = useState<'date' | 'time' | null>(null)
  return <>
    <div className="date-time-fields">
      <div>{labels && <span className="date-time-label">날짜</span>}<button type="button" className="date-time-trigger" aria-label="날짜 선택" aria-haspopup="dialog" onClick={() => setPicker('date')}>
        <span>{shortDate(date) || '날짜 선택'}</span><img src={assets.calendarIcon} alt="" /></button></div>
      <div>{labels && <span className="date-time-label">시간</span>}<button type="button" className="date-time-trigger" aria-label="시간 선택" aria-haspopup="dialog" onClick={() => setPicker('time')}>
        <span>{validTime(time) ? time : '시간 선택'}</span><img src={assets.clockIcon} alt="" /></button></div>
    </div>
    {picker === 'date' && <DatePicker value={date} onClose={() => setPicker(null)} onSelect={value => { onDateChange(value); setPicker(null) }} />}
    {picker === 'time' && <TimePicker value={time} onClose={() => setPicker(null)} onSelect={value => { onTimeChange(value); setPicker(null) }} />}
  </>
}
