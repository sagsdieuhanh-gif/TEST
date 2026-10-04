const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const buf=p=>fs.readFileSync(path.join(root,p));
const txt=p=>buf(p).toString('utf8');
const sha=p=>crypto.createHash('sha256').update(buf(p)).digest('hex');
const expected={
  'app/boot/32-fixed-ui-rule-v64113.js':'48e2a29c35d2529f0d4003299e5897d3f71277866b09737af6096ec1450ca250',
  'app/modules/fsags208-workspace.v1.js':'56858bc07e206636abb7f923b68eb75f3ad7d7cfd66317e4d7faa8f87e7bd6a6'
};
for(const [p,h] of Object.entries(expected))assert.equal(sha(p),h,p+' must match the current verified stability baseline byte-for-byte');
const html=txt('index.html'),sw=txt('service-worker.js'),version=JSON.parse(txt('version.json'));
assert(Number(String(version.version||'').split('.').pop())>=124,'verified core baseline guard applies from V6.4.124 onward');
assert(!/V6\.4\.(119|120|121)/.test(html),'index must not reference later runtime builds');
assert(!/V6\.4\.(119|120|121)/.test(sw),'service worker must not reference later runtime builds');
assert(!html.includes('cargo-myflight-ui.v64120.js'),'V6.4.120 route module must stay absent');
assert(!sw.includes('cargo-myflight-ui.v64120.js'),'V6.4.120 route module must stay absent from PWA bootstrap');
console.log('Verified core baseline retained; fixed UI observer baseline intentionally advances to V6.4.129 mobile stability.');
