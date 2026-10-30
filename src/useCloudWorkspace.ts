import { useState,useEffect,useRef,useCallback } from 'react';
import { api,post } from './api';
import type { Store } from './storage';
export type User={id:string;name:string;email:string};
const empty=():Store=>({tenders:[],profiles:[],savedSuppliers:[]});
export function useCloudWorkspace(){
 const [store,rawSetStore]=useState<Store>(empty),[user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[syncError,setSyncError]=useState(''),[syncing,setSyncing]=useState(false);
 const current=useRef(store),version=useRef(0),saved=useRef(JSON.stringify(store)),userRef=useRef<User|null>(null),inflight=useRef<Promise<void>|null>(null);current.current=store;
 const setStore=useCallback((action:import('react').SetStateAction<Store>)=>{const next=typeof action==='function'?action(current.current):action;current.current=next;rawSetStore(next)},[]);
 const acceptRemote=useCallback((data:{store:Store;version:number})=>{version.current=data.version;saved.current=JSON.stringify(data.store);current.current=data.store;setStore(data.store);setSyncError('')},[]);
 const refreshSession=useCallback(async()=>{const {user:u}=await api<{user:User|null}>('/auth/me');if(u){const data=await api<{store:Store;version:number}>('/workspace');acceptRemote(data)}else{const value=empty();saved.current=JSON.stringify(value);current.current=value;setStore(value)}userRef.current=u;setUser(u);setReady(true);return u},[acceptRemote]);
 useEffect(()=>{refreshSession().catch(e=>{setSyncError(e.message);setReady(true)})},[refreshSession]);
 const syncNow=useCallback(async()=>{if(!userRef.current)throw new Error('Please log in before saving work.');if(inflight.current)await inflight.current;const serialized=JSON.stringify(current.current);if(serialized===saved.current)return;setSyncing(true);const pending=(async()=>{try{const result=await api<{version:number}>('/workspace',{method:'PUT',body:JSON.stringify({store:JSON.parse(serialized),version:version.current})});version.current=result.version;saved.current=serialized;setSyncError('')}catch(e){setSyncError(e instanceof Error?e.message:'Saving failed.');throw e}finally{setSyncing(false)}})();inflight.current=pending;try{await pending}finally{if(inflight.current===pending)inflight.current=null}},[]);
 useEffect(()=>{if(!user||JSON.stringify(store)===saved.current)return;const timer=setTimeout(()=>{syncNow().catch(()=>{})},700);return()=>clearTimeout(timer)},[store,user,syncNow]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(userRef.current&&JSON.stringify(current.current)!==saved.current){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[]);
 const logout=async()=>{await syncNow();await post('/auth/logout',{});userRef.current=null;setUser(null);const data=empty();saved.current=JSON.stringify(data);setStore(data)};
 return {store,setStore,user,ready,syncError,syncing,syncNow,refreshSession,logout,acceptRemote};
}
