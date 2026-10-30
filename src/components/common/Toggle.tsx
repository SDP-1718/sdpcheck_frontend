export default function Toggle({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked}
    className={`preference-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
    <span aria-hidden="true" />
  </button>
}
