const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const v=JSON.parse(read('version.json')),h=read('index.html');
const assets=[...h.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["'](\.\/[^"'?]+)[^"']*["']/g)].map(m=>m[1]);
const executable=[...new Set(assets.filter(p=>/\.(js|css)$/.test(p)))];
let sw=read('service-worker.js');sw=sw.replace(/const BUILD='[^']+'/,"const BUILD='"+v.build+"'");
sw=sw.replace(/const DISPLAY_VERSION='[^']+'/,"const DISPLAY_VERSION='"+v.version+"'");
sw=sw.replace(/sags-app-shell-v\d+-[a-z0-9-]+/g,'sags-app-shell-v64106-mobile-navy').replace(/sags-app-meta-v\d+-[a-z0-9-]+/g,'sags-app-meta-v64106-mobile-navy');
const prior=JSON.parse(sw.match(/const SAGS_BOOTSTRAP=(\[[^\n]+\]);/)[1]);
const bootstrap=[...new Set(['./index.html',...executable,...prior.filter(p=>!p.endsWith('.js')&&!p.endsWith('.css')),'./service-worker.js','./version.json','./data/airline-form-catalog.json','./app/modules/stability.v6-core.js','./app/modules/mobile-draft-recovery.v1.js','./app/modules/indexeddb-flight-store.v1.js','./assets/ui/myflight-hero-v64101.webp','./assets/branding/login-logo-10years.png'])];
sw=sw.replace(/const SAGS_BOOTSTRAP=\[[^\n]*\];/,'const SAGS_BOOTSTRAP='+JSON.stringify(bootstrap)+';');write('service-worker.js',sw);
const m=JSON.parse(read('asset-manifest.json'));m.version=v.version;m.build=v.build;m.strategy='Ordered source bundles + unified mobile navy + targeted UI observers';m.bootstrapChanged=true;
const active=new Set(executable);for(const p of Object.keys(m.assets)){
 if(p.startsWith('./app/styles/')&&!active.has(p)||p.startsWith('./app/generated/')&&!active.has(p)){delete m.assets[p];continue}
}
for(const p of bootstrap)if(p!=='./asset-manifest.json')m.assets[p]={};
for(const p of Object.keys(m.assets)){const f=path.join(root,p);if(!fs.existsSync(f)){delete m.assets[p];continue}const bytes=fs.readFileSync(f);m.assets[p]={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}}
write('asset-manifest.json',JSON.stringify(m,null,2)+'\n');
console.log(JSON.stringify({version:v.version,scripts:executable.filter(p=>p.endsWith('.js')).length,styles:executable.filter(p=>p.endsWith('.css')).length,bootstrap:bootstrap.length}));
