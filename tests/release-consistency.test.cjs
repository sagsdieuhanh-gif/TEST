const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const v=JSON.parse(read('version.json')),m=JSON.parse(read('asset-manifest.json')),h=read('index.html'),sw=read('service-worker.js'),legacy=read('app/boot/05-legacy.js');
assert.equal(m.build,v.build);assert.equal(m.version,v.version);
assert.equal(sw.match(/const BUILD='([^']+)'/)[1],v.build);
assert.equal(h.match(/name="sags-release-build" content="([^"]+)"/)[1],v.build);
assert.equal(h.match(/name="sags-release-version" content="([^"]+)"/)[1],v.version);
assert(legacy.includes('sags-release-build'),'runtime identity must derive from index meta');
assert(!/const APP_BUILD_VERSION="V6\.4\./.test(legacy),'runtime build must not be hard-coded');assert(!h.includes('sagsCanonicalProduction'),'TEST must not redirect GitHub Pages to production');assert(!h.includes('e-report-sags.vercel.app'),'TEST index must stay isolated from production URL');
console.log('Release consistency passed: '+v.build);

const runtime=read('app/core/runtime.v503hf2.bundle.js');
assert(!/const V6441_RUNNING_(?:VERSION|BUILD)="V6\.4\./.test(runtime),'sidebar running version must derive from the deployed release metadata');
