const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const source=fs.readFileSync(__dirname+'/../app/modules/roster-lite.v5.js','utf8');const start=source.indexOf('function filterFlightCards(){'),end=source.indexOf("document.addEventListener('input'",start);let input={value:' vj 1 '};const cards=['VJ1','VZ1'].map(text=>({hidden:false,querySelector:()=>({textContent:text})}));const list={querySelectorAll:()=>cards};const c={document:{getElementById:id=>id==='sagsFlightSearch'?input:list}};vm.createContext(c);vm.runInContext(source.slice(start,end),c);c.filterFlightCards();assert.equal(cards[0].hidden,false);assert.equal(cards[1].hidden,true);cards.push({hidden:false,querySelector:()=>({textContent:'VZ2'})});c.filterFlightCards();assert.equal(cards[2].hidden,true);input.value='';c.filterFlightCards();assert(cards.every(x=>!x.hidden));console.log('Flight search passed: normalized search, refreshed cards, clearing filter');

{
  const source2=source;
  const start2=source2.indexOf('function v478CardState(card){');
  const end2=source2.indexOf('function v478EnsureTabs(list){',start2);
  assert(start2>0&&end2>start2,'canonical AD search block missing');
  let input2={value:'VN 123'};
  const mk=(title,state)=>({hidden:false,dataset:{v478State:state},querySelector:sel=>sel.includes('Title')?{textContent:title}:null,textContent:title,scrollIntoView:()=>{}});
  const pendingCard=mk('VJ834','pending'),completedCard=mk('VN123','completed');
  const empty={hidden:true,textContent:''};
  const tabs=[];
  const list2={classList:{contains:x=>x==='v478CanonicalQueue'},querySelectorAll:sel=>sel==='.v478CanonicalRoleCard'?[pendingCard,completedCard]:sel==='[data-v478-tab]'?tabs:[],querySelector:sel=>sel==='.v478RoleEmpty'?empty:null};
  const c2={document:{getElementById:id=>id==='fwcList'?list2:id==='sagsFlightSearch'?input2:null},requestAnimationFrame:fn=>fn()};
  vm.createContext(c2);vm.runInContext("let v478RoleTab='pending';"+source2.slice(start2,end2),c2);
  c2.v478ApplyRoleFilter();
  assert.equal(pendingCard.hidden,true,'non-matching pending flight must hide');
  assert.equal(completedCard.hidden,false,'AD search must reveal matching completed flight even while pending tab is selected');
  input2.value='';
  c2.v478ApplyRoleFilter();
  assert.equal(pendingCard.hidden,false,'clearing search restores pending tab');
  assert.equal(completedCard.hidden,true,'clearing search restores tab filter');
}
