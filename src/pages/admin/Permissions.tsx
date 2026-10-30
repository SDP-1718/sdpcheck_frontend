import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { usePreview } from '../../app/previewStore'
import { Header } from '../../components/layout/Layout'
import Sheet from '../../components/common/Sheet'
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function Permissions() {
  const { members, setMembers } = usePreview()
  const [generation, setGeneration] = useState<number | null>(null)
  const [generationOpen, setGenerationOpen] = useState(false)
  const [target, setTarget] = useState<string | null>(null)
  const selected = members.find(member => member.id === target)
  const visibleMembers = members.filter(member => generation === null || member.generation === generation)
  return (
    <section className="permissions">
      <Header title="권한 관리" back="/mypage" />
      <div className="generation-filter">
        <span id="generation-label">기수</span>
        <button type="button" aria-labelledby="generation-label generation-value" aria-haspopup="dialog" aria-expanded={generationOpen}
          onClick={() => setGenerationOpen(true)}>
          <span id="generation-value">{generation === null ? '기수를 선택하세요' : `${generation}기`}</span><ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>
      <h2 className="section-label">학회원 목록</h2>
      {visibleMembers.length ? visibleMembers.map(member => <div className="permission-row" key={member.id}>
        <div><p>{member.generation}기 {member.admin ? '임원' : '학회원'}</p><h3>{member.name}</h3></div>
        <button type="button" className={`permission-button ${member.admin ? 'revoke' : ''}`}
          onClick={() => setTarget(member.id)} aria-label={`${member.name} 권한 ${member.admin ? '해제' : '부여'}`}>
          {member.admin ? '해제' : '부여'}
        </button>
      </div>) : <p className="permissions-empty" role="status">해당 기수의 학회원이 없어요</p>}
      {generationOpen && <Sheet title="기수 선택" className="permission-generation-sheet" showCloseButton={false} onClose={() => setGenerationOpen(false)}>
        <div role="group" aria-label="기수 선택">
          {[16, 17, 18, 19].map(value => <button type="button" key={value} className="generation-option"
            aria-pressed={generation === value} onClick={() => { setGeneration(value); setGenerationOpen(false) }}>
            <span>{value}기</span>{generation === value && <Check size={20} aria-hidden="true" />}
          </button>)}
        </div>
      </Sheet>}
      {selected && <ConfirmDialog title={`권한 ${selected.admin ? '해제' : '부여'}`} confirmLabel={selected.admin ? '해제' : '부여'}
        onCancel={() => setTarget(null)} onConfirm={() => {
          setMembers(previous => previous.map(member => member.id === selected.id ? { ...member, admin: !member.admin } : member))
          setTarget(null)
        }}>
        {selected.admin ? `${selected.name} 님의 관리자 권한을 해제하시겠습니까? 해제 후 학회원으로 변경됩니다.`
          : `${selected.name} 님을 관리자 권한으로 부여하시겠습니까?`}
      </ConfirmDialog>}
    </section>
  )
}
