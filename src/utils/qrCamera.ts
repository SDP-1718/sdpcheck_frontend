export interface QrCameraDevice { deviceId: string; label: string }

function cameraScore(label: string) {
 if (/front|user|전면|앞면|facetime/i.test(label)) return -100
 if (!/back|rear|environment|후면|후방/i.test(label)) return 0
 if (/ultra|초광각|울트라|0[.,]5/i.test(label)) return -20
 if (/telephoto|tele\b|망원/i.test(label)) return -10
 if (/dual|triple|듀얼|트리플/i.test(label)) return 10
 return 100
}

export async function openQrCamera(deviceId: string | null, cancelled: () => boolean) {
 let stream: MediaStream | null = null
 const stop = () => stream?.getTracks().forEach(track => track.stop())
 const open = (id?: string) => navigator.mediaDevices.getUserMedia({
  audio: false,
  video: id ? { deviceId: { exact: id } } : { facingMode: { ideal: 'environment' } },
 })
 try {
  try { stream = await open(deviceId ?? undefined) }
  catch (error) {
   if (!deviceId || !(error instanceof DOMException) || !['NotFoundError','OverconstrainedError'].includes(error.name)) throw error
   if (cancelled()) return null
   stream = await open()
  }
  if (cancelled()) { stop(); return null }
  let devices: QrCameraDevice[] = []
  try {
   const all = await navigator.mediaDevices.enumerateDevices?.() ?? []
   devices = all.filter(device => device.kind === 'videoinput' && device.deviceId)
    .map(device => ({ deviceId: device.deviceId, label: device.label }))
  } catch { /* The current camera can still scan when device listing is unavailable. */ }
  if (cancelled()) { stop(); return null }
  const track = () => stream?.getVideoTracks()[0] ?? stream?.getTracks()[0]
  const currentId = track()?.getSettings?.().deviceId
  const preferred = [...devices].sort((a,b) => cameraScore(b.label)-cameraScore(a.label))[0]
  if (!deviceId && preferred && cameraScore(preferred.label) > 0 && preferred.deviceId !== currentId) {
   stop()
   try { stream = await open(preferred.deviceId) }
   catch (error) {
    if (cancelled()) return null
    if (error instanceof DOMException && ['NotAllowedError','SecurityError'].includes(error.name)) throw error
    stream = await open()
   }
  }
  if (cancelled()) { stop(); return null }
  const activeTrack = track()
  const capabilities = activeTrack?.getCapabilities?.() as (MediaTrackCapabilities & { zoom?: { min:number; max:number } }) | undefined
  if (capabilities?.zoom && capabilities.zoom.min <= 1 && capabilities.zoom.max >= 1) {
   try { await activeTrack?.applyConstraints({ advanced: [{ zoom: 1 } as MediaTrackConstraintSet & { zoom:number }] }) }
   catch { /* Zoom is optional; do not prevent scanning when unsupported. */ }
  }
  if (cancelled()) { stop(); return null }
  return { stream, devices, activeId: track()?.getSettings?.().deviceId ?? '' }
 } catch (error) { stop(); throw error }
}
