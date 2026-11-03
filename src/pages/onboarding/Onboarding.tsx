import { useAuth } from '../../auth/AuthState'
import { useSearchParams } from 'react-router'
import { kakaoLoginUrl } from '../../api/auth'
import { useMockApi } from '../../api/config'
import { assets } from '../../assets/design'

export default function Onboarding() {
  const [params] = useSearchParams()
  const { logoutFailed } = useAuth()
  return <section className="onboarding" data-node-id="1:5346">
    <img className="onboarding-glow" src={assets.glow} alt="" />
    <div className="brand"><div className="brand-mark"><img src={assets.logo} alt="" /><strong>SDP</strong></div><p>세상을 바라보는 새로운 시선</p></div>
    {(logoutFailed || params.get('logout') === 'failed') && <p className="api-inline-empty" role="alert">기기에서 로그아웃했지만 서버 연결에 실패했어요. 다시 로그인하기 전에 연결 상태를 확인해주세요.</p>}
    <a className="kakao-button" href={useMockApi ? '/onboarding/profile' : kakaoLoginUrl}><img src={assets.kakao} alt="" />카카오로 시작하기</a>
  </section>
}
