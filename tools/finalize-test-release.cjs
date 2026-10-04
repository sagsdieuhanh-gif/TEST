const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s),exists=p=>fs.existsSync(path.join(root,p));
const VERSION='V6.4.119',BUILD='V6.4.119-20261004-MENU-CARGO-FOCUS-01',LABEL='V6.4.119 - MENU + CARGO + FOCUS STABILITY',RELEASED='2026-10-04T16:58:00+07:00';
const old=JSON.parse(read('version.json')),oldV=String(old.version||''),oldB=String(old.build||'');
if(!oldV||!oldB)throw Error('Current version metadata missing');
let index=read('index.html').split(oldB).join(BUILD).split(oldV).join(VERSION);
assert(index.includes('name="sags-release-build" content="'+BUILD+'"'));assert(index.includes('name="sags-release-version" content="'+VERSION+'"'));
write('index.html',index);
const version={version:VERSION,displayVersion:VERSION,label:LABEL,build:BUILD,releasedAt:RELEASED,type:'stability',base:oldB===BUILD?old.base:oldB,updatePolicy:'required',notes:'Remove My Flight back-arrow controls and their mutation loop; MENU is now the universal return-to-main control. Protect focused input/textarea/select fields from UI normalization churn to stop visible field flicker. Cargo/Kho hàng now renders its all-flight FSAGS 208 queue through the exact shared My Flight card/tile renderer used by operational roles, while retaining all-flight visibility, flight-number search, dossier access and receive/open FSAGS 208 actions.',message:VERSION+': bỏ nút mũi tên quay lại, dùng MENU để trở về trang chính, ổn định field nhập và đồng bộ giao diện Kho hàng với My Flight chung.'};
write('version.json',JSON.stringify(version,null,2)+'\n');
let sw=read('service-worker.js').split(oldB).join(BUILD).split(oldV).join(VERSION);
const cacheId=BUILD.toLowerCase().replace(/[^a-z0-9-]/g,'');
sw=sw.replace(/const CACHE_NAME='[^']+';/,"const CACHE_NAME='sags-app-shell-"+cacheId+"';").replace(/const META_CACHE_NAME='[^']+';/,"const META_CACHE_NAME='sags-app-meta-"+cacheId+"';");
const scripts=[...index.matchAll(/<script\b[^>]*src=["'](\.\/[^"'?]+)[^"']*["'][^>]*>/g)].map(m=>m[1]);
const styles=[...index.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.\/[^"'?]+)[^"']*["'][^>]*>/g)].map(m=>m[1]);
const uniq=a=>[...new Set(a)],bootstrap=uniq([...JSON.parse(sw.match(/const SAGS_BOOTSTRAP=(\[[^\n]*\]);/)[1]),'./index.html',...scripts,...styles,'./service-worker.js','./version.json','./data/airline-form-catalog.json','./app/modules/stability.v6-core.js','./app/modules/mobile-draft-recovery.v1.js','./app/modules/indexeddb-flight-store.v1.js']);
sw=sw.replace(/const SAGS_BOOTSTRAP=\[[^\n]*\];/,'const SAGS_BOOTSTRAP='+JSON.stringify(bootstrap)+';');
assert(sw.includes("const BUILD='"+BUILD+"'"));assert(sw.includes("const CACHE_NAME='sags-app-shell-"+cacheId+"';"),'cache name must derive from current build');assert(sw.includes("const META_CACHE_NAME='sags-app-meta-"+cacheId+"';"),'meta cache name must derive from current build');write('service-worker.js',sw);
// Match .gitattributes before measuring bytes, including Windows working copies.
const hash=p=>{const file=path.join(root,p);let b=fs.readFileSync(file);if(/\.(html|js|css|json|webmanifest|cjs)$/.test(p)){const normalized=Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));if(!normalized.equals(b)){fs.writeFileSync(file,normalized);b=normalized}}return{sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const mp='asset-manifest.json',m=JSON.parse(read(mp));m.version=VERSION;m.build=BUILD;m.strategy='TEST atomic release + MENU-only navigation + shared Cargo My Flight + focus stability';m.bootstrapChanged=true;m.assets=m.assets||{};
for(const k of Object.keys(m.assets)){const p=k.replace(/^\.\//,'');if(exists(p))m.assets[k]=hash(p);else delete m.assets[k]}
for(const k of uniq([...bootstrap,'./asset-manifest.json','./app/modules/flight-governance.v1.js','./app/boot/05-legacy.js','./app/boot/25-v1154-update-detector-r2.js','./data/form-configuration.json','./form-configuration.json'])){const p=k.replace(/^\.\//,'');if(exists(p)&&k!=='./asset-manifest.json')m.assets[k]=hash(p)}
write(mp,JSON.stringify(m,null,2)+'\n');
// UI release finalizer intentionally does not assert carrier routing; airline policy has its own regression tests.\nconsole.log(JSON.stringify({version:VERSION,build:BUILD,bootstrapAssets:bootstrap.length,localScripts:scripts.length,stylesheets:styles.length},null,2));

// standalone-gate-20261003-0732

// ui-audit-gate-retry-20261004-0630

// mobile-release-sync-20261004

// myflight-cargo-ui-v64117

// performance-stability-v64118

// menu-cargo-focus-v64119
