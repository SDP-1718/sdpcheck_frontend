import { useEffect, useState } from 'react'

export function useSessionClock(endsAt: number | undefined, active: boolean, onExpire: () => void) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active || !endsAt) return
    const timer = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= endsAt) onExpire()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endsAt, active, onExpire])
  return Math.max(0, Math.ceil(((endsAt ?? 0) - now) / 1000))
}