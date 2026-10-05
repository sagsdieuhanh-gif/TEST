/* E-REPORT SAGS V6.4.96 — mobile-only visual tagger. No business logic changes. */
(function(root){
'use strict';
if(root.__SAGS_V6496_APPROVED_MOBILE_UI__)return;
root.__SAGS_V6496_APPROVED_MOBILE_UI__=true;

function norm(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
}
function accentFor(text){
  const t=norm(text);
  if(t.includes('KET SO'))return 'green';
  if(t.includes('CROSSCHECK'))return 'purple';
  if(t.includes('HO SO CHUYEN'))return 'orange';
  if(t.includes('SO TAY'))return 'red';
  return 'blue';
}
function apply(){
  if(!root.matchMedia||!root.matchMedia('(max-width: 767px)').matches)return;
  const drawer=document.getElementById('v157Drawer');
  if(!drawer)return;

  drawer.querySelectorAll('button,a,[role="button"]').forEach(el=>{
    const t=norm(el.textContent);
    if(t==='DONG MENU'||t.includes('DONG MENU'))el.classList.add('v6496MobileCloseMenuButton');
  });

  drawer.querySelectorAll('.v157MenuItem').forEach(el=>{
    if(!el.dataset.v6496Accent)el.dataset.v6496Accent=accentFor(el.textContent);
  });

  const footer=drawer.querySelector('.v157DrawerFooter');
  if(footer){
    Array.from(footer.children).forEach(el=>{
      if(norm(el.textContent).includes('DANG CHAY'))el.classList.add('v6496MobileVersion');
    });
  }
}
let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{scheduled=false;apply()}));
}
document.addEventListener('DOMContentLoaded',schedule,{once:true});
document.addEventListener('click',e=>{
  if(e.target.closest('#v157Drawer,#sagsNavigationHeader'))setTimeout(apply,20);
},true);
if(root.MutationObserver){
  const mo=new MutationObserver(schedule);
  mo.observe(document.documentElement,{childList:true,subtree:true});
}
root.addEventListener('resize',schedule,{passive:true});
schedule();
})(window);
