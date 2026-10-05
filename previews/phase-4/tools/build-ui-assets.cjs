// Rebuild the UI bundles from explicit source lists, preserving CSS/JS order.
const fs=require('fs'),path=require('path'),terser=require('terser'),csso=require('csso');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const check=process.argv.includes('--check');
function emit(p,s){if(check){if(read(p)!==s)throw Error('Stale UI asset: '+p)}else fs.writeFileSync(path.join(root,p),s)}
(async()=>{
 const map=JSON.parse(read('app/generated/ui-build-sources.json'));
 for(const [out,sources]of Object.entries(map.styles)){
  const css=sources.map(p=>read(p).replace(/^\s*@charset[^;]+;\s*/i,'')).join('\n');
  emit(out,csso.minify(css,{restructure:false}).css+'\n');
 }
 for(const [out,sources]of Object.entries(map.scripts)){
  const result=await terser.minify(sources.map(read).join('\n;\n'),{compress:false,mangle:false,format:{comments:false}});
  emit(out,result.code+'\n');
 }
 console.log('UI bundles '+(check?'verified':'rebuilt')+': '+Object.keys(map.styles).length+' CSS, '+Object.keys(map.scripts).length+' JS');
})().catch(e=>{console.error(e);process.exitCode=1});
