import { createContext, useContext } from 'react'
import { useLocalState } from '../hooks/useLocalState'
import { initialAdminSessions } from '../mocks/admin'
import { initialMembers, initialNotices, initialSchedules } from '../mocks/data'

export function usePreviewData() {
  const [notices, setNotices] = useLocalState('sdp-preview-notices-v1', initialNotices)
  const [schedules, setSchedules] = useLocalState('sdp-preview-schedules-v1', initialSchedules)
  const [members, setMembers] = useLocalState('sdp-preview-members-v1', initialMembers)
  const [sessions, setSessions] = useLocalState('sdp-preview-sessions-v1', initialAdminSessions)
  return { notices, setNotices, schedules, setSchedules, members, setMembers, sessions, setSessions }
}
export const PreviewContext = createContext<ReturnType<typeof usePreviewData> | null>(null)
export function usePreview() {
  const value = useContext(PreviewContext)
  if (!value) throw new Error('PreviewProvider is required')
  return value
}
