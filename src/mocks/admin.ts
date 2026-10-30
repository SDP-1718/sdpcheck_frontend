import type { AdminSession } from '../types/admin'

export const initialAdminSessions: AdminSession[] = []
export const previewCheckIns = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1), name: '박예승', time: '19:02',
}))
