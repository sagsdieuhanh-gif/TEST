const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const finalizer=read('tools/finalize-test-release.cjs');
assert(html.includes('id="sagsCompatibilityToolbar"'),'hidden compatibility toolbar anchor must remain for dependent runtime code');
assert(!html.includes('id="roleBtnQuickTime"'),'legacy Quick Entry toolbar button must not exist');
assert(!html.includes('id="roleBtnExport"'),'legacy Export toolbar button must not exist');
assert(!html.includes('id="roleBtnSignature"'),'legacy Signature toolbar button must not exist');
assert(!html.includes('id="roleBtnFlights"'),'legacy Flights toolbar button must not exist');
assert(Number(String(JSON.parse(read('version.json')).version||'').split('.').pop())>=126,'legacy toolbar removal contract applies from V6.4.126 onward');
console.log('V6.4.126 legacy toolbar removal guard passed.');

// verified-release-recheck-v64126
