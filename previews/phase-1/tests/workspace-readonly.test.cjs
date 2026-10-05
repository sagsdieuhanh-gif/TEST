const fs=require('fs'),vm=require('vm'),acorn=require('acorn'),assert=require('assert/strict');
const src=fs.readFileSync(__dirname+'/../app/modules/daily-roster.v502.js','utf8');let read,fields,pump,statusLeaf;
function walk(n){
 if(!n||typeof n!=='object')return;
 if(n.type==='FunctionDeclaration'&&n.id.name==='readState')read=src.slice(n.start,n.end);
 if(n.type==='FunctionDeclaration'&&n.id.name==='pumpStatusReads')pump=src.slice(n.start,n.end);
 if(n.type==='FunctionDeclaration'&&n.id.name==='statusLeaf')statusLeaf=src.slice(n.start,n.end);
 if(n.type==='VariableDeclarator'&&n.id.name==='QUEUE_STATUS_FIELDS')fields=src.slice(n.init.start,n.init.end);
 for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);
}
walk(acorn.parse(src,{ecmaVersion:'latest'}));assert(read&&fields&&pump&&statusLeaf);
let writes=0,reads=[];const c={S:v=>String(v??''),safe:v=>v,me:()=> 'VIEWER',Date,Promise,Map,db:p=>({once:async()=>{reads.push(p);return {val:()=>p.endsWith('/claimStatus')?'CLAIMED':null}},set:async()=>{writes++},update:async()=>{writes++}})};
vm.createContext(c);
vm.runInContext('const queueStatusCache=new Map(),statusReadQueue=[];let statusReadActive=0;const MAX_STATUS_READS=16,QUEUE_STATUS_FIELDS='+fields+';'+pump+';'+statusLeaf+';'+read,c);
(async()=>{
 assert.equal((await c.readState('A1')).claimStatus,'CLAIMED');assert.equal(writes,0);
 assert(reads.every(p=>p.split('/').length===3&&!p.includes('envelope')));
 const count=reads.length;assert(count<=16,'queue must request only bounded compact status leaves');
 await c.readState('A1');assert.equal(reads.length,count);
 await c.readState('A1',true);assert.equal(reads.length,count*2);
 console.log('Workspace queue reads only bounded status leaves, performs zero writes and caches safely.');
})().catch(e=>{console.error(e);process.exitCode=1});
