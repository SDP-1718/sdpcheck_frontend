import { Link, useParams } from 'react-router'
import { usePreview } from '../../app/previewStore'
import { Header } from '../../components/layout/Layout'
import { assets } from '../../assets/design'

export function Notices() {
  const { notices } = usePreview()
  return <section data-node-id="46:500"><Header title="공지사항" /><div className="notice-list">{[...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned)).map(item => <Link className="notice-row" key={item.id} to={`/notices/${item.id}`}><div><time>{item.date}</time><h2>{item.pinned && '📌 '}{item.title}</h2></div><img src={assets.noticeChevron} alt="" /></Link>)}</div></section>
}
export function NoticeDetail() {
  const { id } = useParams()
  const { notices } = usePreview()
  const notice = notices.find(item => item.id === id)
  if (!notice) return <section><Header title="공지사항" back="/notices" /><p className="empty-state">공지사항을 찾을 수 없습니다.</p></section>
  return <article className="notice-detail" data-node-id="46:1131"><Header title="공지사항" back="/notices" /><div className="notice-content"><h2>{notice.title}</h2><p className="notice-meta">{notice.id === '1' ? '2026.09.15' : notice.date} {notice.author}</p><p className="notice-body">{notice.body}</p>{notice.id === '1' && <div className="notice-image"><img src={assets.imagePlaceholder} alt="" /><span>이미지</span></div>}</div></article>
}
