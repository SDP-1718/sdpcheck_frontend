export interface AdminSession {
  id: string
  title: string
  date: string
  time: string
  location: string
  repeatDays: number[]
  phase: 'ready' | 'active' | 'ended'
  endsAt?: number
}

export interface NoticeDraft { title: string; body: string }
export type GenerateNoticeDraft = (memo: string) => Promise<NoticeDraft>
