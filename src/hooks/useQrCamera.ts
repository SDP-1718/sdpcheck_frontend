import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let stream: MediaStream | null = null
    let timer: number | undefined
    const video = videoRef.current

    function stopCamera() {
      stream?.getTracks().forEach(track => track.stop())
      if (video?.srcObject === stream) video.srcObject = null
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        })
        if (disposed || !video) { stopCamera(); return }
        video.srcObject = stream
        await video.play()
        if (disposed) { stopCamera(); return }

        const Detector = (window as Window & { BarcodeDetector?: QrDetectorConstructor }).BarcodeDetector
        const formats = await Detector?.getSupportedFormats?.()
        if (disposed) { stopCamera(); return }
        if (!Detector || (formats && !formats.includes('qr_code'))) {
          stopCamera()
          if (!disposed) setState({ phase: 'error', reason: 'unsupported' })
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

    if (navigator.mediaDevices?.getUserMedia) void start()
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
  }, [attempt, enabled, onDecoded, videoRef])

  function retry() {
    setState({ phase: 'loading' })
    setAttempt(previous => previous + 1)
  }
  return { state, retry }
}
