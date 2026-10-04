const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const desktop=read('app/styles/desktop-shell-v64128.css');
const roster=read('app/modules/daily-roster.v502.js');
const runtime=read('app/generated/runtime-1.js');
const app=read('app/core/app.v503.js');
const sw=read('service-worker.js');
const version=JSON.parse(read('version.json'));

assert(Number(String(version.version||'').split('.').pop())>=128,'desktop layout contract applies from V6.4.128 onward');
assert(html.includes('desktop-shell-v64128.css'),'desktop shell stylesheet must load after fixed UI rules');
assert(desktop.includes('@media (min-width:1024px)'),'desktop shell must be isolated from mobile/tablet');
assert(desktop.includes('--sags-desktop-sidebar:268px'),'desktop home must use a compact dedicated sidebar');
assert(desktop.includes('grid-template-columns:repeat(auto-fit,minmax(285px,1fr))'),'desktop My Flight must auto-fit real desktop cards');
assert(desktop.includes('top:66px!important;right:24px!important;left:auto!important;bottom:auto!important'),'desktop form actions must use a top/right command bar, not the mobile bottom dock');
assert(html.includes('id="sagsCompatibilityToolbar"'),'empty compatibility anchor must remain so operational action generation still initializes');
assert(!html.includes('id="roleBtnQuickTime"'),'legacy quick-entry toolbar button must remain removed');
assert(!runtime.includes('v163FlightBtn'),'CHUYẾN operation button must not be generated');
assert(!runtime.includes('✈ CHUYẾN'),'CHUYẾN operation button copy must not be generated');
assert(roster.includes("host.querySelectorAll('.v1199DirectTask').forEach(btn=>btn.onclick=()=>openTask("),'direct My Flight cards must route through openTask');
assert(roster.includes("if(exact){")&&roster.includes("MỞ BIỂU MẪU?"),'direct My Flight open must require confirmation');
assert(sw.includes('./app/styles/desktop-shell-v64128.css'),'desktop shell must be part of verified PWA bootstrap');
console.log('V6.4.128 desktop/form-open regression guard passed.');

// verified-release-recheck-v64128

assert(desktop.includes('inset:0 0 0 var(--sags-desktop-sidebar)!important'),'desktop My Flight must occupy the workspace beside the sidebar');
assert(desktop.includes('height:calc(100vh - 36px)!important'),'desktop My Flight must use the available screen height');
assert(desktop.includes('#v644MyFlightBack'),'desktop back control must have stable styling');
assert(desktop.includes('transition:none!important;animation:none!important'),'desktop back control must never blink through transitions/animations');
assert(!runtime.includes('home.textContent="↻ CÔNG VIỆC"'),'legacy CÔNG VIỆC reload action must be removed');
assert(runtime.includes('home.textContent="☰ MENU"'),'My Flight primary navigation action must be MENU');
assert(runtime.includes('back.textContent="←"'),'My Flight must keep one stable previous-page arrow');
assert(runtime.includes('else pushUiBack("home")'),'My Flight must remember Home as a valid previous page');
assert(runtime.includes('setTimeout(()=>goHome(),20)'),'back-stack fallback must return to main Home instead of reopening My Flight');
assert(!runtime.includes('if(canReturn){if(!back){back=document.createElement("button")'),'back arrow must not be repeatedly created/removed from back-stack changes');
console.log('V6.4.136 desktop workspace/navigation guard passed.');

assert(runtime.includes('if(close&&close!==home){if(desktop)close.remove();else{close.hidden=true'),'legacy faded close button must be removed only on desktop while mobile keeps its stable hidden node');
assert(runtime.includes('modal.querySelector("#sagsContextBackRow")?.remove()'),'desktop My Flight must clear stale injected context-back rows');
assert(app.includes('layer.id==="fwcModal"&&matchMedia("(min-width:900px)").matches'),'global context-back must not inject into desktop My Flight');
assert(!desktop.includes('#v477Close{display:none!important}'),'desktop shell must not rely on hiding the legacy close button');
console.log('V6.4.137 ghost-control removal guard passed.');

assert(desktop.includes('position:fixed!important;'),'desktop My Flight overlay must be explicitly positioned');
assert(desktop.includes('left:var(--sags-desktop-sidebar)!important'),'desktop My Flight must start after the sidebar');
assert(desktop.includes('V6.4.88 geometry, new-UI visual language'),'desktop form toolbar must use the balanced legacy geometry with new UI styling');
assert(desktop.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'desktop operation nav must be a balanced four-column row');
const fixed=fs.readFileSync(path.join(root,'app/styles/fixed-ui-rule-v64113.css'),'utf8');
assert(fixed.includes('V6.4.139 · OPERATIONAL FORM FIELD SAFETY'),'form field safety layer missing');
assert(fixed.includes('background:#fff!important;'),'operational paper fields must stay white');
assert(fixed.includes('accent-color:#123a72!important;'),'checkbox/radio state must stay visible');
console.log('V6.4.139 field readability + balanced desktop toolbar guard passed.');
