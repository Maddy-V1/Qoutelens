import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
export async function quotationImages(file:File,onProgress:(text:string)=>void):Promise<string[]>{
 if(file.type.startsWith('image/')){const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);return [canvas.toDataURL('image/jpeg',.9)]}finally{bitmap.close()}}
 const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
 try{if(pdf.numPages>12)throw new Error('Please split this PDF into documents of 12 pages or fewer. No pages have been skipped.');const images:string[]=[];for(let n=1;n<=pdf.numPages;n++){onProgress(`Preparing page ${n} of ${pdf.numPages}…`);const page=await pdf.getPage(n),natural=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(2,1800/Math.max(natural.width,natural.height))});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const context=canvas.getContext('2d')!;context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);await page.render({canvas,canvasContext:context,viewport}).promise;images.push(canvas.toDataURL('image/jpeg',.9));page.cleanup()}return images}finally{await pdf.loadingTask.destroy()}
}
