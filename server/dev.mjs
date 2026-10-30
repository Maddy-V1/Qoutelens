import { spawn } from 'node:child_process';
const commands=[['--env-file-if-exists=.env','--watch','server/index.mjs'],['node_modules/vite/bin/vite.js','--host','127.0.0.1']];
const children=commands.map(args=>spawn(process.execPath,args,{stdio:'inherit',env:process.env}));
function stop(){for(const child of children)child.kill();}
process.on('SIGINT',()=>{stop();process.exit()});process.on('SIGTERM',()=>{stop();process.exit()});children.forEach(child=>child.on('exit',code=>{if(code){stop();process.exit(code)}}));
