/* V6.4.125 · COMPACT UPDATE UI
 * Presentation-only layer: keeps the existing verified update flow but makes
 * update prompts concise on phones. The actual update action still routes
 * through repair.html, which removes old app shell/meta caches and the old SW.
 */
(function(root){
'use strict';
const BUILD='V6.4.125-20261004-CLEAN-UPDATE-MOBILE-01';
function versionLabel(v){
  const m=String(v||'').match(/^(V\d+(?:\.\d+)+)/i);
  return m?m[1].toUpperCase():'';
}
function compactUpdateModal(target=''){
  const modal=document.getElementById('appUpdateModal');
  const title=document.getElementById('appUpdateTitle');
  const text=document.getElementById('appUpdateVersionText');
  const later=document.getElementById('appUpdateLaterBtn');
  const now=document.getElementById('appUpdateNowBtn');
  if(!modal)return;
  const card=modal.firstElementChild;
  const label=versionLabel(target)||versionLabel(title?.textContent)||'';
  modal.style.padding='12px';
  if(card){
    card.style.width='min(88vw,340px)';
    card.style.maxWidth='340px';
    card.style.borderRadius='16px';
    card.style.padding='16px';
    card.style.font='13px/1.4 Arial';
  }
  if(title){
    title.textContent='CÓ BẢN MỚI'+(label?' '+label:'');
    title.style.margin='0 0 8px';
    title.style.font='800 18px/1.25 Arial';
  }
  if(text){
    text.textContent='Cập nhật để dùng phiên bản mới nhất. Dữ liệu và bản nháp vẫn được giữ nguyên.';
    text.style.margin='0 0 12px';
    text.style.font='14px/1.4 Arial';
  }
  if(later){
    later.textContent='ĐỂ SAU';
    later.style.padding='9px 13px';
    later.style.fontSize='14px';
    later.style.minHeight='42px';
  }
  if(now){
    if(!now.disabled)now.textContent='CẬP NHẬT';
    now.style.padding='9px 13px';
    now.style.fontSize='14px';
    now.style.minHeight='42px';
  }
}
const original=root.openAppUpdatePrompt;
if(typeof original==='function'){
  root.openAppUpdatePrompt=function(serverVersion){
    const out=original.apply(this,arguments);
    compactUpdateModal(serverVersion);
    return out;
  };
}
function observe(){
  const modal=document.getElementById('appUpdateModal');
  if(!modal)return;
  compactUpdateModal('');
  const mo=new MutationObserver(()=>{if(modal.style.display!=='none')compactUpdateModal('')});
  mo.observe(modal,{attributes:true,attributeFilter:['style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
root.__SAGS_UPDATE_UI_V64125={build:BUILD,compactUpdateModal};
})(window);
