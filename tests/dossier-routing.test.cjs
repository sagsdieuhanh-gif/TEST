const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const rootDir=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(rootDir,p),'utf8');

const gov=read('app/modules/flight-governance.v1.js');
const ga=gov.indexOf('function openUnifiedDossier('),gb=gov.indexOf('function install()',ga);
assert(ga>=0&&gb>ga,'openUnifiedDossier must exist');
const govFn=gov.slice(ga,gb);
assert(govFn.includes("typeof root.sagsV338OpenDossier==='function'"),'governance must prefer canonical dossier modal');
assert(!govFn.includes('setTimeout'),'dossier routing must not use a fixed timer');

(async()=>{
  const direct=[],lists=[],flights=[],alerts=[];
  const g={Promise,S:v=>String(v??'').trim(),currentDate:()=> '2026-10-03',root:{
    alert:m=>alerts.push(String(m)),
    sagsV338OpenDossier:(date,fid)=>{direct.push([date,fid]);return 'DIRECT'},
    flightWorkspaceOpenList:date=>{lists.push(date);return true},
    flightWorkspaceOpenFlight:fid=>flights.push(fid)
  }};
  vm.createContext(g);vm.runInContext(govFn,g);
  assert.equal(g.openUnifiedDossier('2026-10-03','F1'),'DIRECT');
  assert.deepEqual(direct,[['2026-10-03','F1']]);
  assert.deepEqual(lists,[],'canonical dossier must not reopen My Flight first');
  assert.deepEqual(flights,[],'canonical dossier must not jump to workspace');

  delete g.root.sagsV338OpenDossier;
  const fallback=g.openUnifiedDossier('2026-10-03','F2');
  await Promise.resolve(fallback);await Promise.resolve();
  assert.deepEqual(lists,['2026-10-03']);
  assert.deepEqual(flights,['F2'],'workspace is only a fallback when dossier module is unavailable');

  const roster=read('app/modules/daily-roster.v502.js');
  const qa=roster.indexOf('async function openQueueDossier('),qb=roster.indexOf('function bindDossierTasks(',qa);
  assert(qa>=0&&qb>qa,'openQueueDossier must exist');
  assert(roster.includes("btn.onclick=()=>openQueueDossier(btn.dataset.dossierDate,btn.dataset.dossierFid,btn)"),'My Flight dossier button must use guarded canonical opener');
  const qAlerts=[];const q={Promise,S:v=>String(v??'').trim(),console,alert:m=>qAlerts.push(String(m)),root:{}};
  vm.createContext(q);vm.runInContext(roster.slice(qa,qb),q);
  let calls=[];q.root.sagsV338OpenDossier=async(d,f)=>{calls.push(['direct',d,f]);return true};
  q.root.sagsOpenUnifiedFlightDossier=async(d,f)=>{calls.push(['wrapper',d,f]);return true};
  const button={isConnected:true,disabled:false};
  assert.equal(await q.openQueueDossier('2026-10-03','F3',button),true);
  assert.deepEqual(calls,[['direct','2026-10-03','F3']],'My Flight must prefer direct dossier modal even when governance wrapper exists');
  assert.equal(button.disabled,false);

  delete q.root.sagsV338OpenDossier;calls=[];
  assert.equal(await q.openQueueDossier('2026-10-03','F4'),true);
  assert.deepEqual(calls,[['wrapper','2026-10-03','F4']]);

  delete q.root.sagsOpenUnifiedFlightDossier;
  assert.equal(await q.openQueueDossier('2026-10-03','F5'),false);
  assert(qAlerts.some(x=>x.includes('HỒ SƠ CHUYẾN')),'missing dossier runtime must be visible to user');

  const perms=read('app/boot/13-v485FeaturePermissions.js');
  assert(perms.includes('const V485_FEATURE_KEYS=Object.keys(SAGS_FEATURES_V485);'),'FSAGS09 must be editable by AD like other feature permissions');
  assert(!perms.includes('filter(k=>k!=="FSAGS09")'),'FSAGS09 must not be silently excluded from permission editor');

  console.log('Dossier routing + permission regression passed: direct modal, no timer race, visible fallback errors, FSAGS09 editable');
})().catch(e=>{console.error(e);process.exitCode=1});
