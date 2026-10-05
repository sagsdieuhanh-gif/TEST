const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const roster=read('app/modules/daily-roster.v502.js');
const lite=read('app/modules/roster-lite.v5.js');
const flight=read('app/generated/core-flight.js');
const ui=read('app/styles/new-ui-v1.css');
const aviation=read('app/styles/aviation-reference.v1.css');
const index=read('index.html');

assert.match(roster,/host\.__v1199SourceHtml!==next/,'personal MY FLIGHT must compare source data, not decorated DOM');
assert.doesNotMatch(roster,/if\(host\.innerHTML!==next\)/,'decorated DOM must not trigger card replacement loops');
assert.match(roster,/b&&b\.textContent!=='MY FLIGHT'/,'MY FLIGHT launcher text write must be idempotent');

assert.doesNotMatch(lite,/\[0,120,450,900,1900\]/,'five-pass canonical card rewriting must be removed');
assert.doesNotMatch(lite,/\[0,120,500,1400\]/,'applyRoleUI retry storm must be removed');
assert.match(lite,/flightFilterObserver\.observe\(target,\{childList:true,subtree:true\}\)/,'MY FLIGHT observer must be scoped to its modal when available');
assert.match(lite,/display:flex!important;flex-wrap:nowrap!important/,'canonical form list must be a compact horizontal chip row');

assert.match(flight,/function ensureFlightListShell\(date,cargoMode=false\)/,'stable list shell helper missing');
assert.match(flight,/function commitFlightListHtml\(html\)/,'stable flight-list commit helper missing');
assert.match(flight,/host\.__sagsSourceHtml===html/,'flight cards must not be replaced when source data is unchanged');

assert.match(ui,/V6\.4\.106 · MY FLIGHT CHIP ROW \+ STABILITY/);
assert.match(ui,/scroll-snap-type:x proximity!important/,'form chips should stay on one horizontally scrollable row');
assert.match(aviation,/contain-intrinsic-size:auto 240px/,'off-screen card geometry should avoid large layout jumps');

const localRefs=[
 ...[...index.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m=>m[1]),
 ...[...index.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m=>m[1])
].map(x=>x.replace(/^\.\//,'').split('?')[0]).filter(x=>x&&!/^https?:/.test(x)&&!x.startsWith('//'));
const dup=localRefs.filter((x,i,a)=>a.indexOf(x)!==i);
assert.deepEqual(dup,[],'index contains duplicate local runtime assets: '+dup.join(', '));
for(const ref of localRefs)assert.equal(fs.existsSync(path.join(root,ref)),true,'missing runtime asset: '+ref);

console.log('V6.4.106 chip layout, flicker prevention and runtime-reference audit passed.');
