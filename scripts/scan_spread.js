const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) results = results.concat(walk(p));
    else if (p.endsWith('.tsx') || p.endsWith('.jsx')) results.push(p);
  }
  return results;
}

const root = path.join('apps','web','src');
const files = walk(root);
let out = [];
const spreadRx = /\{\.\.\.([^}]+)\}/g;
for (const file of files) {
  const txt = fs.readFileSync(file,'utf8');
  const head = txt.split('\n').slice(0,8).join('\n');
  if (/['\"]use client['\"]/i.test(head) || /use client/i.test(head)) continue;
  let m;
  while ((m = spreadRx.exec(txt)) !== null) {
    const expr = m[1].trim();
    const line = txt.substring(0, m.index).split('\n').length;
    out.push(`${file}::L${line} -> spread={...${expr}}`);
  }
}
if (out.length===0) console.log('NO_SPREADS'); else console.log(out.join('\n'));
