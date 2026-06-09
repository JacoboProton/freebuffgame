const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) results = results.concat(walk(p));
    else if (p.endsWith('.tsx') || p.endsWith('.jsx')) results.push(p);
  }
  return results;
}

function isClientFile(txt) {
  const head = txt.split('\n').slice(0, 8).join('\n');
  return /['\"]use client['\"]/i.test(head) || /use client/i.test(head);
}

function isLiteral(expr) {
  const trimmed = expr.trim();
  if (/^['\"`].*['\"`]$/.test(trimmed)) return true; // string
  if (/^[-+]?\d+(\.\d+)?$/.test(trimmed)) return true; // number
  if (/^\{.*\}$/.test(trimmed)) return true; // object literal (simple)
  if (/^\[.*\]$/.test(trimmed)) return true; // array literal (simple)
  if (/^null$|^undefined$/.test(trimmed)) return true;
  return false;
}

const root = path.join('apps','web','src','app');
if (!fs.existsSync(root)) {
  console.error('apps/web/src/app not found');
  process.exit(2);
}

const files = walk(root);
let candidates = [];
const propRx = /<([A-Z][A-Za-z0-9_\.]*)[^>]*\s+([a-zA-Z0-9_\-:]+)=\{([^}]+)\}/g;
for (const file of files) {
  const txt = fs.readFileSync(file, 'utf8');
  if (isClientFile(txt)) continue;
  let m;
  while ((m = propRx.exec(txt)) !== null) {
    const comp = m[1];
    const prop = m[2];
    const expr = m[3].trim();
    const line = txt.substring(0, m.index).split('\n').length;
    const suspectKeywords = ['prisma', 'PrismaClient', 'new Date', 'Date(', 'Request', 'Response', 'clerk', 'getServerSession', 'getUser', 'user', 'auth', 'cookies', 'headers'];
    const isSuspect = !isLiteral(expr) || suspectKeywords.some(k => expr.includes(k));
    if (isSuspect) {
      candidates.push({file, line, comp, prop, expr});
    }
  }
}

if (candidates.length === 0) {
  console.log('NO_CANDIDATES');
  process.exit(0);
}
for (const c of candidates) {
  console.log(`${c.file}::L${c.line} -> <${c.comp}> ${c.prop}={${c.expr}}`);
}
