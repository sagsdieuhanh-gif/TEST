const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const buf=p=>fs.readFileSync(path.join(root,p));
const txt=p=>buf(p).toString('utf8');
const sha=p=>crypto.createHash('sha256').update(buf(p)).digest('hex');
const expected={
  'app/boot/32-fixed-ui-rule-v64113.js':'2109a24ab29092ffe728bde74f70a3c77bb320bbfe8fa44f25c4f068b5064150',
  'app/modules/daily-roster.v502.js':'f90798cf4c827683edc90c10654a60ff62a9cb15dd8a6feba8622715934038e3',
  'app/modules/fsags208-workspace.v1.js':'56858bc07e206636abb7f923b68eb75f3ad7d7cfd66317e4d7faa8f87e7bd6a6',
  'app/styles/fixed-ui-rule-v64113.css':'bc4bc86956ac2947680ada536cf710b56cfcd6a5ecff69a4c3f0b09544ce3190'
};
for(const [p,h] of Object.entries(expected))assert.equal(sha(p),h,p+' must match verified V6.4.118 byte-for-byte');
const html=txt('index.html'),sw=txt('service-worker.js'),version=JSON.parse(txt('version.json'));
assert.equal(version.version,'V6.4.123');
assert.equal(version.base,'V6.4.122-20261004-ROLLBACK118-01');
assert(!/V6\.4\.(119|120|121)/.test(html),'index must not reference later runtime builds');
assert(!/V6\.4\.(119|120|121)/.test(sw),'service worker must not reference later runtime builds');
assert(!html.includes('cargo-myflight-ui.v64120.js'),'V6.4.120 route module must stay absent');
assert(!sw.includes('cargo-myflight-ui.v64120.js'),'V6.4.120 route module must stay absent from PWA bootstrap');
console.log('V6.4.123 retains verified V6.4.118 operational runtime baseline.');
