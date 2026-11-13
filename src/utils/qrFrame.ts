export function captureQrFrame(video:HTMLVideoElement,zoom:number,canvas:HTMLCanvasElement){
 if(!video.videoWidth||!video.videoHeight)return null
 const factor=Math.min(4,Math.max(1,zoom))
 const side=Math.min(video.videoWidth,video.videoHeight)/factor
 const output=Math.min(1280,Math.min(video.videoWidth,video.videoHeight))
 if(canvas.width!==output||canvas.height!==output){canvas.width=output;canvas.height=output}
 const context=canvas.getContext('2d',{willReadFrequently:true})
 if(!context)return null
 context.drawImage(video,(video.videoWidth-side)/2,(video.videoHeight-side)/2,side,side,0,0,output,output)
 return canvas
}
