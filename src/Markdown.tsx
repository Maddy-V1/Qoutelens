import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function Markdown({text}:{text:string}){return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>}
export function downloadMarkdown(name:string,text:string){const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name.replace(/[^a-zA-Z0-9._-]/g,'_')+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
