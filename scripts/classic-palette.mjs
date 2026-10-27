import fs from 'node:fs';
import postcss from 'postcss';
const path='src/styles.css';let css=fs.readFileSync(path,'utf8');
if(!css.includes('/* Classic palette restored */')){
const root=postcss.parse(css);root.walkDecls(d=>{if(/\.green|\.good|\.met\b|success|\.avatar\./.test(d.parent.selector||'')||d.prop==='--green')return;d.value=d.value.replace(/#([\da-f]{6})([\da-f]{2})?\b/gi,(full,hex,alpha='')=>{let [r,g,b]=hex.match(/../g).map(x=>parseInt(x,16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;if(!delta)return full;let h=max===r?(g-b)/delta+(g<b?6:0):max===g?(b-r)/delta+2:(r-g)/delta+4;h*=60;if(h<65||h>195)return full;let s=delta/(1-Math.abs(2*l-1));if(l<.5)s=Math.min(s,.26);else s=Math.min(s,.5);const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((265/60)%2-1)),m=l-c/2;return '#'+[x,0,c].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('')+alpha;});});
fs.writeFileSync(path,'/* Classic palette restored */\n'+root.toString());}
