const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),v=JSON.parse(read('version.json'));
const patch=Number(String(v.version||'').split('.').pop())||0;
if(patch<131){console.log('V6.4.131 full performance guard pending release.');process.exit(0)}
const h=read('index.html'),registry=read('forms/forms.registry.json'),r647=read('app/modules/form-registry-runtime.v647.js'),r6419=read('app/modules/form-registry-runtime.v6419.js'),sw=read('service-worker.js'),legacy=read('app/boot/06-legacy.js');
assert(h.includes('id="sags-runtime-performance-v64131"'),'runtime performance coalescer missing');
const formImgs=[...h.matchAll(/<img\b[^>]*\bsrc=["'](?:\.\/)?forms\/[^"']+["'][^>]*>/gi)].map(m=>m[0]);
assert(formImgs.length>=10,'form images not found');
assert(formImgs.every(t=>/loading=["']lazy["']/i.test(t)&&/decoding=["']async["']/i.test(t)&&/fetchpriority=["']low["']/i.test(t)),'all form images must be lazy/async/low priority');
assert(registry.length<650000,'forms.registry.json should be compact, got '+registry.length);
assert.doesNotThrow(()=>JSON.parse(registry));
assert(r647.includes('registryApplyJob'),'registry apply single-flight missing');
assert(r647.includes('uiMaintainQueued'),'registry UI observer coalescing missing');
assert(r6419.includes('requestIdleCallback'),'PDF prewarm must move off critical path');
assert(r6419.includes('relatedUiNode'),'signature/export observer must be relevance-scoped');
assert(sw.includes('function sagsFormRegistryFetch('),'service-worker registry single-flight missing');
assert(sw.includes("event.respondWith(sagsFormRegistryFetch(req))"),'service-worker registry route not coalesced');
assert(legacy.includes('setInterval(ensureFinalPopupLayout,5000)'),'legacy popup polling not reduced');
console.log('V6.4.131 full performance guard passed.');
