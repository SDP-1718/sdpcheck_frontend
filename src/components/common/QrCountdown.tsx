export default function QrCountdown({remaining}:{remaining:number}) {
 const seconds=Number.isFinite(remaining)?Math.max(0,Math.min(60,Math.ceil(remaining))):0
 const elapsed=(60-seconds)/60*360
 return <div className="countdown countdown-ring" role="timer" aria-label={`QR 갱신까지 ${seconds}초`} style={{backgroundImage:`conic-gradient(#e1e2e2 0deg ${elapsed}deg, #000 ${elapsed}deg 360deg)`}}><strong>{seconds}</strong></div>
}
