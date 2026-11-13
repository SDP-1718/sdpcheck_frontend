import { apiRequest, getAuthEpoch, hasAccessToken } from '../api/client'
import { firebaseConfig, vapidKey } from './config'
import type { MessagePayload } from 'firebase/messaging'

const registrationKey = 'sdp-push-registration'
let pending: Promise<void> | null = null
let stopping = false
let connected = false
let registrationId: string | null = null
let stopMessages: (() => void) | undefined
let clientPromise: ReturnType<typeof loadClient> | undefined

export function pushUnavailableReason() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone
  if (ios && !standalone) return '아이폰에서는 홈 화면에 추가한 앱을 열어 알림을 허용해주세요.'
  if (!window.isSecureContext || !('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) return '이 브라우저에서는 푸시 알림을 지원하지 않아요.'
  if (Notification.permission === 'denied') return '기기 또는 브라우저 설정에서 이 앱의 알림을 허용해주세요.'
  return ''
}
export function isPushConnected() { return connected }
function updateConnected(value: boolean) {
  connected = value
  window.dispatchEvent(new Event('sdp:push-state'))
}
async function loadClient() {
  const [app, sdk] = await Promise.all([import('firebase/app'), import('firebase/messaging')])
  if (!await sdk.isSupported()) throw Error('이 브라우저에서는 푸시 알림을 지원하지 않아요.')
  const firebaseApp = app.getApps().find(value => value.name === 'sdp-notifications') ?? app.initializeApp(firebaseConfig, 'sdp-notifications')
  return { sdk, messaging: sdk.getMessaging(firebaseApp) }
}
function client() {
  clientPromise ??= loadClient().catch(error => { clientPromise = undefined; throw error })
  return clientPromise
}
export function notificationContent(payload: MessagePayload) {
  const data = payload.data ?? {}
  let path = '/home'
  const candidate = data.url || data.link || payload.fcmOptions?.link
  if (candidate) {
    try {
      const url = new URL(candidate, window.location.origin)
      if (url.origin === window.location.origin && /^\/(home|notices(?:\/[^/]+)?|schedule|mypage)$/.test(url.pathname)) path = url.pathname
    } catch { /* Invalid notification links open the home screen. */ }
  } else if (data.noticeId) path = '/notices/' + encodeURIComponent(data.noticeId)
  return { title: payload.notification?.title || data.title || 'SDP-Check', body: payload.notification?.body || data.body || '새 알림이 도착했어요.', path }
}
export function enablePush(requestPermission = true): Promise<void> {
  if (stopping || !hasAccessToken()) return Promise.reject(Error('로그인 후 다시 시도해주세요.'))
  const reason = pushUnavailableReason()
  if (reason) return Promise.reject(Error(reason))
  if (pending) return pending
  // Request directly in the button gesture, before loading the SDK (required on iOS).
  const permission = Notification.permission === 'granted' ? Promise.resolve('granted') : requestPermission ? Notification.requestPermission() : Promise.resolve(Notification.permission)
  const epoch = getAuthEpoch()
  pending = (async () => {
    if (await permission !== 'granted') throw Error('알림을 받으려면 알림 권한을 허용해주세요.')
    const { sdk, messaging } = await client()
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/', updateViaCache: 'none' })
    await navigator.serviceWorker.ready
    const token = await sdk.getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
    if (!token) throw Error('알림 기기를 등록하지 못했어요. 다시 시도해주세요.')
    if (stopping || epoch !== getAuthEpoch() || !hasAccessToken()) { await sdk.deleteToken(messaging); return }
    const result = await apiRequest<{tokenId:number}>('/api/v1/devices/push-tokens', { method: 'POST', body: JSON.stringify({token}), signal: AbortSignal.timeout(15000) })
    if (!Number.isSafeInteger(result?.tokenId) || result.tokenId <= 0) throw Error('알림 등록 응답을 확인하지 못했어요.')
    if (epoch !== getAuthEpoch() || !hasAccessToken()) { await sdk.deleteToken(messaging); return }
    registrationId = String(result.tokenId)
    try { localStorage.setItem(registrationKey, registrationId) } catch { /* Push remains usable without browser storage. */ }
    if (!stopMessages) stopMessages = sdk.onMessage(messaging, payload => {
      if (connected && hasAccessToken()) window.dispatchEvent(new CustomEvent('sdp:push-message', {detail: notificationContent(payload)}))
    })
    updateConnected(true)
  })().catch(async error => {
    updateConnected(false)
    // A failed member registration must not leave a previous account subscribed.
    if (clientPromise) {
      try { const {sdk, messaging} = await client(); await sdk.deleteToken(messaging) } catch { /* Keep the original registration error. */ }
    }
    throw error
  }).finally(() => { pending = null })
  return pending
}
export async function disablePush() {
  stopping = true
  updateConnected(false)
  stopMessages?.(); stopMessages = undefined
  try {
    try { await pending } catch { /* A failed registration must not prevent logout. */ }
    let tokenId: string | null = registrationId
    registrationId = null
    try { tokenId ??= localStorage.getItem(registrationKey); localStorage.removeItem(registrationKey) } catch { /* Storage can be disabled. */ }
    try {
      if (tokenId && /^\d+$/.test(tokenId) && hasAccessToken()) await apiRequest('/api/v1/devices/push-tokens/' + tokenId, {method:'DELETE', signal: AbortSignal.timeout(5000)})
    } finally {
      if (clientPromise || ('Notification' in window && Notification.permission === 'granted')) {
        const { sdk, messaging } = await client()
        await sdk.deleteToken(messaging)
      }
    }
  } finally { stopping = false; updateConnected(false); stopMessages?.(); stopMessages = undefined }
}
