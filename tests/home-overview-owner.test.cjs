const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app/modules/daily-roster.v502.js'),'utf8');
const start=source.indexOf('root.__SAGS_DAILY_ROSTER_FINAL_V1199.readOverview=');
const end=source.indexOf('\n};',start)+3;
let owner='alice';let calls=0;
const rows=[{assignmentId:'a',user:'alice',active:true},{assignmentId:'b',user:'bob',active:true},{assignmentId:'c',targetUser:'alice',active:false},{assignmentId:'d',targetUser:'alice',formGroup:'forbidden'},{assignmentId:'e',user:'alice',formGroup:'done'}];
const ctx={root:{__SAGS_DAILY_ROSTER_FINAL_V1199:{},sagsAirlineFormPolicy:{ready:async()=>{},allowed:(_,g)=>g!=='forbidden'}},me:()=>owner,readManifest:async date=>{assert.equal(date,'2026-10-05');calls++;return {items:rows}},norm:s=>String(s||'').toLowerCase(),dedupeItems:(_,items)=>({items}),readState:async id=>({id}),itemCompleted:x=>x.formGroup==='done',groupTasks:x=>x};
vm.runInNewContext(source.slice(start,end),ctx);
(async()=>{
 const result=await ctx.root.__SAGS_DAILY_ROSTER_FINAL_V1199.readOverview('2026-10-05');
 assert.equal(result.groups.map(x=>x.item.assignmentId).join(','),'a,e');
 assert.equal(result.groups[0].st.id,'a');
 owner='';assert.equal((await ctx.root.__SAGS_DAILY_ROSTER_FINAL_V1199.readOverview('2026-10-05')).groups.length,0);assert.equal(calls,1);
 owner='alice';ctx.readState=async()=>{owner='bob';return {}};
 await assert.rejects(ctx.root.__SAGS_DAILY_ROSTER_FINAL_V1199.readOverview('2026-10-05'),/Account changed/);
 console.log('Home overview owner isolation passed');
})().catch(e=>{console.error(e);process.exitCode=1});
