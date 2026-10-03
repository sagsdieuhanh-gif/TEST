const fs=require('fs'),vm=require('vm'),acorn=require('acorn'),assert=require('assert/strict');
const src=fs.readFileSync(__dirname+'/../app/core/app.v503.js','utf8');let slim;
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id.name==='readSlimState')slim=src.slice(n.start,n.end);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}walk(acorn.parse(src,{ecmaVersion:'latest'}));assert(slim);
let currentRole='VIEWER',active=true,writes=0;
const c={S:v=>String(v??''),safe:v=>v,role:()=>currentRole,profile:()=>({active}),Date,Promise,dbref:path=>({once:async()=>({val:()=>path.endsWith('/statusSummary')?null:'IN_PROGRESS'}),set:async()=>{writes++}})};vm.createContext(c);vm.runInContext(slim,c);
(async()=>{await c.readSlimState('A1');assert.equal(writes,0);currentRole='DH';active=false;await c.readSlimState('A1');assert.equal(writes,0);active=true;await c.readSlimState('A1');assert.equal(writes,1);console.log('Workspace summary: viewer/inactive read without writes; active worker cache writes preserved.');})().catch(e=>{console.error(e);process.exitCode=1});
