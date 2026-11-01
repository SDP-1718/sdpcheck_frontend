import { usePreview } from '../../app/previewStore'
import { Header } from '../../components/layout/Layout'
import { parseLocalDate } from '../../utils/date'
import type { Schedule } from '../../types'

export default function SchedulePage() {
  const { schedules } = usePreview()
  const ordered = schedules.filter(item => parseLocalDate(item.date)).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const groups = new Map<string, Schedule[]>()
  for (const item of ordered) {
    const month = item.date.slice(0, 7)
    const group = groups.get(month) ?? []
    group.push(item)
    groups.set(month, group)
  }
  const multipleYears = new Set(ordered.map(item => item.date.slice(0, 4))).size > 1
  return <section className="user-schedule" aria-label="일정 목록" data-node-id="50:472">
    <Header title="일정" />
    {groups.size ? [...groups].map(([month, items]) => <section className="schedule-month" key={month} aria-labelledby={`month-${month}`}>
      <h2 id={`month-${month}`}>{multipleYears ? `${month.slice(0, 4)}년 ` : ''}{Number(month.slice(5))}월</h2>
      <ul>{items.map(item => <li className="schedule-row" key={item.id}>
        <time className="date-tile" dateTime={`${item.date}T${item.time}`} aria-label={`${item.date} ${item.time}`}><span>{Number(item.date.slice(5, 7))}월</span><strong>{Number(item.date.slice(8))}</strong></time>
        <div className="schedule-item-copy"><h3>{item.title}</h3><p>{item.time}{item.location && ` · ${item.location}`}</p></div>
      </li>)}</ul>
    </section>) : <p className="schedule-empty" role="status">등록된 일정이 없어요</p>}
  </section>
}
