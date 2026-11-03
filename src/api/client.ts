import { apiBaseUrl } from './config'
import { ApiError } from './errors'
let token: string | null = null
let epoch = 0
let refreshing: Promise<void> | null = null
export function setAccessToken(value: string) { token = value }
export function clearAccessToken() { token = null; epoch++ }
export function getAuthEpoch() { return epoch }
export function hasAccessToken() { return token !== null }

async function send<T>(path: string, options: RequestInit, bearer: string | null, binary = false): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', binary ? '*/*' : 'application/json')
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`)
  let response: Response
  try { response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers, credentials: 'include' }) }
  catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw error; throw new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해주세요.') }
  if (binary && response.ok && !response.headers.get('Content-Type')?.includes('application/json')) return await response.blob() as T
  if (response.status === 204 && response.ok) return undefined as T
  let envelope: { isSuccess?: boolean; code?: string; message?: string; result?: T }
  try { envelope = await response.json() }
  catch { throw new ApiError(response.status, 'INVALID_RESPONSE', '서버 응답을 확인할 수 없습니다.') }
  if (!response.ok || envelope.isSuccess !== true) throw new ApiError(response.status, envelope.code ?? 'REQUEST_FAILED', envelope.message ?? '요청을 처리할 수 없습니다.')
  return envelope.result as T
}
async function refresh() {
  if (!refreshing) {
    const startedAt = epoch
    refreshing = send<{ accessToken: string }>('/api/v1/auth/refresh', { method: 'POST' }, null)
      .then(result => {
        if (startedAt !== epoch) throw new ApiError(401, 'SESSION_CHANGED', '로그인이 종료되었습니다.')
        if (!result?.accessToken) throw new ApiError(401, 'INVALID_TOKEN', '다시 로그인해주세요.')
        token = result.accessToken
      }).catch(error => {
        if (startedAt === epoch) { clearAccessToken(); window.dispatchEvent(new Event('sdp:session-expired')) }
        throw error
      }).finally(() => { refreshing = null })
  }
  return refreshing
}
export async function apiRequest<T>(path: string, options: RequestInit = {}, authenticated = true, binary = false): Promise<T> {
  const attemptedToken = authenticated ? token : null
  const startedAt = epoch
  try { return await send<T>(path, options, attemptedToken, binary) }
  catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !attemptedToken || startedAt !== epoch) throw error
    if (token === attemptedToken) await refresh()
    if (startedAt !== epoch) throw error
    try { return await send<T>(path, options, token, binary) }
    catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401 && startedAt === epoch) {
        clearAccessToken(); window.dispatchEvent(new Event('sdp:session-expired'))
      }
      throw retryError
    }
  }
}
