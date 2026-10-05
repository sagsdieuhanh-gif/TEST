const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('app/modules/fsags208-workspace.v1.js');

assert(src.includes('function stableMyFlightBack(ev)'),'stable My Flight back handler missing');
assert(src.includes("b.id='sagsStableMyFlightBack'"),'native My Flight back control missing');
assert(src.includes("sessionStorage.getItem('sagsUiBackStackV183')"),'back handler must preserve admin/datahub return stack');
assert(src.includes("else{try{root.sagsUiClearBackStack?.()}catch(_){}try{root.sagsV479GoHome?.()}catch(_){}}"),
  'empty My Flight back stack must go HOME, not reopen My Flight');
assert(src.includes("document.getElementById('sagsContextBackRow')?.remove()"),
  'native back must replace the mutation-driven context back row');
assert(src.includes('myFlightBackBusy'),'back action must be re-entry guarded');
assert(src.includes('document.activeElement?.blur?.()'),'hidden focused button must release focus before close');

assert(src.includes('async function workspaceRows('),'shared FSAGS 208 flight rows helper missing');
assert(src.includes('function renderCargoMyFlight('),'Cargo unified My Flight renderer missing');
assert(src.includes('class="v1199Card sagsCargo208Card"'),'Cargo flights must use the same v1199 card language');
assert(src.includes('class="v1199TaskBtn '),'Cargo FSAGS 208 actions must use the same task-tile button language');
assert(src.includes("title.textContent='✈ MY FLIGHT'"),'Cargo header must use the shared My Flight shell');
assert(src.includes("sub.textContent='FSAGS 208 · Kho hàng'"),'Cargo role context must stay explicit');
assert(src.includes('__sagsCargoUnifiedV64117'),'Cargo My Flight entry wrapper must be installed independently of login timing');
assert(src.includes('if(cargoRole())return renderCargoMyFlight'),'Cargo My Flight entry must route KH/Cargo to the unified renderer');
assert(src.includes("if(!modal&&typeof cargoOpenBase==='function')"),'Cargo renderer must initialize the shared Flight Workspace shell on first open');
assert(src.includes('listRows:workspaceRows'),'shared FSAGS 208 rows must be exported for regression/diagnostics');

console.log('V6.4.117 My Flight back + Cargo unified UI guard passed.');
