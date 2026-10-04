// Measure the real stylesheet cascade and dynamic controls without live data.
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'../..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end()}
  res.setHeader('Content-Type',({'.css':'text/css','.js':'application/javascript','.html':'text/html','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  browser=await chromium.launch({headless:true,...(process.env.SAGS_BROWSER_EXECUTABLE?{executablePath:process.env.SAGS_BROWSER_EXECUTABLE}:{channel:'chromium'})});
  const findings=[],summary=[];
  for(const width of [360,375,390,412,430,820,1280]){
   const page=await browser.newPage({viewport:{width,height:844},serviceWorkers:'block'});
   await page.route(/https?:\/\/[^/]*(?:firebaseio\.com|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com)/,r=>r.abort());
   await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
   await page.waitForFunction(()=>window.__SAGS_FIXED_UI_RULE_V64113__&&document.querySelector('.sagsUiButton'));
   await page.waitForTimeout(400);
   const ids=await page.evaluate(()=>[...document.querySelectorAll('[id$="Modal"]')].filter(e=>e.querySelector('button')).map(e=>e.id));
   let controls=0;
   for(const id of ids){
    await page.evaluate(id=>{document.querySelectorAll('[id$="Modal"]').forEach(e=>e.style.display='none');const e=document.getElementById(id);e.style.display='flex';},id);
    await page.waitForTimeout(90);
    const result=await page.locator('#'+id).evaluate((el,width)=>{
     const rows=[...el.querySelectorAll('button,[role="button"],input[type="submit"],input[type="button"],input[type="reset"]')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>{
      const s=getComputedStyle(e),r=e.getBoundingClientRect();return {id:e.id||e.className,label:e.textContent.trim().slice(0,55),height:r.height,radius:s.borderTopLeftRadius,font:parseFloat(s.fontSize),weight:Number(s.fontWeight),x:r.x,right:r.right,shadow:s.boxShadow};
     });return {rows,failures:rows.filter(r=>r.radius!=='12px'||r.height<39.5||r.height>52.5||r.font<13||r.font>(width<900?15:16)||r.weight<600||r.weight>700||r.x<-.5||r.right>width+.5||r.shadow!=='none')};
    },width);
    controls+=result.rows.length;
    if(result.failures.length)findings.push({width,screen:id,failures:result.failures});
   }
   // Production-generated dock + existing signature handler remain intact.
   await page.evaluate(()=>{
    window.auditSignHandler=document.getElementById('v163SignBtn').onclick;
    window.__sagsGetSession=()=>({role:'AD',profile:{username:'VISUAL_TEST',role:'AD',active:true}});currentRole='AD';currentUserProfile={username:'VISUAL_TEST',role:'AD',active:true};
    document.querySelectorAll('[id$="Modal"]').forEach(e=>e.style.display='none');
    document.body.classList.add('v157-authenticated','v163-operational');document.body.classList.remove('v157-home','v166-overlay-open','sags-overlay-open');
    let dock=document.getElementById('sagsMobileFormDock');if(!dock){dock=document.createElement('div');dock.id='sagsMobileFormDock';document.body.append(dock);}
    let row=document.getElementById('v324FormActions');if(!row){row=document.createElement('div');row.id='v324FormActions';dock.append(row);}else if(row.parentElement!==dock)dock.append(row);
    row.className='show';for(const [id,label]of [['v1134QuickTimeBtn','⏱ NHẬP NHANH'],['v324PdfBtn','📄 XUẤT PDF'],['v324HandoverBtn','✓ HOÀN TẤT']]){let b=document.getElementById(id);if(!b){b=document.createElement('button');b.id=id;row.append(b);}b.classList.add('v324FormAction');b.textContent=label;b.style.display='inline-flex';}
    const sign=document.getElementById('v163SignBtn');sign.style.display='inline-flex';
   });
   await page.evaluate(()=>window.sagsOverlayLayout?.refresh());
   await page.waitForTimeout(600);
   assert(await page.evaluate(()=>typeof window.auditSignHandler==='function'&&document.getElementById('v163SignBtn').onclick===window.auditSignHandler),'existing signature handler retained');
   await page.evaluate(()=>{document.getElementById('roleHomeIdle').setAttribute('aria-hidden','true');document.getElementById('roleHomeIdle').style.display='none';document.body.classList.add('v157-authenticated','v163-operational');document.body.classList.remove('v157-home','v166-overlay-open','sags-overlay-open');document.getElementById('v324FormActions').className='show';});
   // Freeze the production stylesheet/DOM snapshot in a separate presentation
   // fixture so background task/permission refreshes cannot invalidate geometry.
   // Real routing and task ownership are tested by mobile-navy/dossier suites.
   const fixture=await page.evaluate(()=>{
    const styles=[...document.querySelectorAll('link[rel="stylesheet"],style')].map(e=>e.outerHTML).join('\n');
    const dock=document.getElementById('sagsMobileFormDock'),nav=document.getElementById('sagsNavigationHeader');
    dock.querySelectorAll('button').forEach(b=>{b.hidden=false;b.style.display='inline-flex'});
    return '<!doctype html><html class="new-ui-v1"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+styles+'</head><body class="new-ui-v1 v157-authenticated v163-operational"><main style="height:1600px">Biểu mẫu / vùng chữ ký / footer</main>'+dock.outerHTML+nav.outerHTML+'<script src="./app/boot/32-fixed-ui-rule-v64113.js"></script><script>new ResizeObserver(()=>{document.body.style.setProperty("--sags-form-dock-height",Math.ceil(document.getElementById("sagsMobileFormDock").getBoundingClientRect().height)+"px")}).observe(document.getElementById("sagsMobileFormDock"));</script></body></html>';
   });
   await page.route('**/__fixed-ui-fixture',r=>r.fulfill({contentType:'text/html',body:fixture}));
   await page.goto('http://127.0.0.1:'+server.address().port+'/__fixed-ui-fixture',{waitUntil:'load'});
   await page.waitForTimeout(100);
   const dock=await page.evaluate(()=>{
    const row=document.getElementById('v324FormActions'),dock=document.getElementById('sagsMobileFormDock'),nav=document.getElementById('sagsNavigationHeader');
    const rect=e=>e?.getBoundingClientRect().toJSON();return {buttons:[...row.querySelectorAll('button')].map(e=>({id:e.id,rect:rect(e),font:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight,overflow:e.scrollWidth>e.clientWidth,parts:[...e.children].map(x=>({text:x.textContent,width:x.getBoundingClientRect().width,font:getComputedStyle(x).font,padding:getComputedStyle(x).padding}))})),dock:rect(dock),nav:rect(nav),navButtons:[...nav.querySelectorAll('button')].map(rect),padding:parseFloat(getComputedStyle(document.body).paddingBottom),count:row.style.getPropertyValue('--sags-action-count')};
   });
   summary.push({width,controls,screens:ids.length,dock});
   if(width<900){
    assert.equal(dock.buttons.length,4);assert.equal(dock.count,'4');
    assert(dock.buttons.every(b=>Math.abs(b.rect.y-dock.buttons[0].rect.y)<1),'actions must stay on one row');
    assert(dock.buttons.every(b=>b.rect.height===44),'action height');
    assert(dock.buttons.every(b=>parseFloat(b.font)>=13&&Number(b.weight)<=700&&!b.overflow),'readable action text '+JSON.stringify(dock));
    assert(dock.navButtons.every(b=>b.height>=46&&b.height<=52),'navigation height '+JSON.stringify(dock));
    assert(dock.dock.bottom<=dock.nav.y+1,'dock/nav overlap');
    assert(dock.padding>=dock.dock.height+dock.nav.height+12,'content bottom clearance');
   }
   // The geometry must never override business visibility or create an update loop.
   await page.evaluate(()=>{document.getElementById('v324PdfBtn').style.display='none';});
   await page.waitForTimeout(100);
   assert.equal(await page.locator('#v324PdfBtn').isVisible(),false,'hidden PDF must remain hidden');
   assert.equal(await page.locator('#v324FormActions').evaluate(e=>e.style.getPropertyValue('--sags-action-count')),'3');
   await page.evaluate(()=>{document.getElementById('v324PdfBtn').style.display='inline-flex';window.auditMutations=0;window.auditObserver=new MutationObserver(rs=>{window.auditMutations+=rs.filter(r=>r.target.closest?.('#v324FormActions')).length});window.auditObserver.observe(document.body,{subtree:true,childList:true,attributes:true});});
   await page.waitForTimeout(100);
   await page.evaluate(()=>window.auditMutations=0);
   await page.waitForTimeout(180);
   assert((await page.evaluate(()=>window.auditMutations))<5,'toolbar observer must become idle');
   await page.evaluate(()=>window.auditObserver.disconnect());
   if(width===390){
    await page.evaluate(()=>{
      window.auditMenuHome=0;window.sagsGoStart=()=>window.auditMenuHome++;
      const input=document.createElement('input');input.id='auditFocusInput';input.value='ABC';document.querySelector('main').prepend(input);input.focus();
      const modal=document.createElement('div');modal.id='fwcModal';modal.innerHTML='<div class="fwcHead"><button id="sagsStableMyFlightBack" class="fwcBtn gray" aria-label="Quay lại">←</button></div>';document.querySelector('main').prepend(modal);
      let n=0;window.auditFocusTimer=setInterval(()=>{input.classList.toggle('auditPulse');input.style.borderWidth=(n++%2?1:2)+'px';if(n>=12)clearInterval(window.auditFocusTimer)},12);
    });
    await page.waitForTimeout(260);
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'auditFocusInput','focused editor must not lose focus during UI mutation churn');
    assert.equal(await page.locator('#sagsStableMyFlightBack').count(),0,'retired My Flight arrow must be removed and stay removed');
    await page.locator('#v163FlightBtn').click();
    assert.equal(await page.evaluate(()=>window.auditMenuHome),1,'MENU must route through the universal return handler');
    await page.evaluate(()=>document.getElementById('auditFocusInput')?.remove());
    await page.evaluate(()=>{window.auditClicks=0;const b=SAGSButtonBase.create({label:'Nút kiểm tra',icon:'✓',onClick:()=>window.auditClicks++});b.id='auditButtonBase';document.querySelector('main').prepend(b);});
    const base=page.locator('#auditButtonBase'),geometry=()=>base.evaluate(e=>{const s=getComputedStyle(e);return {height:e.getBoundingClientRect().height,radius:s.borderRadius,font:s.fontSize}});
    const normal=await geometry(),normalColor=await base.evaluate(e=>getComputedStyle(e).backgroundColor);
    await base.click();assert.equal(await page.evaluate(()=>window.auditClicks),1,'shared component retains click handler');
    await page.mouse.move(350,500);
    for(const state of ['active','selected','disabled','loading']){
     await base.evaluate((e,state)=>{e.classList.remove('active','selected');e.disabled=state==='disabled';e.setAttribute('aria-busy',String(state==='loading'));if(state==='active'||state==='selected')e.classList.add(state);},state);
     await page.waitForTimeout(250); // Allow inherited color transitions to settle.
     assert.deepEqual(await geometry(),normal,'geometry stays fixed for '+state);
     if(state==='selected')assert.notEqual(await base.evaluate(e=>getComputedStyle(e).backgroundColor),normalColor,'selected color must remain visible');
    }
    await base.evaluate(e=>e.remove());
    const cdp=await page.context().newCDPSession(page);
    let simulatedStyle;
    try{await cdp.send('Emulation.setSafeAreaInsets',{insets:{bottom:24,top:0,left:0,right:0}});}
    catch{simulatedStyle=await page.addStyleTag({content:fs.readFileSync(path.join(root,'app/styles/fixed-ui-rule-v64113.css'),'utf8').replaceAll('env(safe-area-inset-bottom)','24px')});}
    await page.waitForTimeout(100);
    const safe=await page.evaluate(()=>({nav:document.getElementById('sagsNavigationHeader').getBoundingClientRect().height,padding:parseFloat(getComputedStyle(document.body).paddingBottom),dock:document.getElementById('sagsMobileFormDock').getBoundingClientRect().height}));
    assert.equal(safe.nav,84,'24px safe area must extend navigation');assert(safe.padding>=safe.nav+safe.dock+12,'safe-area clearance');
    summary[summary.length-1].safeArea=safe;
    summary[summary.length-1].safeAreaMode=simulatedStyle?'CSS inset simulation':'native browser emulation';
    if(simulatedStyle)await simulatedStyle.evaluate(e=>e.remove());
    else await cdp.send('Emulation.setSafeAreaInsets',{insets:{bottom:0,top:0,left:0,right:0}});
   }
   if(process.env.SAGS_UI_SCREENSHOTS){fs.mkdirSync(process.env.SAGS_UI_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.SAGS_UI_SCREENSHOTS,'form-toolbar-'+width+'.png')});}
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('#sagsMobileFormDock').isVisible(),false,'toolbar must not appear in print/PDF');
   await page.emulateMedia({media:'screen'});
   await page.close();
  }
  const out=process.env.SAGS_UI_AUDIT_OUTPUT;if(out)fs.writeFileSync(out,JSON.stringify({summary,findings},null,2));
  console.log(JSON.stringify({summary:summary.map(({width,controls})=>({width,controls})),findings},null,2));
  assert.equal(findings.length,0,'fixed UI violations remain');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
