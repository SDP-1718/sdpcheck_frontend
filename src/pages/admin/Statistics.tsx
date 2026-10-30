import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { usePreview } from '../../app/previewStore'
import { assets } from '../../assets/design'
import Sheet from '../../components/common/Sheet'
import { downloadCsv } from '../../utils/csv'
import type { Member } from '../../types'

type SortOrder = 'asc' | 'desc' | 'name'
const sortLabels: Record<SortOrder, string> = { asc: '출석률 낮은순', desc: '출석률 높은순', name: '이름순' }
function rate(member: Member) {
  const total = member.attendance + member.late + member.absent
  return total > 0 ? Math.round(member.attendance / total * 100) : 0
}

export default function Statistics() {
  const { members } = usePreview()
  const [sort, setSort] = useState<SortOrder>('asc')
  const [sortOpen, setSortOpen] = useState(false)
  const ordered = [...members].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'ko-KR') : sort === 'desc' ? rate(b) - rate(a) : rate(a) - rate(b))
  function download() {
    downloadCsv('SDP_출석통계_샘플.csv', [['이름','기수','출석','지각','결석','출석률'], ...ordered.map(member => [member.name, member.generation, member.attendance, member.late, member.absent, `${rate(member)}%`])])
  }
  return <section className="statistics">
    <h2 className="section-label">전체 통계</h2>
    <div className="summary-stats">{[['79%', '평균 출석률'], ['12회', '누적 세션'], ['14/17', '활성 부원']].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <h2 className="section-label chart-label">세션별 출석 추이</h2>
    <div className="chart" role="img" aria-label="세션별 샘플 출석 추이: 8월 5일 88%, 8월 19일 76%, 9월 2일 94%, 9월 9일 82%, 9월 15일 71%, 9월 22일 65%">
      {[61.592,53.191,65.797,57.397,49.699,45.494].map((height, index) => <div className="chart-column" key={index}><span className="chart-bar" style={{height}} /><span>{['8/5','8/19','9/2','9/9','9/15','9/22'][index]}</span></div>)}
    </div>
    <div className="section-title members-heading"><h2>부원별 현황</h2><button type="button" className="statistics-sort-trigger" aria-haspopup="dialog" onClick={() => setSortOpen(true)}>{sortLabels[sort]}<ChevronDown size={10} aria-hidden="true" /></button></div>
    {ordered.slice(0, 4).map(member => <div className="member-stat-row" key={member.id}><div><h3>{member.name}<span>{member.generation}기</span></h3><p>출석 {member.attendance} · 지각 {member.late} · 결석 {member.absent}</p></div><strong>{rate(member)}%</strong></div>)}
    <div className="export-area"><button type="button" className="primary" onClick={download}><img src={assets.download} alt="" />엑셀로 내보내기</button></div>
    {sortOpen && <Sheet title="정렬 기준" className="statistics-sort-sheet" onClose={() => setSortOpen(false)}>
      {(['asc','desc','name'] as const).map(value => <button type="button" className={`statistics-sort-option ${sort === value ? 'is-selected' : ''}`} key={value}
        aria-pressed={sort === value} onClick={() => { setSort(value); setSortOpen(false) }}><span>{sortLabels[value]}</span>{sort === value && <Check size={20} aria-hidden="true" />}</button>)}
    </Sheet>}
  </section>
}
