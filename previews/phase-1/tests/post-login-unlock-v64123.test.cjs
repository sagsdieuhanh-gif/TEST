const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),hotfix=read('app/modules/post-login-unlock.v64123.js');
assert(html.includes('post-login-unlock.v64123.js'),'post-login unlock module must load from index.html');
assert(html.indexOf('post-login-unlock.v64123.js')>html.indexOf('fixed-ui-rule-runtime-v64113'),'post-login unlock must load late, after the shared UI runtime');
assert(hotfix.includes('firebasePersonalAccountLogin=patchedLogin'),'real Firebase login function must be replaced');
assert(hotfix.includes("m.style.setProperty('display','none','important')"),'successful login must forcibly close the full-screen login overlay');
assert(hotfix.includes("document.body?.classList.add('v157-authenticated','v157-home')"),'successful login must enter authenticated Home in-place');
assert(hotfix.includes('restoreWatchdog'),'cached-session restore needs a watchdog');
assert(hotfix.includes('Khôi phục phiên đăng nhập mất quá lâu'),'watchdog must return a stalled blank restore to a usable login card');
assert(!hotfix.includes('location.reload'),'post-login hotfix must never force a second page reload');
assert(hotfix.includes('testTransition'),'browser regression hook must exercise the actual unlock transition');
console.log('V6.4.123 post-login unlock regression guard passed.');

assert(hotfix.includes('function unlockTouchSurface({resetState=false}={})'),'mobile touch surface unlock must exist');
assert(hotfix.includes("if(resetState&&body.classList.contains('v157-home'))"),'stale blocking classes may only be cleared in the initial reset pass');
assert(hotfix.includes("body.classList.remove('v157-drawer-open','sags-overlay-open','v166-overlay-open','sags-quicktime-open','v163-operational')"),'initial home unlock must clear stale blocking classes');
assert(hotfix.includes("backdrop.style.setProperty('pointer-events','none','important')"),'closed drawer backdrop must never intercept mobile touch');
assert(hotfix.includes("e.style.setProperty('pointer-events','auto','important')"),'home navigation surfaces must be re-enabled');
assert(hotfix.includes('scheduleBackgroundVerify()'),'post-login verification must be deferred');
assert(!hotfix.includes('verifyPersonalSession(true)}catch(_){}},500'),'forced 500ms verification must stay removed');
console.log('V6.4.132 mobile touch surface guard passed.');

assert(hotfix.includes("unlockTouchSurface({resetState:false})"),'later safety passes must preserve user state');
assert(hotfix.includes("backdrop&&body.classList.contains('v157-drawer-open')"),'active drawer must restore normal backdrop behavior');
console.log('V6.4.133 user-opened drawer preservation guard passed.');

assert(hotfix.includes('function ensureMobileMenuButton()'),'mobile MENU fallback must be guaranteed');
assert(hotfix.includes("btn.id='sagsMobileMenuBtn'"),'mobile MENU fallback needs stable id');
assert(hotfix.includes("if(typeof root.v157OpenMenu==='function')root.v157OpenMenu()"),'mobile MENU must call the canonical drawer opener');
assert(hotfix.includes("body.v157-authenticated.v157-home #sagsGoStartBtn{display:none!important}"),'redundant Home button must hide on mobile Home');
console.log('V6.4.134 guaranteed mobile MENU entry guard passed.');

assert(hotfix.includes("const anchor=brand?.parentElement===nav?brand:(nav.firstElementChild||null)"),'mobile MENU insertion must only use a direct-child anchor');
const v143Start=hotfix.indexOf("function unlockTouchSurface({resetState=false}={})");
const v143Blocker=hotfix.indexOf("body.classList.remove('v157-drawer-open'",v143Start);
const v143Menu=hotfix.indexOf("try{ensureMobileMenuButton()}",v143Start);
assert(v143Blocker>=0&&v143Menu>v143Blocker,'touch blockers must clear before MENU enhancement');
assert(hotfix.includes("catch(e){console.warn('V6.4.143 MENU fallback'"),'MENU enhancement failure must be contained');
console.log('V6.4.143 mobile unlock fail-safe guard passed.');
