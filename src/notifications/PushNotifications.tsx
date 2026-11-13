import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { X } from 'lucide-react'
import { useAuth } from '../auth/AuthState'
import { useMockApi } from '../api/config'
import { enablePush, isPushConnected, pushUnavailableReason } from './push'

export function PushDeviceSettings() {
  const [connected, setConnected] = useState(isPushConnected)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState(pushUnavailableReason)
  useEffect(() => {
    const sync = () => { setConnected(isPushConnected()); setReason(pushUnavailableReason()) }
    window.addEventListener('sdp:push-state', sync)
    window.addEventListener('focus', sync)
    return () => { window.removeEventListener('sdp:push-state', sync); window.removeEventListener('focus', sync) }
  }, [])
  async function enable() {
    setBusy(true); setMessage('')
    try { await enablePush() }
    catch(error) { setMessage(error instanceof Error ? error.message : '알림을 연결하지 못했어요. 다시 시도해주세요.') }
    finally { setBusy(false) }
  }
  return <div className="push-device-settings"><p role="status">{reason || (connected ? '이 기기에서 알림을 받을 수 있어요.' : '이 기기에서 알림을 받으려면 알림을 허용해주세요.')}</p>{!reason && !connected && <button type="button" className="secondary" disabled={busy} onClick={() => {void enable()}}>{busy ? '알림 연결 중...' : '이 기기 알림 허용'}</button>}{message && <p role="alert">{message}</p>}</div>
}
function AuthenticatedPushNotifications() {
  const navigate = useNavigate()
  const [notification, setNotification] = useState<{title:string;body:string;path:string}|null>(null)
  useEffect(() => {
    const message = (event: Event) => { setNotification((event as CustomEvent<{title:string;body:string;path:string}>).detail) }
    const reconnect = () => {
      if (document.visibilityState === 'visible' && !pushUnavailableReason() && Notification.permission === 'granted') void enablePush(false).catch(() => {})
    }
    reconnect()
    window.addEventListener('sdp:push-message', message)
    document.addEventListener('visibilitychange', reconnect)
    return () => {window.removeEventListener('sdp:push-message', message); document.removeEventListener('visibilitychange', reconnect)}
  }, [])
  if (!notification) return null
  return <aside className="push-message" aria-label="새 알림" role="status"><button className="push-message-content" onClick={() => {navigate(notification.path); setNotification(null)}}><strong>{notification.title}</strong><span>{notification.body}</span></button><button className="icon-button" aria-label="알림 닫기" onClick={() => setNotification(null)}><X size={20}/></button></aside>
}

export default function PushNotifications() {
  const {session} = useAuth()
  return session.status === 'authenticated' && !useMockApi ? <AuthenticatedPushNotifications/> : null
}
