const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('app/modules/fsags208-workspace.v1.js');
const runtime=read('app/generated/runtime-1.js');
const cargo=read('app/modules/cargo-all-flights.v1.js');

assert(src.includes('function removeDeprecatedBackControls()'),'back-control cleanup missing');
assert(!src.includes('function stableMyFlightBack(ev)'),'deprecated flashing back handler must be removed');
assert(!src.includes('new MutationObserver(()=>ensureStableMyFlightBack())'),'back-button mutation observer must be removed');
assert(runtime.includes('head.querySelector("#v644MyFlightBack")?.remove()'),'runtime must remove legacy My Flight back arrow');
assert(runtime.includes('close.textContent="☰ MENU"'),'MENU must remain the navigation control');
assert(!runtime.includes('title.textContent="📦 DANH SÁCH CHUYẾN BAY"'),'Cargo must not get a separate runtime header');

assert(src.includes('async function workspaceRows('),'shared FSAGS 208 flight rows helper missing');
assert(src.includes('function cargoSharedCard('),'Cargo shared-card renderer missing');
assert(src.includes('shared.cardHtml(group,date)'),'Cargo must use exact Daily Roster card renderer');
assert(src.includes("title.textContent='✈ MY FLIGHT'"),'Cargo header must be MY FLIGHT');
assert(src.includes('CHUYẾN ĐÃ HOÀN TẤT'),'Cargo tabs must match operational My Flight copy');
assert(src.includes('v1199DirectTask,.v1199TaskBtn'),'Cargo shared task tile must be rebound to FSAGS 208 receive/open');
assert(src.includes('__sagsCargoUnifiedV64127'),'Cargo entry wrapper must use the new unified renderer');
assert(src.includes('listRows:workspaceRows'),'shared FSAGS 208 rows must stay exported');
assert(!cargo.includes('Tất cả chuyến bay'),'Cargo menu must not use a separate visual label');
assert(!cargo.includes('DANH SÁCH CHUYẾN BAY'),'Cargo header must not use a separate visual shell');

console.log('V6.4.127 MENU-only + exact shared Cargo MY FLIGHT UI guard passed.');
