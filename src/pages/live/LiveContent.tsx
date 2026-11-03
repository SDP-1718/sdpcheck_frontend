import NoticeImage from '../../components/common/NoticeImage'
import { Link, useParams } from 'react-router'
import { Header } from '../../components/layout/Layout'
import AsyncState from '../../components/common/AsyncState'
import { useApiPages, useApiQuery } from '../../hooks/useApiQuery'
import { assets } from '../../assets/design'
import { dateParts } from '../../api/dates'
import type { NoticeDetailResponse, NoticeSummary, ScheduleSummary } from '../../api/types'
import { errorMessage } from '../../api/errors'

export function LiveNotices(){
 const query=useApiPages<NoticeSummary>('/api/v1/notices')
 return <section><Header title="공지사항"/>{query.items.length?<div className="notice-list">{[...query.items].sort((a,b)=>Number(b.isPinned)-Number(a.isPinned)).map(item=><Link className="notice-row" to={`/notices/${item.id}`} key={item.id}><div><time>{dateParts(item.createdAt).date.replaceAll('-','.')}</time><h2>{item.isPinned&&'📌 '}{item.title}</h2></div><img src={assets.noticeChevron} alt=""/></Link>)}</div>:!query.loading&&!query.error&&<p className="empty-state">등록된 공지가 없어요</p>}
 {query.loading&&<AsyncState/>}{query.error&&<AsyncState error message={errorMessage(query.error)} onRetry={query.retry}/>}{!query.loading&&!query.error&&query.hasNext&&<button className="secondary api-more" onClick={query.loadMore}>더보기</button>}</section>
}
export function LiveNoticeDetail(){
 const {id}=useParams()
 const query=useApiQuery<NoticeDetailResponse>(`/api/v1/notices/${encodeURIComponent(id??'')}`)
 const notice=query.data
 return <article className="notice-detail"><Header title="공지사항" back="/notices"/>{query.error?<AsyncState error message={errorMessage(query.error)} onRetry={query.retry}/>:!notice?<AsyncState/>:<div className="notice-content"><h2>{notice.title}</h2><p className="notice-meta">{dateParts(notice.createdAt).date.replaceAll('-','.')} {notice.author.name}</p><p className="notice-body">{notice.content}</p>{notice.imageUrls?.map((url,index)=><NoticeImage key={url} url={url} index={index}/>)}</div>}</article>
}
export function LiveSchedule(){
 const query=useApiPages<ScheduleSummary>('/api/v1/schedules')
 const ordered=query.items.map(item=>({...item,...dateParts(item.startsAt)})).filter(item=>item.date).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
 const years=new Set(ordered.map(item=>item.date.slice(0,4)))
 const months=[...new Set(ordered.map(item=>item.date.slice(0,7)))]
 return <section className="user-schedule"><Header title="일정"/>{months.map(month=><section className="schedule-month" key={month}><h2>{years.size>1?`${month.slice(0,4)}년 `:''}{Number(month.slice(5))}월</h2><ul>{ordered.filter(item=>item.date.startsWith(month)).map(item=><li className="schedule-row" key={item.id}><time className="date-tile" dateTime={item.startsAt}><span>{Number(item.date.slice(5,7))}월</span><strong>{Number(item.date.slice(8))}</strong></time><div className="schedule-item-copy"><h3>{item.title}</h3><p>{item.time}{item.location&&` · ${item.location}`}</p></div></li>)}</ul></section>)}
 {!query.items.length&&!query.loading&&!query.error&&<p className="schedule-empty">등록된 일정이 없어요</p>}{query.loading&&<AsyncState/>}{query.error&&<AsyncState error message={errorMessage(query.error)} onRetry={query.retry}/>}{!query.loading&&!query.error&&query.hasNext&&<button className="secondary api-more" onClick={query.loadMore}>더보기</button>}</section>
}
