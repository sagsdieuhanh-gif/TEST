/* E-REPORT SAGS V6.4.101 — pixel-match mobile MY FLIGHT shell.
   Uses live personalGroups/visibleFormTasks data and existing business handlers. */
(function(root){
'use strict';
if(root.__SAGS_V64101_PIXEL_MYFLIGHT__)return;
root.__SAGS_V64101_PIXEL_MYFLIGHT__=true;
const MQ='(max-width: 767px)';
let shell=null,tab='pending',query='',renderId=0,suspended=false,returnTimer=0,observerQueued=false;
const S=v=>String(v??'').trim(),U=v=>S(v).toUpperCase();
const esc=v=>S(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mobile(){return !!root.matchMedia?.(MQ).matches}
function role(){try{const s=root.__sagsGetSession?.()||{};return U(s.role||s.profile?.role||root.currentRole)}catch(_){return U(root.currentRole)}}
function cargo(){const p=root.currentUserProfile||{},t=U([role(),p.roleCode,p.groupCode,p.departmentCode,p.systemDepartment,p.department,p.group,p.jobTitle].filter(Boolean).join(' '));return ['KH','CARGO'].includes(role())||/KHO HANG|KHO HÀNG|CARGO/.test(t)}
function personal(){return mobile()&&!['AD','ADMIN'].includes(role())&&!cargo()}
function sourceOpen(){return !!document.getElementById('fwcModal')?.classList.contains('show')}
function api(){return root.__SAGS_DAILY_ROSTER_FINAL_V1199||null}
function dateNow(){const v=S(document.getElementById('fwcDate')?.value)||S(sessionStorage.getItem('sagsV36FwcDate'));if(v)return v;const d=new Date();if(d.getHours()<4)d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
function viDate(v){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(S(v));return m?m[3]+'/'+m[2]+'/'+m[1]:S(v)}
function formLabel(item){const g=U(item?.formGroup);if(g==='FSAGS'||g==='FSAGS423')return'42.3';if(g==='FSAGS421')return'42.1';if(g==='FSAGS551')return'55.1';if(g==='FSAGS09')return'KẾT SỔ';if(g==='FSAGS54')return'54';if(g==='FSAGS94'||g==='CLC_CHECKLIST'||g==='FSAGS94_CLC')return'94';if(g==='FINAL')return'FINAL';return S(item?.formGroup||'FORM')}
function flightLabel(x){const a=S(x?.arrFlight),d=S(x?.depFlight);if(a&&d&&U(a)!==U(d))return a+' / '+d;return S(x?.flightName||x?.flightRaw||x?.assignmentFlight||d||a||x?.flightId||'CHUYẾN')}
function statusOf(g,tasks){if(g.flightClosed)return {code:'done',label:'HOÀN TẤT'};const working=tasks.some(t=>api()?.itemWorking?.(t.item,t.st));return working?{code:'working',label:'ĐANG LÀM'}:{code:'waiting',label:'CHƯA LÀM'}}
function blocking(){if(document.body?.classList.contains('v163-operational'))return true;const sels=['#flightDossierModal','#v338FlightDossier','#hf4SelfModal.open','#finalFormsModal.show','#csgModal.show','[aria-modal="true"]'];return sels.some(sel=>Array.from(document.querySelectorAll(sel)).some(el=>{if(el.id==='fwcModal'||el.closest('#v64101MyFlight'))return false;const cs=getComputedStyle(el);return !el.hidden&&cs.display!=='none'&&cs.visibility!=='hidden'&&el.getClientRects().length>0}))}
function ensure(){
 if(shell)return shell;
 shell=document.createElement('section');shell.id='v64101MyFlight';shell.hidden=true;
 shell.innerHTML='<div class="m101Hero"><button type="button" class="m101Back" data-m101="back">← <span>QUAY LẠI</span></button><div class="m101TitleRow"><span class="m101Plane">✈</span><div><h1>MY FLIGHT</h1><p>Hồ sơ của tôi</p></div></div></div><main class="m101Main"><section class="m101Filter"><div class="m101DateWrap"><span class="m101FieldLabel">Ngày</span><div class="m101DateBox"><span class="m101Calendar">▣</span><strong id="m101DateText"></strong><span class="m101Down">⌄</span><input id="m101DateInput" type="date"></div></div><label class="m101Search"><span class="m101SearchIcon">⌕</span><input id="m101SearchInput" type="search" placeholder="Tìm số hiệu, sân bay..." autocomplete="off"></label><button type="button" class="m101Refresh" data-m101="refresh">↻ <span>LÀM MỚI</span></button><button type="button" class="m101Self" data-m101="self">⇄ <span>TỰ NHẬN VIỆC</span></button></section><section class="m101Info"><span class="m101InfoIcon">i</span><div><b>MY FLIGHT</b><p>Hồ sơ các chuyến có phân công của bạn · mở hồ sơ để nhận việc và xem tài liệu.</p></div></section><div id="m101Dynamic"></div></main>';
 document.body.appendChild(shell);
 const di=shell.querySelector('#m101DateInput'),si=shell.querySelector('#m101SearchInput');
 di.addEventListener('change',async()=>{const d=di.value||dateNow();query='';si.value='';syncSourceDate(d);await refreshSource(d)});
 si.addEventListener('input',()=>{query=U(si.value);void render()});
 shell.addEventListener('click',e=>{
   const ctl=e.target.closest('[data-m101]');
   if(ctl){const a=ctl.dataset.m101;if(a==='back')return goBack();if(a==='refresh')return void refreshSource(currentDate());if(a==='self'){try{root.sagsHF4OpenSelfHandover?.()}catch(err){alert(S(err?.message||err))}return}if(a==='tab'){tab=ctl.dataset.tab==='completed'?'completed':'pending';void render();return}}
   const tile=e.target.closest('[data-m101-task]');if(tile)return openTask(tile);
   const dos=e.target.closest('[data-m101-dossier]');if(dos)return openDossier(dos.dataset.date,dos.dataset.fid);
 });
 return shell;
}
function currentDate(){return S(shell?.querySelector('#m101DateInput')?.value)||dateNow()}
function syncSourceDate(d){try{sessionStorage.setItem('sagsV36FwcDate',d)}catch(_){}const src=document.getElementById('fwcDate');if(src&&src.value!==d)src.value=d;const inp=ensure().querySelector('#m101DateInput');if(inp.value!==d)inp.value=d;ensure().querySelector('#m101DateText').textContent=viDate(d)}
async function refreshSource(d){syncSourceDate(d);ensure().querySelector('#m101Dynamic').innerHTML='<div class="m101Loading">Đang tải công việc…</div>';try{await root.flightWorkspaceOpenList?.(d)}catch(_){}setTimeout(()=>void render(),120)}
function show(){if(!personal()||!sourceOpen()||suspended)return hide();ensure().hidden=false;document.body.classList.add('v64101-myflight-shell');syncSourceDate(dateNow());void render()}
function hide(){if(shell)shell.hidden=true;document.body?.classList.remove('v64101-myflight-shell')}
function taskHtml(t,date){const item=t.item||{},label=formLabel(item),aid=S(item.assignmentId),fid=S(item.flightId),working=!!api()?.itemWorking?.(item,t.st),done=!!t.done,state=done?'Đã hoàn thành':working?'Đang nhập':'Chờ nhận';return '<button type="button" class="m101Form '+(working?'working ':'')+(done?'done':'')+'" data-m101-task="1" data-aid="'+esc(aid)+'" data-fid="'+esc(fid)+'" data-date="'+esc(date)+'"><span class="m101Doc">▤</span><span class="m101FormText"><b>'+esc(label)+'</b><span>FSAGS '+esc(label)+'</span><small>'+esc(state)+'</small></span><span class="m101Chevron">›</span></button>'}
function cardHtml(g,date){const x=g.primary||{},tasks=api()?.visibleFormTasks?.(g)||[],st=statusOf(g,tasks),route=S(x.route),ac=S(x.acReg)||'—',sta=S(x.sta)||'—',std=S(x.std)||'—',fid=S(x.flightId);return '<article class="m101Flight"><div class="m101FlightTop"><h2>'+esc(flightLabel(x))+'</h2><span class="m101Status '+st.code+'"><i></i>'+esc(st.label)+'</span><button type="button" class="m101Open" data-m101-dossier="1" data-date="'+esc(date)+'" data-fid="'+esc(fid)+'">›</button></div><div class="m101Route">'+esc(route)+(route?' · ':'')+'A/C '+esc(ac)+'</div><div class="m101Times">STA '+esc(sta)+' <span>·</span> STD '+esc(std)+'</div><div class="m101Forms">'+tasks.map(t=>taskHtml(t,date)).join('')+'</div></article>'}
async function render(){if(!personal()||!sourceOpen()||suspended)return;const id=++renderId,engine=api(),host=ensure().querySelector('#m101Dynamic'),date=currentDate();if(!engine?.personalGroups||!engine?.visibleFormTasks){host.innerHTML='<div class="m101Loading">MY FLIGHT đang khởi tạo…</div>';return}try{const {dd,groups}=await engine.personalGroups(date);if(id!==renderId)return;const pending=groups.filter(g=>!g.flightClosed),done=groups.filter(g=>g.flightClosed),list=tab==='completed'?done:pending,filtered=!query?list:list.filter(g=>{const x=g.primary||{},hay=U([flightLabel(x),x.route,x.acReg,x.arrFlight,x.depFlight,x.flightId].filter(Boolean).join(' '));return hay.includes(query)}),me=S(root.currentUserProfile?.username||'');host.innerHTML='<div class="m101Tabs"><button type="button" data-m101="tab" data-tab="pending" class="'+(tab==='pending'?'active':'')+'"><span class="m101TabIcon">▤</span><b>ĐANG LÀM</b><em>'+pending.length+'</em></button><button type="button" data-m101="tab" data-tab="completed" class="'+(tab==='completed'?'active':'')+'"><span class="m101TabIcon">✓</span><b>CHUYẾN ĐÃ HOÀN TẤT</b><em>'+done.length+'</em></button></div><div class="m101Owner"><b>'+esc(me)+'</b><span>· '+esc(date)+' · '+groups.length+' chuyến được phân'+(dd?.dupes?.length?' · đã lọc '+dd.dupes.length+' bản ghi trùng':'')+'</span></div>'+(filtered.length?'<div class="m101Flights">'+filtered.map(g=>cardHtml(g,date)).join('')+'</div>':'<div class="m101Empty">'+(query?'Không tìm thấy chuyến phù hợp.':tab==='completed'?'Chưa có chuyến đã hoàn tất.':'Không còn chuyến đang làm.')+'</div>')}catch(e){if(id===renderId)host.innerHTML='<div class="m101Empty">Không tải được MY FLIGHT: '+esc(e?.message||e)+'</div>'}}
function suspend(){suspended=true;hide();clearTimeout(returnTimer)}
function watchReturn(){const tick=()=>{if(!suspended)return;if(personal()&&sourceOpen()&&!blocking()){suspended=false;show();return}returnTimer=setTimeout(tick,240)};returnTimer=setTimeout(tick,350)}
function openTask(el){const aid=S(el.dataset.aid),fid=S(el.dataset.fid),date=S(el.dataset.date);if(!aid||!fid)return;suspend();Promise.resolve(root.sagsV478OpenExactAssignment?.(aid,fid,date)).catch(e=>alert('Không mở được công việc: '+S(e?.message||e))).finally(watchReturn)}
function openDossier(date,fid){if(!fid)return;suspend();Promise.resolve(root.sagsV338OpenDossier?.(date,fid)).catch(e=>alert('Không mở được hồ sơ chuyến: '+S(e?.message||e))).finally(watchReturn)}
function goBack(){suspended=false;hide();try{root.flightWorkspaceClose?.()}catch(_){}try{root.sagsV479GoHome?.()}catch(_){}}
function schedule(){if(observerQueued)return;observerQueued=true;requestAnimationFrame(()=>{observerQueued=false;if(personal()&&sourceOpen()&&!suspended)show();else if(!sourceOpen())hide()})}
document.addEventListener('DOMContentLoaded',schedule,{once:true});root.addEventListener('resize',schedule,{passive:true});if(root.MutationObserver){const mo=new MutationObserver(schedule);mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']})}setTimeout(schedule,300);setTimeout(schedule,1200);
})(window);
