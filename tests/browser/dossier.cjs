const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const roster=read('app/modules/daily-roster.v502.js');
// Execute production rendering and click handlers, with deterministic Firebase data.
const rendering=roster.slice(roster.indexOf('async function openFlightDossier('),roster.indexOf('const openingTasks=new Set();'));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.SAGS_BROWSER_EXECUTABLE?{executablePath:process.env.SAGS_BROWSER_EXECUTABLE,args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]}:{channel:process.env.SAGS_BROWSER_CHANNEL||"chromium"})});
 try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 for(const role of ['DH','CBTT','KH','PVHK','VIEWER','AD']){
 const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://test.local/**',r=>r.fulfill({contentType:'text/html',body:'<div id="fwcList"></div>'}));await page.goto('http://test.local/');
 await page.evaluate(role=>{
  window.testRole=role;window.currentRole=role;window.currentUserProfile={username:'TEST1',role,active:true};window.__sagsGetSession=()=>({role:window.testRole,profile:window.currentUserProfile});
  window.sagsV470Ref=()=>({once:async()=>{await new Promise(r=>setTimeout(r,160));return{val:()=>({flightId:'F1',flightName:'QH123',modules:{}})}}});
  window.alert=message=>{window.lastAlert=message};window.flightWorkspaceOpenList=()=>{throw Error('Unexpected workspace routing')};window.flightWorkspaceOpenFlight=()=>{throw Error('Unexpected workspace routing')};
  window.sagsPersonalFlightTasks={renderInto:async host=>{host.textContent='TEST1 · nhiệm vụ F1'}};
 },role);
 await page.addScriptTag({content:read('app/modules/fsags208-workspace.v1.js')});
 await page.addScriptTag({content:read('app/modules/flight-governance.v1.js')});
 await page.addScriptTag({content:`const root=window,S=v=>String(v??''),role=()=>testRole,me=()=>currentUserProfile.username;let renderToken=0,activeTab='pending';const opDate=()=> '2026-10-03',syncQueueDate=x=>x,queueDate=x=>x,installStyle=()=>{},setHeader=()=>{},esc=S;const personalGroups=async()=>({dd:{dupes:[]},groups:[{key:'F1',flightClosed:false}]});const cardHtml=()=>'<button class="v1199DossierBtn" data-dossier-date="2026-10-03" data-dossier-fid="F1">HỒ SƠ CHUYẾN</button>';${rendering}`});
 // AD uses the common dossier entrypoint; personal queues intentionally omit AD.
 if(role==='KH'){await page.evaluate(()=>{document.getElementById('fwcList').textContent='Cargo all flights';return renderPersonal('2026-10-03')});assert.equal(await page.locator('#fwcList').textContent(),'Cargo all flights');}
 if(['AD','KH'].includes(role))await page.evaluate(()=>{document.getElementById('fwcList').innerHTML='<button id="adDossier">HỒ SƠ CHUYẾN</button>';document.getElementById('adDossier').onclick=()=>sagsOpenUnifiedFlightDossier('2026-10-03','F1')});
 else await page.evaluate(()=>renderPersonal('2026-10-03'));
 const btn=page.getByRole('button',{name:'HỒ SƠ CHUYẾN',exact:true});await btn.click();
 const modal=page.locator('#sagsFlightDossierModal');await modal.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#sagsDossierFlight')?.textContent.includes('QH123'));
 assert((await modal.textContent()).includes('NHIỆM VỤ CỦA TÔI'));
 await page.locator('#sagsDossierClose').click();await modal.waitFor({state:'hidden'});
 await btn.click();await modal.waitFor({state:'visible'});await page.locator('#sagsDossierClose').click();
 if(!['AD','KH'].includes(role)){
  await page.evaluate(()=>{delete window.sagsOpenUnifiedFlightDossier;delete window.sagsV338OpenDossier});await btn.click();
  assert.match(await page.evaluate(()=>window.lastAlert),/chưa sẵn sàng/);assert.equal(await btn.isEnabled(),true);
 }
 assert.deepEqual(errors,[]);await page.close();
 }
 }
 console.log('Browser dossier: 12 role/viewport cases, real DOM click, delayed reads, close/reopen, visible failure and button recovery passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
