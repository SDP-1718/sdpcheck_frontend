import { createContext, useContext } from 'react'
import { useLocalState } from '../hooks/useLocalState'
import { initialNotices, initialSchedules } from '../mocks/data'

export function usePreviewData() {
  const [notices, setNotices] = useLocalState('sdp-preview-notices-v1', initialNotices)
  const [schedules, setSchedules] = useLocalState('sdp-preview-schedules-v1', initialSchedules)
  return { notices, setNotices, schedules, setSchedules }
}
export const PreviewContext = createContext<ReturnType<typeof usePreviewData> | null>(null)
export function usePreview() {
  const value = useContext(PreviewContext)
  if (!value) throw new Error('PreviewProvider is required')
  return value
}
