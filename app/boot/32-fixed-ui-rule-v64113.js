/* E-REPORT SAGS V6.4.113 — fixed UI runtime guard */
(function(root){
'use strict';
const BUILD='V6.4.113-20261004-FIXED-UI-RULE-01';
if(root.__SAGS_FIXED_UI_RULE_V64113__===BUILD)return;
root.__SAGS_FIXED_UI_RULE_V64113__=BUILD;
const $=id=>document.getElementById(id);
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D').toUpperCase().replace(/\s+/g,' ').trim();}
function visible(el){if(!el||!el.isConnected)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';}
function reconcileFormDock(){
  const row=$('v324FormActions'),sign=$('v163SignBtn');
  if(!row)return;
  if(sign){
    sign.classList.add('v324FormAction','sagsFixedSignAction');
    sign.textContent='✍ KÝ';
    const pdf=$('v324PdfBtn'),done=$('v324HandoverBtn');
    if(sign.parentElement!==row||sign.nextElementSibling!==pdf){
      if(pdf)row.insertBefore(sign,pdf);
      else if(done)row.insertBefore(sign,done);
      else row.appendChild(sign);
    }
  }
  const buttons=[...row.querySelectorAll('button')].filter(visible);
  const count=Math.max(1,Math.min(4,buttons.length||1));
  row.style.setProperty('--sags-action-count',String(count));
  if(buttons.length)row.classList.add('show');
}
function stripDuplicateCopy(scope=document.body){
  if(!scope)return;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  const exact=/Hoàn\s+tất\s+nhập\s+biểu\s+mẫu\s+và\s+Kết\s+thúc\s+chuyến\s+là\s+hai\s+trạng\s+thái\s+riêng\s+biệt\.?/giu;
  let n;while((n=walker.nextNode())){
    if(!n.nodeValue)continue;
    if(exact.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(exact,'').replace(/\s{2,}/g,' ').trim();exact.lastIndex=0;}
  }
  const nodes=[...scope.querySelectorAll('div,section,aside,p,li')];
  for(const el of nodes){
    if(el.dataset.sagsDuplicateStatusHidden==='1')continue;
    const raw=String(el.textContent||'').replace(/\s+/g,' ').trim(),t=norm(raw);
    if(raw.length>260)continue;
    const duplicate=t.includes('HO SO BIEU MAU')&&t.includes('CHO NHAN')&&(/F\s*[-\/]?\s*54/.test(t)||/F\s*[-\/]?\s*94/.test(t));
    if(!duplicate)continue;
    const childMatch=[...el.children].some(ch=>{const x=norm(ch.textContent);return x.includes('HO SO BIEU MAU')&&x.includes('CHO NHAN')});
    if(childMatch)continue;
    el.dataset.sagsDuplicateStatusHidden='1';
    el.style.setProperty('display','none','important');
  }
}
let scheduled=false;
function apply(){
  scheduled=false;
  try{reconcileFormDock();stripDuplicateCopy(document.body);}catch(e){console.info('Fixed UI rule',e?.message||e);}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(records=>{
  if(records.some(r=>r.type==='childList'||r.type==='characterData'||r.type==='attributes'))schedule();
}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
root.addEventListener('pageshow',schedule,{passive:true});
root.addEventListener('resize',schedule,{passive:true});
})(window);
