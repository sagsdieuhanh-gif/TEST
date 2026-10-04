const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const buf=p=>fs.readFileSync(path.join(root,p));
const txt=p=>buf(p).toString('utf8');
const sha=p=>crypto.createHash('sha256').update(buf(p)).digest('hex');
const expected={
  'app/boot/32-fixed-ui-rule-v64113.js':'2109a24ab29092ffe728bde74f70a3c77bb320bbfe8fa44f25c4f068b5064150'
};
for(const [p,h] of Object.entries(expected))assert.equal(sha(p),h,p+' must retain verified baseline byte-for-byte');
const fs208=txt('app/modules/fsags208-workspace.v1.js');assert(fs208.includes('shared.cardHtml(group,date)'),'intentional Cargo UI change must reuse shared My Flight renderer');
const html=txt('index.html'),sw=txt('service-worker.js'),version=JSON.parse(txt('version.json'));
assert(Number(String(version.version||'').split('.').pop())>=124,'verified core baseline guard applies from V6.4.124 onward');
assert(!/V6\.4\.(119|120|121)/.test(html),'index must not reference later runtime builds');
assert(!/V6\.4\.(119|120|121)/.test(sw),'service worker must not reference later runtime builds');
assert(!html.includes('cargo-myflight-ui.v64120.js'),'V6.4.120 route module must stay absent');
assert(!sw.includes('cargo-myflight-ui.v64120.js'),'V6.4.120 route module must stay absent from PWA bootstrap');
console.log('Verified baseline retained; V6.4.128 Cargo UI evolution is covered by dedicated guards.');
