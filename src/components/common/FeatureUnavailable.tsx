import { Link } from 'react-router'
import { Header } from '../layout/Layout'
export default function FeatureUnavailable({title}:{title:string}){
 return <section><Header title={title}/><div className="api-state"><h2>이 기능은 준비 중이에요</h2><p>준비가 완료되면 이용할 수 있어요.</p><Link className="secondary" to="/home">홈으로</Link></div></section>
}
