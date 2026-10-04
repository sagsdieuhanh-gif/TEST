/* E-REPORT SAGS V6.4.116 — shared Button Base and fixed UI runtime guard */
(function(root){
'use strict';
const BUILD='V6.4.116-20261004-FIXED-UI-AUDIT-02';
if(root.__SAGS_FIXED_UI_RULE_V64113__===BUILD)return;
root.__SAGS_FIXED_UI_RULE_V64113__=BUILD;
const $=id=>document.getElementById(id);
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D').toUpperCase().replace(/\s+/g,' ').trim();}
function visible(el){if(!el||!el.isConnected)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';}
function enhanceButton(el){
  if(el.dataset.sagsUiNormalized==='1')return el;
  el.dataset.sagsUiNormalized='1';el.classList.add('sagsUiButton');return el;
}
// Reusable API for future controls; existing nodes/listeners are retained.
root.SAGSButtonBase={enhance:enhanceButton,create({label,icon='',accent='',onClick}={}){
  const button=document.createElement('button');button.type='button';
  button.textContent=label||'';enhanceButton(button);button.classList.add('sagsAppButton');
  if(icon){const span=document.createElement('span');span.className='sagsButtonIcon';span.setAttribute('aria-hidden','true');span.textContent=icon;button.prepend(span);}
  if(accent)button.dataset.sagsAccent=accent;
  if(onClick)button.addEventListener('click',onClick);return button;
}};
function formatDockButton(id,icon,label,accent){
  const button=$(id);if(!button)return;
  if(button.querySelector(':scope > .sagsButtonLabel'))return;
  const ico=document.createElement('span');ico.className='sagsButtonIcon';ico.setAttribute('aria-hidden','true');ico.textContent=icon;
  const text=document.createElement('span');text.className='sagsButtonLabel';text.textContent=label;
  // Full labels remain available to assistive technology at narrow widths.
  if(id==='v1134QuickTimeBtn'){text.textContent='Nhập';const optional=document.createElement('span');optional.className='sagsButtonOptional';optional.textContent=' nhanh';text.append(optional);}
  if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label',label);
  button.dataset.sagsAccent=accent;button.replaceChildren(ico,text);
}
function reconcileFormDock(){
  const row=$('v324FormActions'),sign=$('v163SignBtn');
  if(!row)return;
  if(sign){
    if(!sign.classList.contains('v324FormAction')||!sign.classList.contains('sagsFixedSignAction'))sign.classList.add('v324FormAction','sagsFixedSignAction');
    if(!sign.querySelector('.sagsButtonLabel')&&sign.textContent!=='✍ KÝ')sign.textContent='✍ KÝ';
    const pdf=$('v324PdfBtn'),done=$('v324HandoverBtn');
    if(sign.parentElement!==row||sign.nextElementSibling!==pdf){
      if(pdf)row.insertBefore(sign,pdf);
      else if(done)row.insertBefore(sign,done);
      else row.appendChild(sign);
    }
  }
  const buttons=[...row.querySelectorAll('button')].filter(visible);
  // Keep extra authorized actions in the same row; never force a hidden row open.
  const count=String(Math.max(1,buttons.length));
  if(row.style.getPropertyValue('--sags-action-count')!==count)row.style.setProperty('--sags-action-count',count);
  formatDockButton('v1134QuickTimeBtn','⏱','Nhập nhanh','quick');
  formatDockButton('v163SignBtn','✍','Ký','note');
  formatDockButton('v324PdfBtn','↓','Xuất PDF','pdf');
  formatDockButton('v324HandoverBtn','✓','Hoàn tất','done');
}
function tagLegacyButtons(scope=document){
  if(!scope)return;
  const controls=scope.querySelectorAll?.('button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]')||[];
  for(const el of controls){
    enhanceButton(el);
  }
}
function stripDuplicateCopy(scope=document.body){
  if(!scope)return;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  const exact=/Hoàn\s+tất\s+nhập\s+biểu\s+mẫu\s+và\s+Kết\s+thúc\s+chuyến\s+là\s+hai\s+trạng\s+thái\s+riêng\s+biệt\.?/giu;
  let n;while((n=walker.nextNode())){
    if(!n.nodeValue||n.parentElement?.closest('script,style,textarea,[contenteditable]'))continue;
    exact.lastIndex=0;
    if(exact.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(exact,'').replace(/\s{2,}/g,' ').trim();}
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
  try{reconcileFormDock();tagLegacyButtons(document);stripDuplicateCopy(document.body);}catch(e){console.info('Fixed UI rule',e?.message||e);}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(records=>{
  if(records.some(r=>r.type==='childList'||r.type==='characterData'||r.type==='attributes'))schedule();
}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
root.addEventListener('pageshow',schedule,{passive:true});
root.addEventListener('resize',schedule,{passive:true});
})(window);
