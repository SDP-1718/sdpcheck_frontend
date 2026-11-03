import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router'
import { usePreview } from '../../app/previewStore'
import Sheet from '../../components/common/Sheet'
import { useMockApi } from '../../api/config'
import { useAuth } from '../../auth/AuthState'
import { previewRegisterMember } from '../../mocks/registration'
import { RegistrationError } from '../../types/registration'
import type { RegisterMember } from '../../types/registration'

export function MemberInformation({ registerMember }: { registerMember?: RegisterMember }) {
  const navigate = useNavigate()
  const { setRegisteredMember } = usePreview()
  const [name, setName] = useState('')
  const [generation, setGeneration] = useState<number | null>(null)
  const [invitationCode, setInvitationCode] = useState('')
  const [generationOpen, setGenerationOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<'invitation' | 'unavailable' | null>(null)
  const mounted = useRef(true)
  const inFlight = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const ready = name.trim().length > 0 && name.trim().length <= 50 && generation !== null && invitationCode.trim().length > 0
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!ready || generation === null || inFlight.current) return
    inFlight.current = true; setSubmitting(true); setError(null)
    try {
      const register = registerMember ?? (useMockApi ? previewRegisterMember : undefined)
      if (!register) throw new RegistrationError('unavailable')
      const member = await register({ name: name.trim(), generation, invitationCode: invitationCode.trim() })
      if (!mounted.current) return
      setRegisteredMember(member)
      navigate('/onboarding/complete', { replace: true })
    } catch (failure) {
      if (mounted.current) setError(failure instanceof RegistrationError ? failure.reason : 'unavailable')
    } finally {
      inFlight.current = false
      if (mounted.current) setSubmitting(false)
    }
  }
  return <section className="member-information" aria-label="회원정보 입력">
    <h1>환영해요</h1>
    <form onSubmit={event => { void submit(event) }} aria-busy={submitting}>
      <div className="member-fields">
        <label htmlFor="member-name">이름</label>
        <input id="member-name" autoComplete="name" maxLength={50} value={name} disabled={submitting} onChange={event => setName(event.target.value)} placeholder="이름을 입력하세요" required />
        <span id="member-generation-label">기수</span>
        <button type="button" className="member-generation-trigger" aria-labelledby="member-generation-label member-generation-value" aria-haspopup="dialog" aria-expanded={generationOpen} disabled={submitting} onClick={() => setGenerationOpen(true)}>
          <span id="member-generation-value">{generation === null ? '기수를 선택하세요' : `${generation}기`}</span><ChevronDown size={16} aria-hidden="true" />
        </button>
        <label htmlFor="member-invitation">초대코드</label>
        <input id="member-invitation" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={100} value={invitationCode} disabled={submitting}
          aria-invalid={error === 'invitation'} aria-describedby={error === 'invitation' ? 'invitation-error' : undefined}
          onChange={event => { setInvitationCode(event.target.value); setError(null) }} placeholder="운영진 초대코드를 입력하세요" required />
        {error === 'invitation' && <p id="invitation-error" className="member-error" role="alert">초대코드를 다시 확인해주세요</p>}
        {error === 'unavailable' && <p className="member-error" role="alert">지금은 가입을 진행할 수 없어요. 잠시 후 다시 시도해주세요.</p>}
      </div>
      <button className="primary member-start" disabled={!ready || submitting}>{submitting ? '확인 중...' : '시작하기'}</button>
    </form>
    {generationOpen && <Sheet title="기수 선택" className="member-generation-sheet" showCloseButton={false} onClose={() => setGenerationOpen(false)}>
      <div role="group" aria-label="기수 선택">{[16,17,18,19].map(value => <button type="button" className="generation-option" key={value} aria-pressed={generation === value}
        onClick={() => { setGeneration(value); setGenerationOpen(false) }}><span>{value}기</span>{generation === value && <Check size={20} aria-hidden="true" />}</button>)}</div>
    </Sheet>}
  </section>
}

export function RegistrationComplete() {
  const { registeredMember } = usePreview()
  const { session } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!registeredMember) return
    const timer = window.setTimeout(() => navigate('/home', { replace: true }), 1500)
    return () => window.clearTimeout(timer)
  }, [registeredMember, navigate])
  if (!useMockApi && session.status !== 'authenticated') return <Navigate to="/onboarding" replace />
  if (!registeredMember) return <Navigate to="/onboarding/profile" replace />
  return <section className="registration-complete" aria-label="가입 완료"><p role="status">환영합니다!</p></section>
}
