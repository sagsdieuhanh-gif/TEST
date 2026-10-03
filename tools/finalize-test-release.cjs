const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s),exists=p=>fs.existsSync(path.join(root,p));
const VERSION='V6.4.84',BUILD='V6.4.84-20261003-TEST-MYFLIGHT-AUDIT-01',LABEL='V6.4.84 - TEST MY FLIGHT + DOSSIER AUDIT FIX',RELEASED='2026-10-03T09:20:00Z';
const old=JSON.parse(read('version.json')),oldV=String(old.version||''),oldB=String(old.build||'');
if(!oldV||!oldB)throw Error('Current version metadata missing');
let index=read('index.html').split(oldB).join(BUILD).split(oldV).join(VERSION);
assert(index.includes('name="sags-release-build" content="'+BUILD+'"'));assert(index.includes('name="sags-release-version" content="'+VERSION+'"'));
write('index.html',index);
const version={version:VERSION,displayVersion:VERSION,label:LABEL,build:BUILD,releasedAt:RELEASED,type:'feature',base:oldB,updatePolicy:'required',notes:'TEST audit fix: My Flight opens the canonical flight dossier directly with no fixed-timer race; governance delegates to the dossier modal; visible error handling replaces silent no-op clicks; FSAGS09 is manageable in per-account feature permissions; regression gate covers dossier routing; node_modules is no longer tracked; PWA/update metadata is bumped so mobile receives the repaired build.',message:VERSION+': TEST My Flight dossier + permission + regression repair.'};
write('version.json',JSON.stringify(version,null,2)+'\n');
let sw=read('service-worker.js').split(oldB).join(BUILD).split(oldV).join(VERSION);
sw=sw.replace(/sags-app-shell-v\d+-[a-z0-9-]+/g,'sags-app-shell-v684-test-myflight-audit-01').replace(/sags-app-meta-v\d+-[a-z0-9-]+/g,'sags-app-meta-v684-test-myflight-audit-01');
const scripts=[...index.matchAll(/<script\b[^>]*src=["'](\.\/[^"'?]+)[^"']*["'][^>]*>/g)].map(m=>m[1]);
const styles=[...index.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.\/[^"'?]+)[^"']*["'][^>]*>/g)].map(m=>m[1]);
const uniq=a=>[...new Set(a)],bootstrap=uniq(['./index.html',...scripts,...styles,'./service-worker.js','./version.json','./data/airline-form-catalog.json','./app/modules/stability.v6-core.js','./app/modules/mobile-draft-recovery.v1.js','./app/modules/indexeddb-flight-store.v1.js']);
sw=sw.replace(/const SAGS_BOOTSTRAP=\[[^\n]*\];/,'const SAGS_BOOTSTRAP='+JSON.stringify(bootstrap)+';');
assert(sw.includes("const BUILD='"+BUILD+"'"));write('service-worker.js',sw);
const hash=p=>{const b=fs.readFileSync(path.join(root,p));return{sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const mp='asset-manifest.json',m=JSON.parse(read(mp));m.version=VERSION;m.build=BUILD;m.strategy='TEST atomic audit-fix release + deterministic dossier routing + permission regression gate';m.bootstrapChanged=true;m.assets=m.assets||{};
for(const k of Object.keys(m.assets)){const p=k.replace(/^\.\//,'');if(exists(p))m.assets[k]=hash(p);else delete m.assets[k]}
for(const k of uniq([...bootstrap,'./asset-manifest.json','./app/modules/flight-governance.v1.js','./app/boot/05-legacy.js','./app/boot/25-v1154-update-detector-r2.js','./data/form-configuration.json','./form-configuration.json'])){const p=k.replace(/^\.\//,'');if(exists(p)&&k!=='./asset-manifest.json')m.assets[k]=hash(p)}
write(mp,JSON.stringify(m,null,2)+'\n');
const cfg=JSON.parse(read('data/form-configuration.json'));for(const c of ['9G','QH','VU']){assert(cfg.forms.fsags94.carriers.includes(c));assert(!cfg.forms.fsags54.carriers.includes(c))}
for(const c of ['3U','BX','B2','DR','EO','HU','N4','RF'])assert(cfg.forms.fsags54.carriers.includes(c));
console.log(JSON.stringify({version:VERSION,build:BUILD,bootstrapAssets:bootstrap.length,localScripts:scripts.length,stylesheets:styles.length},null,2));

// standalone-gate-20261003-0732
