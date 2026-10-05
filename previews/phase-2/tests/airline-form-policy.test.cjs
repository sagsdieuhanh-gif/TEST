const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const rootDir=path.resolve(__dirname,'..');let value=JSON.parse(fs.readFileSync(path.join(rootDir,'data/form-configuration.json'))),reads=0;
const root={__sagsGetSession:()=>({role:'AD'}),dispatchEvent(){},firebase:{auth:()=>({currentUser:{uid:'AD'}}),firestore:()=>{throw Error('Configuration must never use Firebase')}}};
const c={window:root,document:{readyState:'loading',addEventListener(){}},setInterval(){},fetch:async url=>({ok:true,json:async()=>url.includes('airline-form-catalog')?JSON.parse(fs.readFileSync(path.join(rootDir,'data/airline-form-catalog.json'))):(reads++,value)}),localStorage:{setItem(){}},CustomEvent:class{},console};
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(rootDir,'app/modules/airline-form-policy.v1.js'),'utf8'),c);
(async()=>{
 const p=root.sagsAirlineFormPolicy;await p.ready();assert.equal(reads,1);
 for(const carrier of ['3U','BX','B2','DR','EO','HU','N4','RF'])assert.equal(p.allowed({depFlight:carrier+'123'},'FSAGS54'),true,carrier+' must normally use F54');
 for(const carrier of ['9G','QH','VU']){const f=value.forms.fsags54,g=value.forms.fsags94;const enabled=(setting,key)=>setting?setting.enabled&&(!setting.allCarriers?setting.carriers.includes(carrier):true):value.carriers[carrier][key]===true;assert.equal(p.allowed({depFlight:carrier+'123'},'FSAGS54'),enabled(f,'fsags54'),carrier+' must honor repository F54 configuration');assert.equal(p.allowed({depFlight:carrier+'123'},'FSAGS94'),enabled(g,'fsags94'),carrier+' must honor repository F94 configuration');}
 console.log('Airline form policy passed: repository F54/F94 configuration without Firebase');
})().catch(e=>{console.error(e);process.exitCode=1});
