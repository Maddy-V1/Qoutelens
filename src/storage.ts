import {post,fileBase64} from './api';
import type {Tender,Supplier} from './domain';
export type Store={tenders:Tender[];profiles:Supplier[];savedSuppliers:string[]};
export async function storeFile(id:string,file:File){await post(`/files/${encodeURIComponent(id)}`,{name:file.name,mime:file.type||'application/pdf',base64:await fileBase64(file)})}
export async function loadFile(id:string):Promise<File|undefined>{const response=await fetch(`/api/files/${encodeURIComponent(id)}`,{credentials:'same-origin'});if(!response.ok)throw new Error('Could not load the original quotation.');const blob=await response.blob();return new File([blob],'quotation',{type:blob.type})}
