import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import type { MemberStatistics, MemberStatisticsPage, StatisticsSort } from '../api/adminTypes'

export function useMemberStatistics(sort: StatisticsSort) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{sort: StatisticsSort; members?: MemberStatistics[]; error?: unknown} | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      const members = new Map<number, MemberStatistics>()
      let page = 0
      while (!controller.signal.aborted) {
        const result = await apiRequest<MemberStatisticsPage>(
          '/api/v1/admin/statistics/members?sort=' + sort + '&page=' + page + '&size=20',
          {signal: controller.signal},
        )
        if (controller.signal.aborted) return
        for (const member of result.members) members.set(member.memberId, member)
        if (!result.hasNext) {
          setState({sort, members: [...members.values()]})
          return
        }
        if (!result.members.length) throw Error('회원 목록을 불러오지 못했어요.')
        page++
      }
    }
    void load().catch(error => {if (!controller.signal.aborted) setState({sort, error})})
    return () => controller.abort()
  }, [sort, revision])
  const retry = useCallback(() => {setState(null); setRevision(value => value + 1)}, [])
  const current = state?.sort === sort ? state : null
  return {data: current?.members, error: current?.error, retry}
}
