const dateFormatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'})
const timeFormatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false})
export function dateParts(value:string){
 const date=new Date(value)
 if(!Number.isFinite(date.getTime()))return {date:'',time:''}
 return {date:dateFormatter.format(date),time:timeFormatter.format(date)}
}
