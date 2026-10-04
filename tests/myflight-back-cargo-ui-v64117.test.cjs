const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('app/modules/fsags208-workspace.v1.js');
const ui=read('app/boot/32-fixed-ui-rule-v64113.js');
const daily=read('app/modules/daily-roster.v502.js');

assert(src.includes('function removeDeprecatedBackControls()'),'deprecated back cleanup missing');
assert(!src.includes('function stableMyFlightBack('),'flashing My Flight back handler must be removed');
assert(!src.includes("b.id='sagsStableMyFlightBack'"),'flashing arrow button must never be recreated');
assert(!src.includes('myFlightBackObserver'),'back-button MutationObserver loop must be removed');
assert(ui.includes('function retireBackNavigation()'),'global back-arrow cleanup missing');
assert(ui.includes('function goMainFromMenu(event)'),'MENU return handler missing');
assert(ui.includes('__SAGS_MENU_RETURN_CAPTURE_V64119__'),'MENU capture guard missing');
assert(ui.includes("'sagsStableMyFlightBack','v644MyFlightBack','sagsContextBackRow'"),
  'all known flashing back controls must be retired');
assert(ui.includes("'v174DataHubClose','v181AdminClose'")&&ui.includes("button.textContent='ĐÓNG'"),
  'legacy secondary back arrows must be normalized to close controls');

assert(src.includes('async function workspaceRows('),'shared FSAGS 208 all-flight source missing');
assert(src.includes('function cargoSharedCard('),'Cargo shared-card adapter missing');
assert(src.includes('__SAGS_DAILY_ROSTER_FINAL_V1199'),'Cargo must reuse the common My Flight renderer');
assert(src.includes('shared.cardHtml(group,date)'),'Cargo must render the exact shared flight-card markup');
assert(src.includes('sagsCargo208QueueTab'),'Cargo queue must use shared My Flight tab geometry');
assert(src.includes('sagsFlightSearch'),'Cargo queue must retain flight-number search');
assert(src.includes("const rows=await workspaceRows(date)"),'Cargo must list all FSAGS 208 flight records, not personal roster only');
assert(src.includes('sagsCargo208TakeBtn'),'Cargo shared card must retain its FSAGS 208 receive/open action');
assert(src.includes("host.querySelectorAll('.v1199DossierBtn')"),'Cargo shared cards must retain common flight dossier action');
assert(src.includes("host.querySelectorAll('.v1199DocChip')"),'Cargo shared cards must retain common document chips');
assert(daily.includes("if(g==='LOADING208'||g==='FSAGS208')return 'FSAGS208'"),'common My Flight renderer must recognize FSAGS 208');
assert(daily.includes("if(g==='FSAGS208')return '208'"),'common My Flight form label must render FSAGS 208 consistently');
assert(daily.includes('/loading208|fsags208/'),'common department label must identify Cargo/Kho hàng');

console.log('V6.4.119 MENU navigation + Cargo shared My Flight UI + focus-stability guard passed.');
