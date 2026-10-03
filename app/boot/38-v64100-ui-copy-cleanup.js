/* E-REPORT SAGS V6.4.100 — remove technical copy from user-facing UI everywhere. */
(function(root){
'use strict';
if(root.__SAGS_V64100_UI_COPY_CLEANUP__)return;
root.__SAGS_V64100_UI_COPY_CLEANUP__=true;

const banned=[
  'hoan tat nhap bieu mau',
  'ket thuc chuyen la hai trang thai rieng biet',
  'trang thai rieng biet'
];

function norm(v){
  return String(v||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/\s+/g,' ').trim();
}
function cleanTextNode(node){
  if(!node||node.nodeType!==3)return;
  const raw=String(node.nodeValue||'');
  const n=norm(raw);
  if(!n)return;
  if(!banned.some(x=>n.includes(x)))return;
  let next=raw;
  next=next.replace(/Hoàn\s*[Tt]ất\s+nhập\s+biểu\s+mẫu[^.!?\n]*(?:[.!?]|$)/giu,'');
  next=next.replace(/Kết\s+thúc\s+chuyến\s+là\s+hai\s+trạng\s+thái\s+riêng\s+biệt\.?/giu,'');
  next=next.replace(/trạng\s+thái\s+riêng\s+biệt\.?/giu,'');
  next=next.replace(/\s{2,}/g,' ').replace(/^\s*[·•|—–-]\s*/,'').trim();
  node.nodeValue=next;
}
function cleanElement(el){
  if(!el||el.nodeType!==1)return;
  const tag=el.tagName;
  if(['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION'].includes(tag))return;
  Array.from(el.childNodes).forEach(n=>{if(n.nodeType===3)cleanTextNode(n)});
  const own=norm(el.textContent||'');
  if(!own)return;
  if(banned.some(x=>own===x||own.startsWith(x))){
    const cls=String(el.className||'').toLowerCase();
    if(/note|hint|help|sub|desc|guide|caption|foot/.test(cls)||['P','SMALL','EM','SPAN','DIV'].includes(tag)){
      const meaningful=Array.from(el.children||[]).some(ch=>norm(ch.textContent));
      if(!meaningful){
        el.remove();
        return;
      }
    }
  }
}
function sweep(rootNode=document.body){
  if(!rootNode)return;
  if(rootNode.nodeType===1)cleanElement(rootNode);
  const w=document.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n;
  while((n=w.nextNode())){
    if(n.nodeType===3)cleanTextNode(n);
    else cleanElement(n);
  }
}
let queued=false;
function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;sweep(document.body)});
}
document.addEventListener('DOMContentLoaded',schedule,{once:true});
if(root.MutationObserver){
  const mo=new MutationObserver(schedule);
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
}
root.addEventListener('pageshow',schedule,{passive:true});
schedule();
})(window);
