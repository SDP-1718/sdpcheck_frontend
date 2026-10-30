import { useState } from 'react'

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : initial } catch { return initial }
  })
  function update(next: T | ((previous: T) => T)) {
    setValue(previous => {
      const result = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next
      try { localStorage.setItem(key, JSON.stringify(result)) } catch { /* Keep the preview usable when storage is unavailable. */ }
      return result
    })
  }
  return [value, update] as const
}
