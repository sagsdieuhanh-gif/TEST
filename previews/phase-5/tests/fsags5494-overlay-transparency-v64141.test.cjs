const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'app/modules/fsags54-94.v622.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'app/generated/startup-bundle-4.js'),'utf8');
for(const [name,s] of [['source',src],['bundle',bundle]]){
  assert(s.includes('.sags5494DirectHit{position:absolute!important'),'54/94 direct hit must own its overlay geometry in '+name);
  assert(s.includes('background:transparent!important'),'54/94 direct hit must remain transparent against global button theme in '+name);
  assert(s.includes('background-color:transparent!important'),'54/94 direct hit background-color must remain transparent in '+name);
  assert(s.includes('background-image:none!important'),'54/94 direct hit must not inherit button gradients in '+name);
  assert(s.includes('box-shadow:none!important'),'54/94 direct hit must not inherit button shadow in '+name);
  assert(s.includes('appearance:none!important'),'54/94 direct hit must not inherit native/button skin in '+name);
}
console.log('FSAGS54/94 direct-hit transparency guard passed.');
