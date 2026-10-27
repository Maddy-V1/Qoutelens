import { seedTender, type Tender, type Supplier } from './domain';
const KEY='quotelens-rebuild-v2';
export type Store={tenders:Tender[];profiles:Supplier[];savedSuppliers:string[]};
export function readStore():Store{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&Array.isArray(v.tenders)&&Array.isArray(v.profiles)&&Array.isArray(v.savedSuppliers))return v;}catch{}return {tenders:[seedTender()],profiles:[],savedSuppliers:[]};}
export function saveStore(s:Store){localStorage.setItem(KEY,JSON.stringify(s));}
async function database(){return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('quotelens-rebuild-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function storeFile(id:string,file:File){const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
export async function loadFile(id:string):Promise<File|undefined>{const db=await database();try{return await new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
