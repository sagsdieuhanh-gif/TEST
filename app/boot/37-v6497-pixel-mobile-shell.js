/* E-REPORT SAGS V6.4.97 — approved pixel mobile shell. Mobile only. */
(function(root){
'use strict';
if(root.__SAGS_V6497_PIXEL_MOBILE_SHELL__)return;
root.__SAGS_V6497_PIXEL_MOBILE_SHELL__=true;

const MOBILE='(max-width: 767px)';
let scheduled=false;

function norm(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
}
function esc(v){
  return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function initials(name){
  const a=String(name||'').trim().split(/\s+/).filter(Boolean);
  return (a.length?(a.length===1?a[0][0]:a[0][0]+a[a.length-1][0]):'S').toUpperCase();
}
function visible(el){
  if(!el||el.closest('#v6497MobileHome'))return false;
  const s=getComputedStyle(el);
  return s.display!=='none'&&s.visibility!=='hidden'&&!el.hidden;
}
function allTargets(){
  return Array.from(document.querySelectorAll('#v157Drawer .v157MenuItem,#v157Drawer button,#v157Drawer a,#sagsNavigationHeader button,#sagsNavigationHeader a,button,a,[role="button"]')).filter(visible);
}
function findTarget(keys){
  const list=allTargets();
  const wanted=(Array.isArray(keys)?keys:[keys]).map(norm);
  for(const k of wanted){
    const exact=list.find(el=>norm(el.textContent)===k); if(exact)return exact;
    const hit=list.find(el=>norm(el.textContent).includes(k)); if(hit)return hit;
  }
  return null;
}
function forward(keys){
  const target=findTarget(keys);
  if(!target){
    alert('Chức năng này chưa được cấp quyền hoặc chưa sẵn sàng trên tài khoản hiện tại.');
    return false;
  }
  document.body.classList.remove('v6497-mobile-shell');
  try{target.click()}catch(_){}
  setTimeout(sync,180);
  return true;
}
function card(def){
  return '<button type="button" class="m6497Card '+esc(def.accent||'')+'" data-v6497-action="'+esc(def.action)+'">'+
    '<span class="m6497Icon">'+def.icon+'</span>'+
    '<span class="m6497Text"><span class="m6497Label">'+esc(def.label)+'</span>'+
    (def.meta?'<span class="m6497Meta">'+esc(def.meta)+'</span>':'')+
    '</span></button>';
}
function section(title,cards){
  return '<section class="m6497Section"><div class="m6497SectionTitle">'+esc(title)+'</div><div class="m6497Grid">'+cards.map(card).join('')+'</div></section>';
}
function liveProfile(){
  const drawer=document.getElementById('v157Drawer');
  const name=(drawer?.querySelector('.v157UserName')?.textContent||root.currentUserProfile?.name||'SAGS').trim();
  const role=(drawer?.querySelector('.v157UserRole')?.textContent||root.currentUserProfile?.roleCode||root.currentRole||'').trim();
  const job=String(root.currentUserProfile?.jobTitle||root.currentUserProfile?.positionCode||'').trim();
  const roleMap={DH:'Nhân viên điều hành',CBTT:'Cân bằng trọng tải',PVHK:'Phục vụ hành khách',LNF:'Lost & Found',KH:'Kế hoạch',AD:'Quản trị hệ thống',ADMIN:'Quản trị hệ thống'};
  return {name,role,job:job||roleMap[norm(role)]||'Nhân viên điều hành'};
}
function logoSrc(){
  return document.querySelector('#v157Drawer .v157LogoBox img')?.getAttribute('src')||
         document.querySelector('.roleLoginLogo img')?.getAttribute('src')||
         'assets/branding/login-logo-10years.png?v=1';
}
function version(){
  return document.querySelector('meta[name="sags-release-version"]')?.content||
         document.getElementById('buildMarker')?.textContent||'V6.4.97';
}
function build(){
  let shell=document.getElementById('v6497MobileHome');
  if(!shell){shell=document.createElement('div');shell.id='v6497MobileHome';shell.setAttribute('aria-label','E-REPORT Mobile');document.body.appendChild(shell)}
  const p=liveProfile(), ini=initials(p.name), logo=esc(logoSrc()), ver=esc(version());

  const khai=[
    {action:'myflight',label:'My Flight',meta:'Công việc của tôi',icon:'✈',accent:''},
    {action:'handbook',label:'Sổ tay hãng',meta:'',icon:'📖',accent:''}
  ];
  const ops=[
    {action:'closeout',label:'Kết sổ',meta:'Theo chuyến',icon:'✓',accent:'green'},
    {action:'final',label:'FINAL',meta:'Theo chuyến',icon:'F',accent:''},
    {action:'crosscheck',label:'Crosscheck',meta:'Công việc cần kiểm tra',icon:'↔',accent:'purple'},
    {action:'dossier',label:'Hồ sơ chuyến',meta:'Theo chuyến',icon:'▣',accent:'orange'}
  ];
  const docs=[
    {action:'handbook',label:'Sổ tay hãng',meta:'Tra cứu nhanh',icon:'▤',accent:'red'},
    {action:'forms',label:'Biểu mẫu',meta:'Danh sách biểu mẫu',icon:'▧',accent:'teal'}
  ];
  const system=[
    {action:'accounts',label:'Quản lý tài khoản',meta:'Danh sách người dùng',icon:'●●',accent:''},
    {action:'reports',label:'Báo cáo',meta:'Thống kê dữ liệu',icon:'▮▮▮',accent:'purple'}
  ];

  shell.innerHTML=
  '<header class="m6497Mast">'+
    '<div class="m6497Brand"><div class="m6497BrandLogo"><img src="'+logo+'" alt="SAGS"></div>'+
      '<div><div class="m6497BrandTitle">E-REPORT</div><div class="m6497BrandSub">ĐIỀU HÀNH KHAI THÁC</div></div></div>'+
    '<div class="m6497MastTools"><div class="m6497Bell" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></div>'+
      '<div class="m6497MiniAvatar">'+esc(ini)+'</div></div>'+
  '</header>'+
  '<nav class="m6497Nav">'+
    '<button type="button" class="m6497NavBtn" data-v6497-nav="menu"><span class="hamb">☰</span><span>MENU</span></button>'+
    '<div class="m6497NavCenter"><span class="plane">✈</span><span>SAGS</span></div>'+
    '<button type="button" class="m6497NavBtn" data-v6497-nav="home"><span>⌂</span><span>TRANG CHỦ</span></button>'+
  '</nav>'+
  '<main class="m6497Main">'+
    '<section class="m6497User">'+
      '<div class="m6497UserAvatar">'+esc(ini)+'</div>'+
      '<div><div class="m6497UserName">'+esc(p.name)+'</div><div class="m6497UserJob">'+esc(p.job)+'</div><div class="m6497UserOnline">● &nbsp;Đang online</div></div>'+
      '<div class="m6497Role">'+esc(p.role||'')+'</div>'+
    '</section>'+
    section('KHAI THÁC',khai)+
    section('NGHIỆP VỤ CHUYẾN BAY',ops)+
    section('TÀI LIỆU - BIỂU MẪU',docs)+
    section('HỆ THỐNG',system)+
    '<footer class="m6497Footer"><div class="m6497FooterActions">'+
      '<button type="button" class="m6497FooterBtn password" data-v6497-action="password">🔑 <span>ĐỔI MẬT KHẨU</span></button>'+
      '<button type="button" class="m6497FooterBtn logout" data-v6497-action="logout">↪ <span>ĐĂNG XUẤT</span></button>'+
    '</div><div class="m6497Version">▣ <span class="m6497Dot"></span><span>ĐANG CHẠY '+ver+'</span></div></footer>'+
  '</main>';

  shell.onclick=e=>{
    const nav=e.target.closest('[data-v6497-nav]');
    if(nav){
      if(nav.dataset.v6497Nav==='menu'){shell.scrollTo({top:0,behavior:'smooth'});return}
      if(nav.dataset.v6497Nav==='home'){
        const h=findTarget(['TRANG CHU','HOME']);
        if(h){document.body.classList.remove('v6497-mobile-shell');h.click();setTimeout(sync,180)}
        else shell.scrollTo({top:0,behavior:'smooth'});
      }
      return;
    }
    const b=e.target.closest('[data-v6497-action]');if(!b)return;
    const map={
      myflight:['MY FLIGHT'],
      handbook:['SO TAY HANG','SO TAY'],
      closeout:['KET SO'],
      final:['FINAL'],
      crosscheck:['CROSSCHECK'],
      dossier:['HO SO CHUYEN','HO SO'],
      forms:['BIEU MAU','FORM MANAGER','FORM'],
      accounts:['QUAN LY TAI KHOAN','TAI KHOAN'],
      reports:['BAO CAO','REPORT'],
      password:['DOI MAT KHAU'],
      logout:['DANG XUAT']
    };
    forward(map[b.dataset.v6497Action]||[]);
  };
}
function shouldShow(){
  return !!(root.matchMedia&&root.matchMedia(MOBILE).matches&&
    document.body?.classList.contains('v157-authenticated')&&
    document.body?.classList.contains('v157-home'));
}
function sync(){
  if(!document.body)return;
  if(!shouldShow()){document.body.classList.remove('v6497-mobile-shell');return}
  build();
  document.body.classList.add('v6497-mobile-shell');
}
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;sync()});
}
document.addEventListener('DOMContentLoaded',schedule,{once:true});
root.addEventListener('resize',schedule,{passive:true});
if(root.MutationObserver){
  const mo=new MutationObserver(schedule);
  mo.observe(document.documentElement,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
}
schedule();
})(window);
