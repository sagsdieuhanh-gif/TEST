const fs=require('fs'),path=require('path'),terser=require('terser');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const build=JSON.parse(read('version.json')).build;
const local=p=>String(p).split('?')[0].replace(/^\.\//,'');
function escRe(s){return s.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')}
async function minifyLegacy(h){
  for(const n of ['05','06','07']){
    const src='app/boot/'+n+'-legacy.js',out='app/generated/legacy-'+n+'.min.js';
    if(!fs.existsSync(path.join(root,src)))continue;
    const min=await terser.minify(read(src),{compress:{passes:2,sequences:false},mangle:false,format:{comments:false,semicolons:true}});
    if(min.error)throw min.error;write(out,(min.code||'')+'\n');
    h=h.replace('./'+src+'?','./'+out+'?');
  }
  return h;
}
function stripLead(s){return s.replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/,'')}
async function bundleIifes(h){
  const re=/<script\b([^>]*)src=["'](\.\/[^"'?]+)(?:\?[^"']*)?["']([^>]*)><\/script>/gi,all=[...h.matchAll(re)];
  const rows=all.map(m=>{const attrs=(m[1]+' '+m[3]).trim(),p=local(m[2]);let code='';try{code=read(p)}catch(_){}const clean=stripLead(code),safe=!/\b(?:id|data-|type|async|defer|nomodule|integrity|crossorigin)\s*=|\b(?:async|defer|nomodule)\b/i.test(attrs)&&/^(?:\(function|\(\s*function|!function|\(\(\)=>|\(\s*\(\)\s*=>)/s.test(clean)&&!code.includes('document.currentScript')&&!/^\s*(?:import|export)\b/m.test(code);return{m,p,code,safe}});
  const groups=[];let cur=[];const flush=()=>{if(cur.length>=2)groups.push(cur);cur=[]};
  for(let i=0;i<rows.length;i++){const x=rows[i],prev=i?rows[i-1]:null,between=prev?h.slice(prev.m.index+prev.m[0].length,x.m.index):'';if(!x.safe||(prev&&between.trim())){flush();continue}const bytes=cur.reduce((n,z)=>n+Buffer.byteLength(z.code),0);if(cur.length&&bytes+Buffer.byteLength(x.code)>480000)flush();cur.push(x)}flush();
  const reps=[];let no=0;
  for(const g of groups){const source=g.map(x=>'// '+x.p+'\n'+x.code).join('\n;\n');no++;const out='app/generated/startup-bundle-'+no+'.js',min=await terser.minify(source,{compress:false,mangle:false,format:{comments:false,semicolons:true}});if(min.error)throw min.error;write(out,(min.code||'')+'\n');reps.push([g[0].m.index,g[g.length-1].m.index+g[g.length-1].m[0].length,'<script src="./'+out+'?v='+build+'"></script>'])}
  for(const [a,b,v] of reps.sort((x,y)=>y[0]-x[0]))h=h.slice(0,a)+v+h.slice(b);
  return{html:h,saved:groups.reduce((n,g)=>n+g.length,0)-groups.length,groups:groups.map(g=>g.map(x=>x.p))};
}
function bundleCss(h){
  const re=/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.\/app\/styles\/boot-[^"'?]+\.css)(?:\?[^"']*)?["'][^>]*>/gi,all=[...h.matchAll(re)];if(all.length<2)return{html:h,saved:0};
  const groups=[];let cur=[];const flush=()=>{if(cur.length>=2)groups.push(cur);cur=[]};
  for(let i=0;i<all.length;i++){const x=all[i],prev=i?all[i-1]:null,between=prev?h.slice(prev.index+prev[0].length,x.index):'';if(prev&&between.trim())flush();cur.push(x)}flush();
  const reps=[];let no=0,saved=0;
  for(const g of groups){
    no++;const css=g.map(m=>'/* '+local(m[1])+' */\n'+read(local(m[1])).replace(/^\s*@charset[^;]+;\s*/i,'')).join('\n'),out='app/generated/legacy-ui-bundle-'+no+'.css';write(out,css);
    const markers=g.map(m=>{const id=(m[0].match(/\bid=["']([^"']+)["']/i)||[])[1];return id?'<style id="'+id+'" data-sags-bundled-style="1"></style>':''}).filter(Boolean).join('');
    reps.push([g[0].index,g[g.length-1].index+g[g.length-1][0].length,'<link rel="stylesheet" href="./'+out+'?v='+build+'">'+markers]);saved+=g.length-1;
  }
  for(const [a,b,v] of reps.sort((x,y)=>y[0]-x[0]))h=h.slice(0,a)+v+h.slice(b);
  return{html:h,saved};
}

function addAttr(tag,name,value){if(new RegExp('\\s'+name+'\\s*=','i').test(tag))return tag;const close=tag.endsWith('/>')?'/>' :'>';return tag.slice(0,-close.length)+' '+name+'="'+value+'"'+close}
function optimizeFormImages(h){
  let count=0;
  h=h.replace(/<img\b[^>]*\bsrc=["'](?:\.\/)?forms\/[^"']+["'][^>]*>/gi,tag=>{
    count++;
    return addAttr(addAttr(addAttr(tag,'loading','lazy'),'decoding','async'),'fetchpriority','low');
  });
  return{html:h,count};
}
function compactRegistry(){
  const p='forms/forms.registry.json',before=read(p),j=JSON.parse(before),after=JSON.stringify(j)+'\n';
  write(p,after);return{before:before.length,after:after.length,saved:before.length-after.length,forms:Array.isArray(j.forms)?j.forms.length:0};
}
function optimizeRegistrySources(){
  const p647='app/modules/form-registry-runtime.v647.js',p6419='app/modules/form-registry-runtime.v6419.js';
  let a=read(p647),b=read(p6419),changed=0;
  const oldApply="async function applyPublishedRegistry(){\n  if(typeof root.sagsV450ApplyLayout!=='function')throw new Error('Form Manager registry runtime is not ready.');\n  await root.sagsV450ApplyLayout();refreshRegistry();\n  if(!registry?.forms?.length)throw new Error('forms.registry.json is not loaded.');\n  return registry;\n}\n";
  const newApply="let registryApplyJob=null,lastRegistryApplyAt=0;\nasync function applyPublishedRegistry(force=false){\n  if(!force&&registry?.forms?.length&&Date.now()-lastRegistryApplyAt<2500)return registry;\n  if(registryApplyJob)return registryApplyJob;\n  registryApplyJob=(async()=>{\n    if(typeof root.sagsV450ApplyLayout!=='function')throw new Error('Form Manager registry runtime is not ready.');\n    await root.sagsV450ApplyLayout();refreshRegistry();\n    if(!registry?.forms?.length)throw new Error('forms.registry.json is not loaded.');\n    lastRegistryApplyAt=Date.now();return registry;\n  })().finally(()=>{registryApplyJob=null});\n  return registryApplyJob;\n}\n";
  if(a.includes(oldApply)){a=a.replace(oldApply,newApply);changed++}
  const oldObs="const uiObserver=new MutationObserver(()=>{ensureQuickNA();if(registry){if(!drawWrapped)wrapDraw();if(!G('openExportChoiceMenu')?.__sagsRegistryUnifiedV647)wrapExportChoice();if(root.sags5494ExportCurrentPdf!==root.sagsRegistryExport5494)root.sags5494ExportCurrentPdf=root.sagsRegistryExport5494;queuePaint()}});";
  const newObs="let uiMaintainQueued=false;const uiObserver=new MutationObserver(()=>{if(document.hidden||uiMaintainQueued)return;uiMaintainQueued=true;requestAnimationFrame(()=>{uiMaintainQueued=false;ensureQuickNA();if(registry){if(!drawWrapped)wrapDraw();if(!G('openExportChoiceMenu')?.__sagsRegistryUnifiedV647)wrapExportChoice();if(root.sags5494ExportCurrentPdf!==root.sagsRegistryExport5494)root.sags5494ExportCurrentPdf=root.sagsRegistryExport5494;queuePaint()}})});";
  if(a.includes(oldObs)){a=a.replace(oldObs,newObs);changed++}
  const oldPre="function prewarmFastExport(){const id=formId(),pageNo=id==='fsags54'?16:id==='fsags94'?17:0;if(!pageNo)return;setTimeout(()=>{strictVerifyCached().catch(e=>console.info('V6.4.19 PDF prewarm',S(e?.message||e)));const img=document.getElementById('page'+pageNo)?.querySelector(':scope > img');if(img)pageImageReady(img).then(()=>pageBitmap(img)).catch(()=>{})},220)}";
  const newPre="function prewarmFastExport(){const id=formId(),pageNo=id==='fsags54'?16:id==='fsags94'?17:0;if(!pageNo)return;const run=()=>{strictVerifyCached().catch(e=>console.info('V6.4.19 PDF prewarm',S(e?.message||e)));const img=document.getElementById('page'+pageNo)?.querySelector(':scope > img');if(img)pageImageReady(img).then(()=>pageBitmap(img)).catch(()=>{})};if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(run,{timeout:1400});else setTimeout(run,650)}";
  if(b.includes(oldPre)){b=b.replace(oldPre,newPre);changed++}
  const oldMaintain="let maintainQueued=false;const mo=new MutationObserver(()=>{if(maintainQueued)return;maintainQueued=true;requestAnimationFrame(()=>{maintainQueued=false;patchExportOpeners();patchCleanOpenSignature();patchCleanSignaturePad();installSignaturePointerGuard();if(!root.v324ConfirmRosterHandover?.__sagsV6419Home)patchCompleteToHome();sanitizeSignatureScope();syncLiveSignatureUi();centerExport()})});\nif(document.documentElement)mo.observe(document.documentElement,{subtree:true,childList:true});\nroot.visualViewport?.addEventListener('resize',centerExport,{passive:true});root.visualViewport?.addEventListener('scroll',centerExport,{passive:true});root.addEventListener('resize',centerExport,{passive:true});";
  const newMaintain="function exportUiOpen(){return ['exportChoiceModal','exportModal','sagsV6419SignModal'].some(id=>{const e=document.getElementById(id);if(!e)return false;const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'})}\nfunction relatedUiNode(n){if(!n||n.nodeType!==1)return false;const sel='#exportChoiceModal,#exportModal,#sagsV6419SignModal,.sagsV6419SignBtn,[id*=signature],[id^=page]';return n.matches?.(sel)||!!n.querySelector?.(sel)}\nfunction maintainRuntime(){patchExportOpeners();patchCleanOpenSignature();patchCleanSignaturePad();installSignaturePointerGuard();if(!root.v324ConfirmRosterHandover?.__sagsV6419Home)patchCompleteToHome();sanitizeSignatureScope();syncLiveSignatureUi();centerExport()}\nlet maintainQueued=false,maintainTimer=0,lastMaintainAt=0;const mo=new MutationObserver(records=>{if(document.hidden||maintainQueued)return;let relevant=exportUiOpen();if(!relevant){outer:for(const r of records){for(const n of [...Array.from(r.addedNodes||[]),...Array.from(r.removedNodes||[])])if(relatedUiNode(n)){relevant=true;break outer}}}if(!relevant)return;maintainQueued=true;const wait=Math.max(0,90-(Date.now()-lastMaintainAt));clearTimeout(maintainTimer);maintainTimer=setTimeout(()=>requestAnimationFrame(()=>{maintainQueued=false;lastMaintainAt=Date.now();maintainRuntime()}),wait)});\nif(document.documentElement)mo.observe(document.documentElement,{subtree:true,childList:true});\nconst centerExportIfOpen=()=>{if(exportUiOpen())centerExport()};root.visualViewport?.addEventListener('resize',centerExportIfOpen,{passive:true});root.visualViewport?.addEventListener('scroll',centerExportIfOpen,{passive:true});root.addEventListener('resize',centerExportIfOpen,{passive:true});";
  if(b.includes(oldMaintain)){b=b.replace(oldMaintain,newMaintain);changed++}
  write(p647,a);write(p6419,b);return{changed};
}
function optimizeLegacyTimers(){
  const p='app/boot/06-legacy.js';let s=read(p),changed=0;
  const reps=[
    ["function ensureFinalPopupLayout(){try{","function ensureFinalPopupLayout(){if(document.hidden)return;try{"],
    ["setInterval(ensureFinalPopupLayout,1800);","setInterval(ensureFinalPopupLayout,5000);"],
    ["setInterval(()=>{try{if(activeFormGroup===\"bbbt\")refreshBBBTCxrNoDisplay()}catch(e){}},800);","setInterval(()=>{try{if(!document.hidden&&activeFormGroup===\"bbbt\")refreshBBBTCxrNoDisplay()}catch(e){}},2000);"],
    ["},500);setInterval(()=>{if(currentUserProfile?.username)verifyPersonalSession()},15*60*1e3);","},1200);setInterval(()=>{if(currentUserProfile?.username)verifyPersonalSession()},15*60*1e3);"]
  ];
  for(const [a,b] of reps)if(s.includes(a)){s=s.replace(a,b);changed++}
  write(p,s);return{changed};
}
function injectRuntimePerformance(h){
  if(h.includes('id="sags-runtime-performance-v64131"'))return h;
  const marker='<script src="./app/generated/runtime-4.js';
  const i=h.indexOf(marker);if(i<0)throw Error('runtime-4 marker missing');
  const js=[
    '<script id="sags-runtime-performance-v64131">',
    '(()=>{"use strict";if(window.__SAGS_RUNTIME_PERF_V64131)return;window.__SAGS_RUNTIME_PERF_V64131=true;',
    'const nativeFetch=window.fetch.bind(window),TTL=2200;let regJob=null,regCopy=null,regAt=0;',
    'function isRegistry(input,init){try{const method=String(init?.method||(typeof input==="object"&&input?.method)||"GET").toUpperCase();if(method!=="GET")return false;const raw=typeof input==="string"?input:input?.url;if(!raw)return false;const u=new URL(raw,location.href);return u.origin===location.origin&&/\\/forms\\/forms\\.registry\\.json$/.test(u.pathname)&&!u.searchParams.has("__sags_strict")}catch(_){return false}}',
    'window.fetch=function(input,init){if(!isRegistry(input,init))return nativeFetch(input,init);const now=Date.now();if(regCopy&&now-regAt<TTL)return Promise.resolve(regCopy.clone());if(regJob)return regJob.then(r=>r.clone());regJob=nativeFetch(input,init).then(r=>{if(r?.ok){regCopy=r.clone();regAt=Date.now()}return r}).finally(()=>{regJob=null});return regJob.then(r=>r.clone())};',
    'function patchLayout(){const base=window.sagsV450ApplyLayout;if(typeof base!=="function"||base.__sagsPerfV64131)return false;let job=null,lastAt=0,lastValue;const w=async function(){if(job)return job;if(Date.now()-lastAt<TTL&&lastValue!==undefined)return lastValue;job=Promise.resolve(base.apply(this,arguments)).then(v=>{lastAt=Date.now();lastValue=v;return v}).finally(()=>{job=null});return job};w.__sagsPerfV64131=true;w.__sagsPerfBase=base;window.sagsV450ApplyLayout=w;return true}',
    'function patchRoster(){const e=window.__SAGS_DAILY_ROSTER_FINAL_V1199,base=e?.renderPersonal;if(typeof base!=="function"||base.__sagsPerfV64131)return false;let job=null,key="";const w=function(d){const k=String(d||"");if(job&&k===key)return job;key=k;job=Promise.resolve(base.apply(this,arguments)).finally(()=>{job=null});return job};w.__sagsPerfV64131=true;w.__sagsPerfBase=base;e.renderPersonal=w;return true}',
    'let tries=0;function install(){patchLayout();patchRoster();if(++tries<8)setTimeout(install,tries<3?80:350)}patchRoster();setTimeout(install,0);window.addEventListener("pageshow",()=>setTimeout(install,40),{passive:true});',
    '})();',
    '</script>\n'
  ].join('');
  return h.slice(0,i)+js+h.slice(i);
}
function optimizeServiceWorker(){
  let s=read('service-worker.js'),changed=0;
  if(!s.includes('function sagsFormRegistryFetch(')){
    const marker="self.addEventListener('fetch',event=>{";
    const helper="let sagsFormRegistryJob=null;function sagsFormRegistryFetch(req){if(sagsFormRegistryJob)return sagsFormRegistryJob.then(r=>r.clone());sagsFormRegistryJob=fetch(req,{cache:'no-store'}).then(r=>r.ok?r:new Response('FORM REGISTRY UNAVAILABLE',{status:r.status})).catch(()=>new Response('FORM REGISTRY UNAVAILABLE',{status:503})).finally(()=>{sagsFormRegistryJob=null});return sagsFormRegistryJob.then(r=>r.clone())}\n";
    if(!s.includes(marker))throw Error('service worker fetch marker missing');s=s.replace(marker,helper+marker);changed++;
  }
  const old="if(path==='./forms/forms.registry.json'){event.respondWith(fetch(req,{cache:'no-store'}).then(r=>r.ok?r:new Response('FORM REGISTRY UNAVAILABLE',{status:r.status})).catch(()=>new Response('FORM REGISTRY UNAVAILABLE',{status:503})));return}";
  const neu="if(path==='./forms/forms.registry.json'){event.respondWith(sagsFormRegistryFetch(req));return}";
  if(s.includes(old)){s=s.replace(old,neu);changed++}
  write('service-worker.js',s);return{changed};
}

(async()=>{
  const registryStats=compactRegistry(),sourceStats=optimizeRegistrySources(),timerStats=optimizeLegacyTimers(),swStats=optimizeServiceWorker();
  for(const f of fs.readdirSync(path.join(root,'app/generated')))if(/^legacy-0[567]\.min\.js$/.test(f))fs.rmSync(path.join(root,'app/generated',f));
  let h=read('index.html'),alreadyOptimized=h.includes('./app/generated/startup-bundle-');
  const imageStats=optimizeFormImages(h);h=injectRuntimePerformance(imageStats.html);
  h=await minifyLegacy(h);
  let j={html:h,saved:0,groups:[]},c={html:h,saved:0};
  if(!alreadyOptimized){j=await bundleIifes(h);h=j.html;c=bundleCss(h);h=c.html;}
  write('index.html',h);
  const scripts=[...h.matchAll(/<script\b[^>]*src=["'](\.\/[^"'?]+)[^"']*["']/g)].map(m=>m[1]),styles=[...h.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.\/[^"'?]+)[^"']*["']/g)].map(m=>m[1]);
  const bytes=scripts.reduce((n,p)=>n+fs.statSync(path.join(root,local(p))).size,0);
  console.log(JSON.stringify({scriptCount:scripts.length,stylesheetCount:styles.length,startupJsBytes:bytes,scriptRequestsSaved:j.saved,cssRequestsSaved:c.saved,bundles:j.groups,registry:registryStats,formImages:imageStats.count,registrySourceChanges:sourceStats.changed,legacyTimerChanges:timerStats.changed,serviceWorkerChanges:swStats.changed},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
