const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const runtimeSrc=read('app/core/runtime.v503hf2.bundle.js');
const runtimeGen=read('app/generated/runtime-1.js');
const roster=read('app/modules/daily-roster.v502.js');
const css=read('app/styles/fixed-ui-rule-v64113.css');

assert(html.includes('id="sagsCompatibilityToolbar"'),'compatibility toolbar anchor must exist');
assert(!html.includes('id="roleBtnQuickTime"'),'legacy Quick Entry button must stay removed from index');
assert(!html.includes('id="roleBtnExport"'),'legacy Export button must stay removed from index');
assert(css.includes('#sagsCompatibilityToolbar#sagsCompatibilityToolbar'),'compatibility anchor must stay off-screen');
assert(!html.includes('id="roleBtnFlights"'),'legacy CHUYẾN toolbar button must stay removed from index');

for(const [name,src] of [['runtime source',runtimeSrc],['generated runtime',runtimeGen]]){
  assert(!src.includes('id="v163FlightBtn"'),' '+name+' must not create CHUYẾN operation button');
  assert(!src.includes('$("v163FlightBtn").onclick'),' '+name+' must not bind CHUYẾN operation button');
  assert(src.includes('id="v163HomeBtn"'),' '+name+' must retain CÔNG VIỆC control');
  assert(src.includes('id="v163SignBtn"'),' '+name+' must retain KÝ control for the form dock');
}
assert(roster.includes("const confirmTitle=completed?'MỞ BIỂU MẪU ĐÃ HOÀN TẤT?':'MỞ BIỂU MẪU?'"),'direct My Flight opening must ask for confirmation');
assert(roster.includes('Bấm OK để tiếp tục.'),'confirmation copy must be explicit');
assert(read('app/boot/32-fixed-ui-rule-v64113.js').includes("const row=$('v324FormActions'),sign=$('v163SignBtn')"),'fixed UI must retain form dock reconciliation');
assert(read('app/modules/workflow-cleanup.v6444.js').includes("const actions=$('v324FormActions'),operation=$('v163OperationNav')"),'workflow cleanup must retain measured mobile form dock');
console.log('V6.4.127 form dock / no-CHUYẾN / confirm-open guard passed.');
