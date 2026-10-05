const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let user={role:'DH',username:'D1',active:true,positionCode:'DOI_TRUONG'},writes=[];
let item={flightId:'F1',assignmentId:'A1',user:'D1',formGroup:'FSAGS423',active:true};
const flight={assignments:{},modules:{}};
const root={__sagsGetSession:()=>({role:user.role,profile:user}),sagsV470Ref:path=>({once:async()=>({val:()=>path.startsWith('roster_manifests')?item:flight}),update:async patch=>writes.push(patch)}),addEventListener:()=>{}};
const c={window:root,document:{readyState:'loading',addEventListener:()=>{}},sessionStorage:{getItem:()=>null},setTimeout:()=>{},console};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../app/modules/flight-governance.v1.js','utf8'),c);
const g=root.sagsFlightGovernance;
(async()=>{
 for(const unit of ['DH','CBTT','CARGO','PVHK'])for(const pos of ['DOI_TRUONG','DOI_PHO','CA_TRUONG','CA_PHO']){
  user={role:{DH:'DH',CBTT:'CBTT',CARGO:'KH',PVHK:'PVHK'}[unit],positionCode:pos,active:true};
  for(const target of ['DH','CBTT','CARGO','PVHK'])assert.equal(g.canManageDepartment(target),target===unit);
 }
 for(const role of ['VIEWER','DH','CBTT','KH','PVHK']){
  user={role,positionCode:role==='VIEWER'?'DOI_TRUONG':'NHAN_VIEN',active:true};
  await assert.rejects(g.setDepartmentStatus('2026-10-03','F1','DH','HOAN_TAT','test reason'),/Chỉ cán bộ/);
 }
 user={role:'AD',active:false};assert.equal(g.canManageDepartment('DH'),false);
 user={role:'AD',active:true};
 item.flightId='F2';await assert.rejects(g.reassignAssignment('2026-10-03','F1','A1','D2','test reason'),/không thuộc chuyến/);
 await assert.rejects(g.reopenAssignment('2026-10-03','F1','A1','test reason'),/không thuộc chuyến/);
 item.flightId='F1';item.active=false;await assert.rejects(g.reopenAssignment('2026-10-03','F1','A1','test reason'),/đã bị hủy/);
 assert.equal(writes.length,0);
 item.active=true;await g.reassignAssignment('2026-10-03','F1','A1','D2','test reason');assert.equal(writes.length,1);
 assert(Object.keys(writes[0]).some(p=>p.includes('/auditTrail/')));
 let calls=[];root.sagsV338OpenDossier=async(...args)=>{calls.push(args);return 'opened'};
 assert.equal(await root.sagsOpenUnifiedFlightDossier('2026-10-03','F1'),'opened');assert.deepEqual(calls,[['2026-10-03','F1']]);
 delete root.sagsV338OpenDossier;await assert.rejects(root.sagsOpenUnifiedFlightDossier('2026-10-03','F1'),/chưa sẵn sàng/);
 console.log('Governance authorization: 16 manager scopes, staff/viewer/inactive denial, wrong-flight rejection, audit and direct dossier delegation passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
