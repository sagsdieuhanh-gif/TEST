const fs=require('fs'),path=require('path'),terser=require('terser');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const build=JSON.parse(read('version.json')).build;
const local=p=>String(p).split('?')[0].replace(/^\.\//,'');
function escRe(s){return s.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')}
async function minifyLegacy(h){
  for(const n of ['05','06','07']){
    const src='app/boot/'+n+'-legacy.js',out='app/generated/legacy-'+n+'.min.js';
    if(!fs.existsSync(path.join(root,src)))continue;
    const min=await terser.minify(read(src),{compress:false,mangle:false,format:{comments:false,semicolons:true}});
    if(min.error)throw min.error;write(out,(min.code||'')+'\n');
    const re=new RegExp("<script([^>]*)src=[\\\"']\\\\./"+escRe(src)+"\\\\?[^\\\"']*[\\\"']([^>]*)><\\\\/script>","g");
    h=h.replace(re,(m,a,b)=>'<script'+a+'src="./'+out+'?v='+build+'"'+b+'></script>');
  }
  return h;
}
function stripLead(s){return s.replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/,'')}
async function bundleIifes(h){
  const re=/<script\b([^>]*)src=["'](\.\/[^"'?]+)(?:\?[^"']*)?["']([^>]*)><\/script>/gi,all=[...h.matchAll(re)];
  const rows=all.map(m=>{const attrs=(m[1]+' '+m[3]).trim(),p=local(m[2]);let code='';try{code=read(p)}catch(_){}const clean=stripLead(code),safe=!/\b(?:id|data-|type|async|defer|nomodule|integrity|crossorigin)\s*=|\b(?:async|defer|nomodule)\b/i.test(attrs)&&/^(?:\(function|\(\s*function|!function|\(\(\)=>|\(\s*\(\)\s*=>)/s.test(clean)&&!code.includes('document.currentScript')&&!/^\s*(?:import|export)\b/m.test(code);return{m,p,code,safe}});
  const groups=[];let cur=[];const flush=()=>{if(cur.length>=2)groups.push(cur);cur=[]};
  for(let i=0;i<rows.length;i++){const x=rows[i],prev=i?rows[i-1]:null,between=prev?h.slice(prev.m.index+prev.m[0].length,x.m.index):'';if(!x.safe||(prev&&between.trim())){flush();continue}const bytes=cur.reduce((n,z)=>n+Buffer.byteLength(z.code),0);if(cur.length&&bytes+Buffer.byteLength(x.code)>480000)flush();cur.push(x)}flush();
  const reps=[];let no=0;
  for(const g of groups){const source=g.map(x=>'// '+x.p+'\n'+x.code).join('\n;\n');no++;const out='app/generated/startup-bundle-'+no+'.js',min=await terser.minify(source,{compress:false,mangle:false,format:{comments:false,semicolons:true}});if(min.error)throw min.error;write(out,(min.code||'')+'\n');reps.push([g[0].m.index,g[g.length-1].m.index+g[g.length-1].m[0].length,'<script src="./'+out+'?v='+build+'"></script>'])}
  for(const [a,b,v] of reps.sort((x,y)=>y[0]-x[0]))h=h.slice(0,a)+v+h.slice(b);
  return{html:h,saved:groups.reduce((n,g)=>n+g.length,0)-groups.length,groups:groups.map(g=>g.map(x=>x.p))};
}
function bundleCss(h){
  const re=/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.\/app\/styles\/boot-[^"'?]+\.css)(?:\?[^"']*)?["'][^>]*>/gi,all=[...h.matchAll(re)];if(all.length<2)return{html:h,saved:0};
  const first=all[0],last=all[all.length-1],mid=h.slice(first.index,last.index+last[0].length),rest=mid.replace(/<link\b[^>]*>/gi,'').trim();if(rest)throw Error('boot CSS links are not contiguous');
  const css=all.map(m=>'/* '+local(m[1])+' */\n'+read(local(m[1])).replace(/^\s*@charset[^;]+;\s*/i,'')).join('\n'),out='app/generated/legacy-ui.bundle.css';write(out,css);
  h=h.slice(0,first.index)+'<link rel="stylesheet" href="./'+out+'?v='+build+'">'+h.slice(last.index+last[0].length);
  return{html:h,saved:all.length-1};
}
(async()=>{
  for(const f of fs.readdirSync(path.join(root,'app/generated')))if(/^startup-bundle-\d+\.js$|^legacy-0[567]\.min\.js$|^legacy-ui\.bundle\.css$/.test(f))fs.rmSync(path.join(root,'app/generated',f));
  let h=read('index.html');h=await minifyLegacy(h);const j=await bundleIifes(h);h=j.html;const c=bundleCss(h);h=c.html;write('index.html',h);
  const scripts=[...h.matchAll(/<script\b[^>]*src=["'](\.\/[^"'?]+)[^"']*["']/g)].map(m=>m[1]),styles=[...h.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\.\/[^"'?]+)[^"']*["']/g)].map(m=>m[1]);
  const bytes=scripts.reduce((n,p)=>n+fs.statSync(path.join(root,local(p))).size,0);
  console.log(JSON.stringify({scriptCount:scripts.length,stylesheetCount:styles.length,startupJsBytes:bytes,scriptRequestsSaved:j.saved,cssRequestsSaved:c.saved,bundles:j.groups},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
