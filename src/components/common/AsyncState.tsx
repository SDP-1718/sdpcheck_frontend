export default function AsyncState({error=false,onRetry,message}:{error?:boolean;onRetry?:()=>void;message?:string}) {
 return <div className="api-state" role={error?'alert':'status'}><p>{message??(error?'정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.':'불러오는 중...')}</p>{onRetry&&<button type="button" className="secondary" onClick={onRetry}>다시 시도</button>}</div>
}
