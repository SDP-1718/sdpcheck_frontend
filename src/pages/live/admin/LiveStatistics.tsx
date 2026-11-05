import { useState } from 'react'
import { Check,ChevronDown } from 'lucide-react'
import { useApiQuery } from '../../../hooks/useApiQuery'
import { useAction } from '../../../hooks/useAction'
import { apiRequest } from '../../../api/client'
import { downloadBlob } from '../../../api/download'
import { formatAttendanceRate } from '../../../utils/attendance'
import type { StatisticsSummary,MemberStatisticsPage,StatisticsSort } from '../../../api/adminTypes'
import { assets } from '../../../assets/design'
import Sheet from '../../../components/common/Sheet'
import AsyncState from '../../../components/common/AsyncState'
const sorts:Record<StatisticsSort,string>={ATTENDANCE_RATE_ASC:'출석률 낮은순',ATTENDANCE_RATE_DESC:'출석률 높은순',NAME_ASC:'이름순'}
export default function LiveStatistics(){
 const [sort,setSort]=useState<StatisticsSort>('ATTENDANCE_RATE_ASC'),[sortOpen,setSortOpen]=useState(false),[page,setPage]=useState(0)
 const summary=useApiQuery<StatisticsSummary>('/api/v1/admin/statistics')
 const members=useApiQuery<MemberStatisticsPage>(`/api/v1/admin/statistics/members?sort=${sort}&page=${page}&size=20`),action=useAction()
 async function download(){
  const result=await action.run(()=>apiRequest<Blob>(`/api/v1/admin/statistics/export?sort=${sort}`,{},true,true))
  if(result.ok)downloadBlob(result.value,'SDP_출석통계.xlsx')
 }
 return <section className="statistics"><h2 className="section-label">전체 통계</h2>
 {summary.error?<AsyncState error onRetry={summary.retry}/>:!summary.data?<AsyncState/>:<div className="summary-stats">{[[formatAttendanceRate(summary.data.averageAttendanceRate),'평균 출석률'],[`${summary.data.totalSessionCount}회`,'누적 세션'],[`${summary.data.activeMemberCount}/${summary.data.totalMemberCount}`,'활성 부원']].map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}
 <h2 className="section-label chart-label">세션별 출석 추이</h2><p className="api-inline-empty">출석 추이는 준비 중입니다.</p>
 <div className="section-title members-heading"><h2>부원별 현황</h2><button className="statistics-sort-trigger" onClick={()=>setSortOpen(true)} aria-haspopup="dialog">{sorts[sort]}<ChevronDown size={10}/></button></div>
 {members.error?<AsyncState error onRetry={members.retry}/>:!members.data?<AsyncState/>:members.data.members.length?members.data.members.map(member=><div className="member-stat-row" key={member.memberId}><div><h3>{member.name}<span>{member.generation}기</span></h3><p>출석 {member.presentCount} · 지각 {member.lateCount} · 결석 {member.absentCount}</p></div><strong>{formatAttendanceRate(member.attendanceRate)}</strong></div>):<p className="api-inline-empty">표시할 부원이 없어요.</p>}
 <div className="api-pagination">{page>0&&<button className="secondary" onClick={()=>setPage(v=>v-1)}>이전</button>}{members.data?.hasNext&&<button className="secondary" onClick={()=>setPage(v=>v+1)}>다음</button>}</div>
 {action.error&&<p className="api-inline-empty" role="alert">{action.error}</p>}<div className="export-area"><button className="primary" disabled={action.pending} onClick={()=>{void download()}}><img src={assets.download} alt=""/>{action.pending?'내보내는 중...':'엑셀로 내보내기'}</button></div>
 {sortOpen&&<Sheet title="정렬 기준" className="statistics-sort-sheet" onClose={()=>setSortOpen(false)}>{(Object.keys(sorts) as StatisticsSort[]).map(value=><button className={`statistics-sort-option ${sort===value?'is-selected':''}`} key={value} aria-pressed={sort===value} onClick={()=>{setSort(value);setPage(0);setSortOpen(false)}}><span>{sorts[value]}</span>{sort===value&&<Check size={20}/>}</button>)}</Sheet>}
 </section>
}
