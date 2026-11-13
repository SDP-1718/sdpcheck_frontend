export function captureQrFrame(video:HTMLVideoElement,zoom:number,canvas:HTMLCanvasElement){
 if(!video.videoWidth||!video.videoHeight)return null
 const factor=Math.min(4,Math.max(1,zoom))
 const width=video.clientWidth||video.videoWidth,height=video.clientHeight||video.videoHeight
 // Match the visible object-fit: cover preview, including its current digital zoom.
 const scale=Math.max(width/video.videoWidth,height/video.videoHeight)
 const sourceWidth=width/scale/factor,sourceHeight=height/scale/factor
 const outputScale=Math.min(1920/Math.max(width,height),Math.max(video.videoWidth,video.videoHeight)/Math.max(width,height))
 const outputWidth=Math.max(1,Math.round(width*outputScale)),outputHeight=Math.max(1,Math.round(height*outputScale))
 if(canvas.width!==outputWidth||canvas.height!==outputHeight){canvas.width=outputWidth;canvas.height=outputHeight}
 const context=canvas.getContext('2d',{willReadFrequently:true})
 if(!context)return null
 context.drawImage(video,(video.videoWidth-sourceWidth)/2,(video.videoHeight-sourceHeight)/2,sourceWidth,sourceHeight,0,0,outputWidth,outputHeight)
 return canvas
}
