import { Link } from 'react-router'
import { assets } from '../../assets/design'

export default function Onboarding() {
  return <section className="onboarding" data-node-id="1:5346">
    <img className="onboarding-glow" src={assets.glow} alt="" />
    <div className="brand"><div className="brand-mark"><img src={assets.logo} alt="" /><strong>SDP</strong></div><p>세상을 바라보는 새로운 시선</p></div>
    <Link className="kakao-button" to="/onboarding/preview"><img src={assets.kakao} alt="" />카카오로 시작하기</Link>
  </section>
}
