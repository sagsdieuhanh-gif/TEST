const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),sw=read('service-worker.js'),roster=read('app/modules/daily-roster.v502.js'),ui=read('app/boot/32-fixed-ui-rule-v64113.js');

assert(html.includes('rel="preconnect" href="https://www.gstatic.com"'),'Firebase CDN preconnect missing');
assert(!html.includes('firebase-functions-compat.js'),'unused Firebase Functions compat SDK must not block startup');
for(const sdk of ['firebase-app-compat.js','firebase-auth-compat.js','firebase-database-compat.js','firebase-firestore-compat.js'])
  assert(html.includes(sdk),'required Firebase SDK missing: '+sdk);

const appJs=[];
(function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.isFile()&&p.endsWith('.js'))appJs.push(p)}})(path.join(root,'app'));
for(const p of appJs){
 const s=fs.readFileSync(p,'utf8');
 assert(!/firebase\s*\.\s*functions\s*\(/.test(s),'firebase.functions still used in '+path.relative(root,p));
 assert(!/firebase\s*\.\s*app\s*\(\s*\)\s*\.\s*functions\s*\(/.test(s),'firebase app functions still used in '+path.relative(root,p));
 assert(!/httpsCallable\s*\(/.test(s),'httpsCallable still used in '+path.relative(root,p));
}

assert(sw.includes('sagsManifestMemo'),'service worker manifest memo missing');
assert(sw.includes('sagsVerifiedAssetKeys'),'service worker verified-byte memo missing');
assert(sw.includes('Array.from({length:4}'),'PWA staging must use bounded four-worker concurrency');
assert(sw.includes('sagsAssetVerificationKey'),'verified cache entries must be keyed by cache/path/checksum');

const fieldMatch=roster.match(/const QUEUE_STATUS_FIELDS=\[([^\]]+)\]/);
assert(fieldMatch,'roster queue field list missing');
const fields=[...fieldMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
for(const dead of ['flightCloseoutBy','flightCloseoutDate','flightCloseoutFlightKey','flightCloseoutUnit'])
 assert(!fields.includes(dead),'write-only queue field must not be fetched: '+dead);
assert(fields.length<=16,'roster queue should read at most 16 status leaves, got '+fields.length);
assert(roster.includes('MAX_STATUS_READS=16'),'roster Firebase leaf reads must be bounded');
assert(roster.includes('sagsRosterReadDiagnostics'),'roster read diagnostics missing');

assert(ui.includes('pendingScopes')&&ui.includes('requestAnimationFrame(apply)'),'UI mutation work must be frame-batched and scoped');
assert(!/tagLegacyButtons\(document\);stripDuplicateCopy\(document\.body\);\}\s*catch/.test(ui),'mutation path must not scan the entire document every frame');

console.log('V6.4.118 performance/stability guards passed: startup SDK pruning, PWA memoization, scoped UI render, bounded Firebase reads.');
