/* E-REPORT SAGS V2.5 · FSAGS 208 IMAGE READER
 * OCR-first on device with Tesseract.js. Gemini is fallback only when OCR is weak.
 * Image reading fills editable draft fields only; it never sends/completes FSAGS 208.
 */
(function(root){
'use strict';
const BUILD='V2.5-20261006-FSAGS208-OCR-GEMINI-01',FORM='loading208';
const TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const S=v=>String(v??'').trim(),U=v=>S(v).toUpperCase();
let loadJob=null,workerJob=null,busy=false,wrappedBase=null;
function grp(){try{return S(typeof activeFormGroup!=='undefined'?activeFormGroup:root.activeFormGroup).toLowerCase()}catch(_){return S(root.activeFormGroup).toLowerCase()}}
function st(){try{return typeof state!=='undefined'&&state&&typeof state==='object'?state:root.state}catch(_){return root.state}}
function editable(){const done=document.getElementById('v324HandoverBtn');return grp()===FORM&&!!done&&done.style.display!=='none'}
function stat(t){const e=document.getElementById('s208ImageReadStatus');if(e){e.textContent=t||'';e.hidden=!t}}
function prog(t,p){const b=document.getElementById('s208ImageReadBtn');if(b){b.disabled=busy;b.textContent=busy?('⏳ '+(p>=0?Math.round(p)+'%':'ĐANG ĐỌC')):'📷 ĐỌC ẢNH'}stat(t)}
function ensureUi(){
 let b=document.getElementById('s208ImageReadBtn');
 if(!b){b=document.createElement('button');b.id='s208ImageReadBtn';b.type='button';b.textContent='📷 ĐỌC ẢNH';b.hidden=true;b.title='OCR miễn phí trước; Gemini chỉ dùng khi OCR chưa đủ rõ';const row=document.querySelector('.toolbar-row.main-actions')||document.querySelector('.toolbar'),before=document.getElementById('roleBtnSignature')||document.getElementById('roleBtnExport');if(before&&before.parentElement===row)row.insertBefore(b,before);else row?.appendChild(b);b.onclick=()=>{if(busy)return;const i=document.getElementById('s208ImageInput');if(i){i.value='';i.click()}}}
 let i=document.getElementById('s208ImageInput');if(!i){i=document.createElement('input');i.id='s208ImageInput';i.type='file';i.accept='image/*';i.hidden=true;i.onchange=()=>{const f=i.files&&i.files[0];if(f)void readImage(f)};document.body.appendChild(i)}
 if(!document.getElementById('s208ImageReadStatus')){const e=document.createElement('div');e.id='s208ImageReadStatus';e.hidden=true;e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e)}
 if(!document.getElementById('s208ImageReadStyle')){const x=document.createElement('style');x.id='s208ImageReadStyle';x.textContent='#s208ImageReadBtn{min-height:30px!important;padding:4px 8px!important;border:1px solid #9ed2df!important;border-radius:8px!important;background:#e9f8fb!important;color:#075e76!important;font:900 9.5px/1 Arial!important;white-space:nowrap!important;box-shadow:none!important;touch-action:manipulation}#s208ImageReadBtn.s208-show{display:inline-flex!important;align-items:center;justify-content:center}#s208ImageReadBtn:disabled{opacity:.7}#s208ImageReadStatus{position:fixed;z-index:69000;top:calc(7px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);max-width:min(92vw,560px);padding:8px 12px;border:1px solid #b8dce5;border-radius:999px;background:#f5fcfe;color:#184f60;box-shadow:0 5px 18px #062b3a26;font:800 11px/1.25 system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;pointer-events:none}#s208ImageReadStatus[hidden]{display:none!important}@media(max-width:600px){#s208ImageReadBtn{min-height:28px!important;padding:4px 6px!important;font-size:9px!important}}';document.head.appendChild(x)}
 return b;
}
function sync(){const b=ensureUi(),show=editable();b.hidden=!show;b.classList.toggle('s208-show',show);if(!show&&!busy)stat('')}
function patch(){const base=root.sags208SyncFormActions;if(typeof base!=='function')return false;if(base===wrappedBase||base.__sags208ImageReader)return true;const w=function(row){const r=base.apply(this,arguments);sync();return r};w.__sags208ImageReader=true;w.__base=base;wrappedBase=w;root.sags208SyncFormActions=w;return true}
function script(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=ok;s.onerror=()=>{s.remove();no(Error('Không tải được OCR. Kiểm tra mạng rồi thử lại.'))};document.head.appendChild(s)})}
async function tess(){if(root.Tesseract?.createWorker)return root.Tesseract;if(!loadJob)loadJob=script(TESS).then(()=>{if(!root.Tesseract?.createWorker)throw Error('OCR chưa khởi tạo.');return root.Tesseract}).catch(e=>{loadJob=null;throw e});return loadJob}
async function worker(){if(workerJob)return workerJob;workerJob=(async()=>{const T=await tess();return await T.createWorker('eng',1,{logger:m=>{const p=Number(m?.progress);if(busy&&Number.isFinite(p))prog('OCR · '+S(m?.status||'đang xử lý'),Math.max(0,Math.min(100,p*100)))}})})().catch(e=>{workerJob=null;throw e});return workerJob}
function data(file){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result||''));r.onerror=()=>no(Error('Không đọc được ảnh đã chọn.'));r.readAsDataURL(file)})}
function img(url){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(Error('Ảnh không hợp lệ.'));i.src=url})}
async function prep(file){const raw=await data(file),im=await img(raw),iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;if(iw<160||ih<160)throw Error('Ảnh quá nhỏ để đọc.');const k=Math.min(1.65,2200/Math.max(iw,ih)),w=Math.max(1,Math.round(iw*k)),h=Math.max(1,Math.round(ih*k)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:false,willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,0,0,w,h);try{const q=x.getImageData(0,0,w,h),a=q.data;for(let n=0;n<a.length;n+=4){const y=.299*a[n]+.587*a[n+1]+.114*a[n+2],z=Math.max(0,Math.min(255,(y-128)*1.22+128));a[n]=a[n+1]=a[n+2]=z;a[n+3]=255}x.putImageData(q,0,0)}catch(_){}return c.toDataURL('image/jpeg',.9)}
function clean(v){return U(v).replace(/[|]/g,' ').replace(/\s+/g,' ').trim()}
function number(v){const m=S(v).replace(/[, ]/g,'').match(/\d+(?:\.\d+)?/);return m?m[0]:''}
function time(v){const m=S(v).match(/(\d{1,2})[:.](\d{2})/);return m?m[1].padStart(2,'0')+':'+m[2]:''}
function date(v){const m=S(v).match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);return m?(m[3].length===2?'20'+m[3]:m[3])+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):''}
function awb(v){const d=S(v).replace(/[^\d]/g,'');return d.length===11?d.slice(0,3)+'-'+d.slice(3):S(v)}
function put(o,k,v){if(v!==''&&v!==undefined&&v!==null)o[k]=v}
function parse(text,confidence){
 const lines=String(text||'').split(/\r?\n/).map(clean).filter(Boolean),all=' '+lines.join(' ')+' ',f={};let m;
 m=all.match(/(?:FLIGHT(?:\s*NO)?|FLT(?:\s*NO)?)\s*[:#-]?\s*([A-Z0-9]{2,3}\s*[- ]?\s*\d{2,5})/i);if(m)put(f,'f208_flightNo',m[1].replace(/\s+/g,''));
 m=all.match(/\bDATE\s*[:#-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})/i);if(m)put(f,'f208_date',date(m[1]));
 m=all.match(/(?:A\/C|AC)\s*TYPE\s*[:#-]?\s*([A-Z0-9-]{3,10})/i);if(m)put(f,'f208_acType',m[1]);
 m=all.match(/\bETD\s*[:#-]?\s*(\d{1,2}[:.]\d{2})/i);if(m)put(f,'f208_etd',time(m[1]));
 m=all.match(/\bROUTE\s*[:#-]?\s*([A-Z]{3}(?:\s*[-/]\s*[A-Z]{3}){1,3})/i);if(m)put(f,'f208_route',m[1].replace(/\s+/g,''));
 const u=[];for(const line of lines)for(const x of line.match(/\b(?:AKE|AKH|PMC|PAG|PLA|RKN|DPE|ALF)[A-Z0-9-]{3,12}\b/g)||[])if(!u.includes(x))u.push(x);u.slice(0,5).forEach((x,i)=>put(f,'f208_uld'+(i+1),x));
 let rows=0;for(const line of lines){const a=line.match(/\b(\d{3}[- ]?\d{8})\b/);if(!a||rows>=7)continue;rows++;const after=line.slice(line.indexOf(a[0])+a[0].length),nums=after.match(/\b\d+(?:\.\d+)?\b/g)||[],dest=(after.match(/\b[A-Z]{3}\b/g)||[])[0]||'';put(f,'f208_awb'+rows,awb(a[1]));if(nums[0])put(f,'f208_totalPieces'+rows,number(nums[0]));put(f,'f208_dest'+rows,dest);let p=1;for(let g=1;g<=5;g++){if(nums[p])put(f,'f208_g'+g+'Pieces_r'+rows,number(nums[p++]));if(nums[p])put(f,'f208_g'+g+'Weight_r'+rows,number(nums[p++]))}const ts=after.match(/\b\d{1,2}[:.]\d{2}\b/g)||[];if(ts[0])put(f,'f208_start_r'+rows,time(ts[0]));if(ts[1])put(f,'f208_end_r'+rows,time(ts[1]))}
 for(const line of lines)if(/\bTOTAL\b/.test(line)){const ns=line.match(/\b\d+(?:\.\d+)?\b/g)||[];if(ns.length>=2){put(f,'f208_totalPieces',number(ns[ns.length-2]));put(f,'f208_totalWeight',number(ns[ns.length-1]))}}
 const tick=(w,k)=>{if(new RegExp('(?:[Xx✓✔☑]\\s*'+w+'|'+w+'\\s*[Xx✓✔☑])','i').test(all))f[k]=true};tick('GOOD','f208_condGood');tick('OLD','f208_condOld');tick('DIRTY','f208_condDirty');tick('WET','f208_condWet');
 const count=Object.keys(f).length,anchors=['AWB','ULD','PIEC','WEIGHT','FLIGHT'].filter(x=>all.includes(x)).length;let quality=Math.round(Math.max(0,Math.min(100,Number(confidence)||0))*.58+Math.min(26,count*2)+anchors*3+(rows?8:0));return {fields:f,quality:Math.min(100,quality),count,rows,raw:String(text||'').slice(0,12000)};
}
function valid(k){return /^f208_(?:flightNo|date|acType|etd|route|cond(?:Good|Old|Basket|Dirty|Wet|Other)|uld[1-5]|priority[1-5]|awb[1-7]|totalPieces(?:[1-7])?|dest[1-7]|g[1-5](?:Pieces|Weight)_r[1-7]|start_r[1-7]|end_r[1-7]|netWeight[1-5]|tareWeight[1-5]|grossPieces[1-5]|grossWeight[1-5]|totalWeight|nylon(?:Sags|Airline|Qty)|waterproof(?:Sags|Airline|Qty)|strap(?:Sags|Airline|Qty)|lining(?:Sags|Airline|Qty)|remark(?:_copy){0,4})$/.test(k)}
function aiFields(ai){const out={},src=ai?.fields&&typeof ai.fields==='object'?ai.fields:{};for(const[k,v]of Object.entries(src)){if(!valid(k))continue;if(typeof v==='boolean')out[k]=v;else if(v!==null&&v!==undefined&&S(v)!=='')out[k]=S(v)}return out}
async function gemini(url,ocr){prog('OCR chưa đủ chắc chắn · Gemini đang kiểm tra lại',-1);try{await root.sagsLoadAiFeature?.();if(typeof root.sagsAi208ReadImage!=='function')throw Error('Gemini chưa sẵn sàng.');return await root.sagsAi208ReadImage(url,{text:ocr.raw,quality:ocr.quality,fields:ocr.fields})}catch(e){console.warn('FSAGS208 Gemini fallback',e);return {error:S(e?.message||e)}}}
function blank(v){return v===undefined||v===null||S(v)===''||v===false}
function apply(fields){const x=st();if(!x)throw Error('Không tìm thấy dữ liệu FSAGS 208 đang mở.');let applied=0,kept=0;for(const[k,v]of Object.entries(fields||{})){if(!valid(k))continue;if(!blank(x[k])){kept++;continue}if(typeof v==='boolean')x[k]=v;else if(v!==''&&v!==null&&v!==undefined)x[k]=S(v);else continue;applied++}if(applied){try{root.draw?.()}catch(_){}try{root.saveKH208Local?.()}catch(_){}try{root.persist?.()}catch(_){}try{root.dispatchEvent(new CustomEvent('sags:fsags208-image-imported',{detail:{applied,kept,atMs:Date.now()}}))}catch(_){}}return {applied,kept}}
async function readImage(file){
 if(busy)return;if(!editable())return alert('Chỉ đọc ảnh khi FSAGS 208 đang mở ở chế độ chỉnh sửa.');if(!/^image\//i.test(S(file?.type)))return alert('Vui lòng chọn một ảnh.');
 busy=true;sync();prog('Chuẩn bị ảnh…',0);
 try{const url=await prep(file);prog('OCR miễn phí đang đọc ảnh trên thiết bị…',4);const w=await worker(),r=await w.recognize(url,{rotateAuto:true}),d=r?.data||{},ocr=parse(d.text,Number(d.confidence)||0);let fields={...ocr.fields},method='OCR',ai=null;const needs=ocr.quality<78||ocr.count<6||(ocr.rows===0&&!Object.keys(ocr.fields).some(k=>/^f208_uld/.test(k)));if(needs){ai=await gemini(url,ocr);if(!ai?.error){fields={...fields,...aiFields(ai)};method='OCR + GEMINI'}}const res=apply(fields),note=ai?.error?' · Gemini không dùng được, giữ OCR':'';if(!res.applied)throw Error('Không nhận diện được dữ liệu 208 đủ tin cậy.'+note);const msg='✓ '+method+': đã điền '+res.applied+' ô'+(res.kept?' · giữ nguyên '+res.kept+' ô đã có dữ liệu':'')+note;stat(msg);try{root.showToast?.(msg)}catch(_){}try{root.writeUserActivity?.('ĐỌC ẢNH FSAGS 208',method+' · '+res.applied+' ô')}catch(_){}setTimeout(()=>{if(!busy)stat('')},5500)}catch(e){console.error('FSAGS 208 image reader',e);alert('Không đọc được ảnh: '+S(e?.message||e));stat('Không đọc được ảnh · dữ liệu cũ vẫn giữ nguyên.')}finally{busy=false;prog('',-1);sync()}
}
root.sags208ReadImage=()=>document.getElementById('s208ImageReadBtn')?.click();
function install(){ensureUi();patch();sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
root.addEventListener('pageshow',()=>setTimeout(install,80),{passive:true});root.addEventListener('sags:ui-ready',install);root.addEventListener('sags:personal-roster-updated',()=>setTimeout(install,80));document.addEventListener('click',e=>{if(e.target?.closest?.('#kh208SendBtn,#v324HandoverBtn,#v163HomeBtn,[data-v6494-key],.v157MenuItem'))setTimeout(sync,0)},true);setTimeout(install,450);setTimeout(install,1500);
root.addEventListener('beforeunload',()=>{try{workerJob?.then(w=>w?.terminate?.())}catch(_){}},{once:true});
root.__SAGS_FSAGS208_IMAGE_READER={build:BUILD,parseOcr:parse,aiFields,validKey:valid};
})(window);
