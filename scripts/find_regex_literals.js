const fs = require('fs');
const path = require('path');
function walk(dir){let res=[]; if(!fs.existsSync(dir)) return res; for(const f of fs.readdirSync(dir)){const p=path.join(dir,f); if(fs.statSync(p).isDirectory()) res=res.concat(walk(p)); else if(p.endsWith('.tsx')||p.endsWith('.jsx')||p.endsWith('.ts')||p.endsWith('.js')) res.push(p);} return res}
const files=walk(path.join('apps','web','src'));
let out=[];
for(const file of files){const txt=fs.readFileSync(file,'utf8'); const lines=txt.split('\n'); for(let i=0;i<lines.length;i++){ if(lines[i].includes('/^') && lines[i].trim().startsWith('/')){ out.push(`${file}::L${i+1} -> ${lines[i].trim()}`);} if(lines[i].includes('RegExp(')||lines[i].includes('/vercel')||lines[i].includes('vercel.app')){ out.push(`${file}::L${i+1} -> ${lines[i].trim()}`);} }}
if(out.length===0) console.log('NO_REGEX_LITERALS'); else console.log(out.join('\n'));
