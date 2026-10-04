const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const route=read('app/modules/cargo-myflight-ui.v64120.js');
const css=read('app/styles/fixed-ui-rule-v64113.css');

assert(html.includes('id="v64120-cargo-myflight-route"'),'late Cargo route authority must load from index');
assert(html.indexOf('v64120-cargo-myflight-route')>html.indexOf('fixed-ui-rule-runtime-v64113'),'Cargo route authority must load after common UI runtime');
assert(route.includes("title.textContent='✈ MY FLIGHT'"),'Cargo title must be MY FLIGHT, not a separate Cargo title');
assert(route.includes("sub.textContent='Hồ sơ của tôi'"),'Cargo subtitle must match DH/CBTT');
assert(route.includes('renderCargoMyFlight'),'Cargo route must use FSAGS208 shared-card renderer');
assert(route.includes('flightWorkspaceOpenList=fn'),'Cargo My Flight entry must be intercepted at the common route');
assert(route.includes("r==='KH'||r==='CARGO'"),'Cargo route detection must support KH/CARGO role codes');
assert(route.includes('/KHO HÀNG|KHO HANG|CARGO/'),'Cargo route detection must support department metadata');

assert(css.includes('V6.4.120 CARGO MY FLIGHT + QUICK INPUT COMPACT'),'V6.4.120 UI block missing');
assert(css.includes('body.sags-cargo-unified-myflight #fwcModal .sagsCargo208Queue .v1199Card'),'Cargo shared cards need exact common visual override');
assert(css.includes('body #quickTimeModal .quickTimePanel'),'Quick Input compact panel override missing');
assert(css.includes('height:min(88dvh,760px)'),'Quick Input must no longer occupy almost the whole mobile screen');
assert(css.includes('body #quickTimeModal .quickTimeBack')&&css.includes('display:none!important'),'Quick Input redundant back arrow must be removed');
assert(css.includes('body #quickTimeModal .quickTimeFooterActions')&&css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'Quick Input footer must use compact one-row actions');
assert(css.includes('height:40px!important')&&css.includes('border-radius:10px!important'),'Quick Input buttons must follow compact fixed UI geometry');

console.log('V6.4.120 exact Cargo My Flight + compact Quick Input UI guard passed.');
