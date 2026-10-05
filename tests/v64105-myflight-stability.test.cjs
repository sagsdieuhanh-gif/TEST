const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['app/generated/runtime-1.js','app/core/runtime.v503hf2.bundle.js']){
  const src=read(file);
  assert.match(src,/const ownSel="[^"]*#fwcModal[^"]*"/,file+' must exclude MY FLIGHT from the global UI MutationObserver');
  const a=src.indexOf('function decorateWorkMenuHeader()');
  const b=src.indexOf('function openMyFlightFromCurrentUi',a);
  assert(a>=0&&b>a,file+' decorateWorkMenuHeader missing');
  const fn=src.slice(a,b);
  assert.match(fn,/textContent!=="☰ MENU"/,file+' MENU text write must be idempotent');
  assert.match(fn,/home\.style\.display!==display/,file+' home-button display write must be idempotent');
  assert.match(fn,/back\.textContent!==backText/,file+' back-button text write must be idempotent');
  assert.doesNotMatch(fn,/close\.textContent="☰ MENU"/,file+' must not rewrite MENU text on every sync');
}
console.log('V6.4.105 MY FLIGHT stability regression passed: no header mutation feedback loop.');
