import { useEffect, useRef, useState } from 'react'
import { openQrCamera } from '../utils/qrCamera'
import type { QrCameraDevice } from '../utils/qrCamera'
import type { RefObject } from 'react'

interface DetectedCode { rawValue: string }
interface QrDetector { detect(source: HTMLVideoElement): Promise<DetectedCode[]> }
interface QrDetectorConstructor {
  new (options: { formats: string[] }): QrDetector
  getSupportedFormats?: () => Promise<string[]>
}
type CameraFailure = 'permission' | 'missing' | 'busy' | 'unsupported' | 'submission' | 'unknown'
export type QrCameraState =
  | { phase: 'loading' | 'scanning' | 'processing' }
  | { phase: 'error'; reason: CameraFailure }

function cameraFailure(error: unknown): CameraFailure {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'permission'
    if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') return 'missing'
    if (error.name === 'NotReadableError' || error.name === 'AbortError') return 'busy'
  }
  return 'unknown'
}

export function useQrCamera(
  videoRef: RefObject<HTMLVideoElement | null>,
  onDecoded: (code: string) => Promise<void>,
  enabled: boolean,
) {
  const [state, setState] = useState<QrCameraState>({ phase: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [requestedId, setRequestedId] = useState<string | null>(null)
  const [cameraInfo, setCameraInfo] = useState<{ devices: QrCameraDevice[]; activeId: string }>({devices:[], activeId:''})
  const startup = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let stream: MediaStream | null = null
    let timer: number | undefined
    let stopFallback: (() => void) | undefined
    let submitted = false
    const video = videoRef.current

    function stopCamera() {
      stopFallback?.()
      stream?.getTracks().forEach(track => track.stop())
      if (video?.srcObject === stream) video.srcObject = null
    }

    async function start() {
      try {
        if (disposed) return
        const camera = await openQrCamera(requestedId, () => disposed)
        if (!camera) return
        stream = camera.stream
        if (!disposed) setCameraInfo({devices:camera.devices, activeId:camera.activeId})
        if (disposed || !video) { stopCamera(); return }
        video.srcObject = stream
        await video.play()
        if (disposed) { stopCamera(); return }

        const Detector = (window as Window & { BarcodeDetector?: QrDetectorConstructor }).BarcodeDetector
        const formats = await Detector?.getSupportedFormats?.()
        if (disposed) { stopCamera(); return }
        if (!Detector || (formats && !formats.includes('qr_code'))) {
          const { BrowserQRCodeReader } = await import('@zxing/browser')
          if (disposed) { stopCamera(); return }
          const reader = new BrowserQRCodeReader()
          setState({ phase: 'scanning' })
          const controls = await reader.decodeFromVideoElement(video, (result, _error, scanControls) => {
            if (disposed || submitted || !result?.getText().trim()) return
            submitted = true
            scanControls.stop()
            stopCamera()
            setState({ phase: 'processing' })
            void onDecoded(result.getText()).catch(() => {
              if (!disposed) setState({ phase: 'error', reason: 'submission' })
            })
          })
          stopFallback = () => controls.stop()
          if (disposed || submitted) stopCamera()
          return
        }
        const detector = new Detector({ formats: ['qr_code'] })
        setState({ phase: 'scanning' })

        async function detectNext() {
          if (disposed || !video) return
          try {
            const codes = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
              ? await detector.detect(video) : []
            if (disposed) return
            const code = codes.find(item => item.rawValue.trim())?.rawValue
            if (code) {
              stopCamera()
              setState({ phase: 'processing' })
              try { await onDecoded(code) }
              catch { if (!disposed) setState({ phase: 'error', reason: 'submission' }) }
              return
            }
          } catch {
            if (!disposed) {
              stopCamera()
              setState({ phase: 'error', reason: 'unknown' })
            }
            return
          }
          if (!disposed) timer = window.setTimeout(() => { void detectNext() }, 200)
        }
        void detectNext()
      } catch (error) {
        stopCamera()
        if (!disposed) setState({ phase: 'error', reason: cameraFailure(error) })
      }
    }

    if (navigator.mediaDevices?.getUserMedia) startup.current = startup.current.catch(() => {}).then(start)
    else {
      // Keep the update asynchronous, just like a rejected permission request.
      void Promise.resolve().then(() => {
        if (!disposed) setState({ phase: 'error', reason: 'unsupported' })
      })
    }
    return () => {
      disposed = true
      if (timer !== undefined) window.clearTimeout(timer)
      stopCamera()
    }
  }, [attempt, enabled, onDecoded, videoRef, requestedId])

  function retry() {
    setState({ phase: 'loading' })
    setAttempt(previous => previous + 1)
  }
  function switchCamera() {
    if (cameraInfo.devices.length < 2 || state.phase === 'loading' || state.phase === 'processing') return
    const current = cameraInfo.devices.findIndex(device => device.deviceId === cameraInfo.activeId)
    const next = cameraInfo.devices[(current + 1) % cameraInfo.devices.length]
    setState({phase:'loading'})
    setRequestedId(next.deviceId)
    setAttempt(previous => previous + 1)
  }
  return { state, retry, switchCamera, canSwitch:cameraInfo.devices.length > 1 }
}
