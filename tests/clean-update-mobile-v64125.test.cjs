const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const repair=read('repair.html');
const detector=read('app/boot/25-v1154-update-detector-r2.js');
const finalizer=read('tools/finalize-test-release.cjs');
const ui=read('app/modules/update-ui-clean.v64125.js');
const version=JSON.parse(read('version.json'));

assert.equal(version.version,'V6.4.125');
assert(index.includes('update-ui-clean.v64125.js'),'compact update UI must load');
assert(index.includes('Cập nhật để dùng phiên bản mới nhất. Dữ liệu và bản nháp vẫn được giữ nguyên.'),'update popup copy must stay concise');
assert(ui.includes("later.textContent='ĐỂ SAU'"),'mobile update popup needs short later action');
assert(ui.includes("now.textContent='CẬP NHẬT'"),'mobile update popup needs short update action');
assert(ui.includes("card.style.width='min(88vw,340px)'"),'update popup must stay compact on phone');

assert(detector.includes('new URL("./repair.html",location.href)'),'explicit update must route through repair page');
assert(detector.includes('u.searchParams.set("stage","1")'),'explicit update must start full old-shell cleanup');
assert(repair.includes('navigator.serviceWorker.getRegistrations()'),'repair must unregister old service workers');
assert(repair.includes("n.startsWith('sags-app-shell-')||n.startsWith('sags-app-meta-')"),'repair must delete old app shell/meta caches');
assert(!repair.includes('localStorage.clear('),'repair must preserve business localStorage');
assert(!repair.includes('indexedDB.deleteDatabase('),'repair must preserve IndexedDB/drafts');
assert(repair.includes('Dữ liệu và bản nháp vẫn được giữ nguyên.'),'repair screen must explain preserved data simply');

assert(finalizer.includes("'./repair.html'"),'every release must package repair.html');
assert(finalizer.includes('repair page must be present in every verified release'),'finalizer must hard-fail if repair.html is missing');
console.log('V6.4.125 clean-update/mobile UI guard passed.');
