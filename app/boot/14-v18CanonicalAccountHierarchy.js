const V18_POSITION_CODES=Object.freeze({"Trưởng phòng":"TRUONG_PHONG","Phó phòng":"PHO_PHONG","Đội trưởng":"DOI_TRUONG","Đội phó":"DOI_PHO","Ca trưởng":"CA_TRUONG","Ca phó":"CA_PHO","Nhân viên":"NHAN_VIEN"});const V18_DEPARTMENTS=Object.freeze({"PĐH":{label:"Phòng Điều Hành",groups:{"ĐH":{label:"Điều hành / Coordination & Loadmaster",role:"DH",roleCode:"ĐH",unit:"Điều Hành"},CBTT:{label:"Cân bằng trọng tải / Weight & Balance",role:"CBTT",roleCode:"CBTT",unit:"Cân Bằng Trọng Tải"},KH:{label:"Kho Hàng",role:"KH",roleCode:"KH",unit:"Kho Hàng"},VIEWER:{label:"Chỉ xem",role:"VIEWER",roleCode:"VIEWER",unit:"Chỉ xem"}}},PVHK:{label:"Phòng Phục Vụ Hành Khách · TẠM ẨN",groups:{PVHK:{label:"Phục vụ hành khách chuyến đi",role:"PVHK",roleCode:"PVHK",unit:"Phục Vụ Hành Khách"},LNF:{label:"Arrival & Lost and Found",role:"LOSTFOUND",roleCode:"LOSTFOUND",unit:"Lost & Found"}}},ADMIN:{label:"Quản trị hệ thống",groups:{ADMIN:{label:"Quản trị hệ thống",role:"AD",roleCode:"AD",unit:"Quản trị hệ thống"}}}});const V18_ROLE_LABELS=Object.freeze({DH:"ĐH",CBTT:"CBTT",PVHK:"PVHK",LOSTFOUND:"Lost & Found",KH:"KH",VIEWER:"VIEWER",AD:"AD"});const V18_ALLOWED_INTERNAL_ROLES=Object.keys(V18_ROLE_LABELS);function v18RoleLabel(r){return V18_ROLE_LABELS[String(r||"").toUpperCase()]||String(r||"").toUpperCase()}function v18DeptLabel(code){return V18_DEPARTMENTS[String(code||"").toUpperCase()]?.label||String(code||"")||"Chưa khai báo"}function v18LegacyDept(d={},role=""){const explicit=String(d.departmentCode||"").toUpperCase();if(V18_DEPARTMENTS[explicit])return explicit;const old=String(d.systemDepartment||d.systemDept||"").toUpperCase();if(old==="PDH")return"PĐH";if(old==="PPVHK")return"PVHK";if(old==="ALL")return"ADMIN";const r=String(role||d.role||"").toUpperCase();if(r==="AD")return"ADMIN";if(["PVHK","LOSTFOUND"].includes(r))return"PVHK";if(["DH","CBTT","KH","VIEWER"].includes(r))return"PĐH";return""}function v18InferGroup(d={},role=""){const dep=v18LegacyDept(d,role),explicit=String(d.groupCode||"").toUpperCase();if(V18_DEPARTMENTS[dep]?.groups?.[explicit])return explicit;const r=String(role||d.role||"").toUpperCase();return{DH:"ĐH",CBTT:"CBTT",PVHK:"PVHK",LOSTFOUND:"LNF",KH:"KH",VIEWER:"VIEWER",AD:"ADMIN"}[r]||Object.keys(V18_DEPARTMENTS[dep]?.groups||{})[0]||""}function v18GroupDef(dep,group){return V18_DEPARTMENTS[String(dep||"").toUpperCase()]?.groups?.[String(group||"").toUpperCase()]||null}function v18RoleCode(role,d={}){return String(d.roleCode||"").trim()||v18RoleLabel(role)}function v18PositionCode(jobTitle,d={}){return String(d.positionCode||"").trim()||V18_POSITION_CODES[String(jobTitle||d.jobTitle||"").trim()]||""}function v18FillDeptOptions(select,selected){if(!select)return;const visible=["PĐH","ADMIN"];select.innerHTML=visible.map(k=>[k,V18_DEPARTMENTS[k]]).filter(x=>x[1]).map(([k,v])=>`<option value="${k}" ${k===selected?"selected":""}>${v.label} · ${k}</option>`).join("")}function v18SyncAccountHierarchy(prefix,groupChanged=false,selected={}){const ids=prefix==="adm"?{dep:"admSystemDepartment",group:"admGroupCode",role:"admRole",unit:"admUnit",hint:"admRoleHintV484"}:{dep:"editAccountSystemDepartment",group:"editAccountGroupCode",role:"editAccountRole",unit:"editAccountUnit",hint:"editRoleHintV484"};const depEl=document.getElementById(ids.dep),groupEl=document.getElementById(ids.group),roleEl=document.getElementById(ids.role),unitEl=document.getElementById(ids.unit),hint=document.getElementById(ids.hint);if(!depEl||!groupEl||!roleEl)return;let dep=String(selected.dep||depEl.value||"PĐH").toUpperCase();if(!V18_DEPARTMENTS[dep])dep="PĐH";if(!depEl.options.length||selected.dep)v18FillDeptOptions(depEl,dep);else dep=String(depEl.value||dep).toUpperCase();const groups=V18_DEPARTMENTS[dep].groups;let group=String(selected.group||groupEl.value||Object.keys(groups)[0]||"").toUpperCase();if(!groups[group])group=Object.keys(groups)[0]||"";groupEl.innerHTML=Object.entries(groups).map(([k,v])=>`<option value="${k}" ${k===group?"selected":""}>${v.label} · ${k}</option>`).join("");const def=groups[group];const role=String(selected.role||def?.role||"").toUpperCase();roleEl.innerHTML=def?`<option value="${def.role}">${def.roleCode} · ${v18RoleLabel(def.role)}</option>`:'<option value="">-- Chưa có vai trò --</option>';roleEl.value=def?.role||role;roleEl.disabled=true;if(unitEl)unitEl.value=def?.unit||"";if(hint)hint.textContent=def?`Mã chuẩn: ${dep} / ${group} / ${def.roleCode}`:""}window.v18SyncAccountHierarchy=v18SyncAccountHierarchy;function v18InitAccountUi(){const a=document.getElementById("admSystemDepartment");if(a){v18FillDeptOptions(a,"PĐH");v18SyncAccountHierarchy("adm",false,{dep:"PĐH",group:"ĐH",role:"DH"})}const e=document.getElementById("editAccountSystemDepartment");if(e&&!e.options.length)v18FillDeptOptions(e,"PĐH")}v484InferSystemDepartment=function(role,d={}){return v18LegacyDept(d,role)};v484DepartmentLabel=function(dep){return v18DeptLabel(dep)};v484RoleLabel=function(r){return v18RoleLabel(r)};v484RolesForDepartment=function(dep){return Object.values(V18_DEPARTMENTS[String(dep||"").toUpperCase()]?.groups||{}).map(x=>x.role)};v484SyncRoleSelect=function(deptId,roleId,selected=""){const prefix=deptId==="admSystemDepartment"?"adm":"editAccount";v18SyncAccountHierarchy(prefix,false,{dep:document.getElementById(deptId)?.value||"PĐH"})};v484InitAccountRoleUi=v18InitAccountUi;window.v484SyncRoleSelect=v484SyncRoleSelect;ROLE_ACCOUNTS.LOSTFOUND={label:"Lost & Found"};ROLE_ACCOUNTS.DH.label="ĐH";currentActor=function(){if(currentUserProfile){const role=String(currentUserProfile.role||currentRole||"").toUpperCase(),dep=v18LegacyDept(currentUserProfile,role),group=v18InferGroup(currentUserProfile,role);return{username:currentUserProfile.username||"",employeeCode:currentUserProfile.employeeCode||"",name:currentUserProfile.name||"",role:role,roleCode:v18RoleCode(role,currentUserProfile),departmentCode:dep,groupCode:group,positionCode:v18PositionCode(currentUserProfile.jobTitle,currentUserProfile),jobTitle:currentUserProfile.jobTitle||"",unit:currentUserProfile.unit||v18GroupDef(dep,group)?.unit||""}}if(currentRole==="AD")return{username:"AD",employeeCode:"BOOTSTRAP",name:"AD",role:"AD",roleCode:"AD",departmentCode:"ADMIN",groupCode:"ADMIN",positionCode:"QUAN_TRI_HE_THONG",jobTitle:"Quản trị hệ thống",unit:"Quản trị hệ thống",bootstrap:true};const role=String(currentRole||"").toUpperCase(),dep=v18LegacyDept({},role),group=v18InferGroup({},role);return{username:role?role+"_LEGACY":"",employeeCode:"",name:role?v18RoleLabel(role)+" (legacy)":"",role:role,roleCode:v18RoleCode(role),departmentCode:dep,groupCode:group}};v466UserCatalogShape=function(d,id=""){const role=String(d?.role||"").toUpperCase(),dep=v18LegacyDept(d,role),group=v18InferGroup(d,role);return{id:String(id||d?.id||""),username:normalizePersonalUsername(d?.username||""),employeeCode:String(d?.employeeCode||""),name:String(d?.name||d?.username||""),role:role,roleCode:v18RoleCode(role,d),departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode:v18PositionCode(d?.jobTitle,d),jobTitle:String(d?.jobTitle||""),unit:String(d?.unit||d?.workUnit||v18GroupDef(dep,group)?.unit||""),workUnit:String(d?.unit||d?.workUnit||v18GroupDef(dep,group)?.unit||""),active:d?.active!==false,updatedAtMs:Number(d?.updatedAtMs||0)}};adminCreatePersonalAccount=async function(){if(currentRole!=="AD")return roleDenied("Chỉ AD được tạo tài khoản.");const employeeCode=normalizeEmployeeCode(document.getElementById("admEmployeeCode")?.value||""),name=String(document.getElementById("admFullName")?.value||"").trim(),username=normalizePersonalUsername(document.getElementById("admUsername")?.value),dep=String(document.getElementById("admSystemDepartment")?.value||"").toUpperCase(),group=String(document.getElementById("admGroupCode")?.value||"").toUpperCase(),jobTitle=String(document.getElementById("admJobTitle")?.value||"").trim();const def=v18GroupDef(dep,group),role=String(def?.role||"").toUpperCase(),roleCode=String(def?.roleCode||v18RoleLabel(role)),unit=String(def?.unit||""),positionCode=V18_POSITION_CODES[jobTitle]||"",storedRole=role==="AD"?"ADMIN":role,email=firebaseLoginEmail(username);if(!employeeCode||!name||!username||!def||!role||!positionCode||!email)return setAccountManagerStatus("Cần nhập/chọn đủ Mã nhân viên, Họ tên, Tài khoản, Phòng, Nhóm/chức năng và Chức danh.",true);const reserved=new Set(["AD","ĐH","DH","CBTT","PVHK","LNF","LOSTFOUND","KH","VIEWER","PĐH","ADMIN"]);if(reserved.has(username))return setAccountManagerStatus("Không dùng tên tài khoản "+username+" vì trùng mã hệ thống.",true);let secApp=null,secAuth=null,createdUser=null,profileWritten=false;try{setAccountManagerStatus("Đang tạo Firebase Authentication + users/{UID}...");const users=firebase.firestore().collection("users");if(!(await users.where("username","==",username).limit(1).get()).empty)return setAccountManagerStatus("Username "+username+" đã tồn tại trong Firebase users.",true);if(!(await users.where("employeeCode","==",employeeCode).limit(1).get()).empty)return setAccountManagerStatus("Mã nhân viên "+employeeCode+" đã được sử dụng.",true);secApp=firebase.initializeApp(firebase.app().options,"sags-create-"+Date.now());secAuth=secApp.auth();const cred=await secAuth.createUserWithEmailAndPassword(email,"123456");createdUser=cred.user;const uid=String(createdUser.uid),now=Date.now(),profile={active:true,email:email,username:username,employeeCode:employeeCode,name:name,role:storedRole,roleCode:roleCode,departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode:positionCode,jobTitle:jobTitle,unit:unit,workUnit:unit,mustChangePassword:true,featureOverridesV485:{},permissionRoleV485:role,permissionRevV485:now,createdAtMs:now,updatedAtMs:now,createdByUid:String(currentUserProfile?.firebaseUid||currentUserProfile?.uid||""),authMode:"FIREBASE_100"};await users.doc(uid).set(profile,{merge:false});profileWritten=true;const verify=await users.doc(uid).get(),vd=verify.data()||{};if(!verify.exists||vd.active!==true||normalizePersonalUsername(vd.username||"")!==username||String(vd.email||"").toLowerCase()!==email)throw new Error("Firebase users/{UID} chưa xác nhận đúng hồ sơ vừa tạo.");try{const legacy=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(personalUserDocId(username)),old=await legacy.get();if(old.exists&&old.data()?.kind===PERSONAL_USER_KIND)await legacy.delete()}catch(e){console.info("V1.8 legacy user cleanup",e?.message||e)}["admEmployeeCode","admFullName","admUsername","admJobTitle"].forEach(id=>{const x=document.getElementById(id);if(x)x.value=""});v18InitAccountUi();setAccountManagerStatus(`✓ ĐÃ TẠO FIREBASE: ${username} · ${email} · users/${uid} · mật khẩu ban đầu 123456.`);await refreshAccountManager()}catch(e){const code=String(e?.code||""),msg=String(e?.message||e);if(createdUser){try{if(profileWritten)await firebase.firestore().collection("users").doc(createdUser.uid).delete()}catch(_){}try{await createdUser.delete()}catch(_){}}if(code.includes("email-already-in-use"))setAccountManagerStatus("Email Firebase "+email+" đã tồn tại trong Authentication. Kiểm tra user cũ hoặc dùng TẠO LẠI AUTH.",true);else setAccountManagerStatus("Không tạo được Firebase Auth/users: "+msg,true)}finally{try{await secAuth?.signOut()}catch(_){}try{await secApp?.delete()}catch(_){}}};window.adminCreatePersonalAccount=adminCreatePersonalAccount;adminOpenProfileEditor=async function(id){if(currentRole!=="AD")return roleDenied("Chỉ AD được sửa thông tin tài khoản.");try{const snap=await firebase.firestore().collection("users").doc(id).get();if(!snap.exists)return alert("Tài khoản Firebase không còn tồn tại.");const d=snap.data()||{},role=normalizeFirebaseOperationalRole(d.role),dep=v18LegacyDept(d,role),group=v18InferGroup(d,role);document.getElementById("editAccountDocId").value=id;document.getElementById("editAccountFullName").value=String(d.name||"");v18FillDeptOptions(document.getElementById("editAccountSystemDepartment"),dep);v18SyncAccountHierarchy("editAccount",false,{dep:dep,group:group,role:role});document.getElementById("editAccountJobTitle").value=V18_POSITION_CODES[String(d.jobTitle||"").trim()]?String(d.jobTitle):"";document.getElementById("editAccountProfileStatus").textContent=!V18_POSITION_CODES[String(d.jobTitle||"").trim()]?"Tài khoản cũ chưa có Chức danh chuẩn. Hãy chọn lại rồi LƯU.":"";document.getElementById("accountProfileEditModal").style.display="flex"}catch(e){alert("Không mở được hồ sơ Firebase: "+(e?.message||e))}};window.adminOpenProfileEditor=adminOpenProfileEditor;adminSaveAccountProfile=async function(){if(currentRole!=="AD")return;const id=document.getElementById("editAccountDocId")?.value,name=String(document.getElementById("editAccountFullName")?.value||"").trim(),dep=String(document.getElementById("editAccountSystemDepartment")?.value||"").toUpperCase(),group=String(document.getElementById("editAccountGroupCode")?.value||"").toUpperCase(),jobTitle=String(document.getElementById("editAccountJobTitle")?.value||"").trim(),st=document.getElementById("editAccountProfileStatus"),def=v18GroupDef(dep,group),role=String(def?.role||"").toUpperCase(),storedRole=role==="AD"?"ADMIN":role,roleCode=String(def?.roleCode||v18RoleLabel(role)),positionCode=V18_POSITION_CODES[jobTitle]||"",unit=String(def?.unit||"");if(!id||!name||!def||!role||!positionCode){if(st)st.textContent="Nhập/chọn đủ Họ tên, Phòng, Nhóm/chức năng, Vai trò và Chức danh.";return}try{const ref=firebase.firestore().collection("users").doc(id),snap=await ref.get();if(!snap.exists)throw new Error("Tài khoản Firebase không còn tồn tại.");const old=snap.data()||{},oldRole=normalizeFirebaseOperationalRole(old.role),roleChanged=oldRole!==role,now=Date.now(),patch={name:name,role:storedRole,roleCode:roleCode,departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode:positionCode,jobTitle:jobTitle,unit:unit,workUnit:unit,updatedAtMs:now,updatedByUid:String(currentUserProfile?.firebaseUid||currentUserProfile?.uid||"")};if(roleChanged){patch.featureOverridesV485={};patch.permissionRevV485=now;patch.permissionRoleV485=role}await ref.set(patch,{merge:true});if(roleChanged){try{const u=normalizePersonalUsername(old.username||"");if(u&&typeof sagsV470Ref==="function")await sagsV470Ref("account_permissions/"+sagsV470Safe(u)).set({rev:now,updatedAtMs:now,source:"FIREBASE_PROFILE_ROLE"})}catch(e){}}if(st)st.textContent=roleChanged?"✓ Đã lưu Firebase users/{UID} và áp lại quyền mặc định đúng vai trò.":"✓ Đã lưu Firebase users/{UID}.";await refreshAccountManager();setTimeout(closeAccountProfileEditor,450)}catch(e){if(st)st.textContent="Không lưu được Firebase: "+(e?.message||e)}};window.adminSaveAccountProfile=adminSaveAccountProfile;accountRowHtml=function(d,id){const safe=x=>escapeHtml(String(x??"")),active=d.active===true,role=normalizeFirebaseOperationalRole(d.role),dep=v18LegacyDept(d,role),group=v18InferGroup(d,role),roleCode=v18RoleCode(role,d),positionCode=v18PositionCode(d.jobTitle,d),unit=String(d.unit||d.workUnit||v18GroupDef(dep,group)?.unit||"");return`<div class="sagsUserRow"><div class="sagsUserMain"><b>${safe(d.name||d.username||d.email)}</b><div class="sagsUserMeta">${safe(d.employeeCode||"")} · TK: ${safe(d.username||"")} · Firebase: <b>${safe(d.email||"CHƯA CÓ EMAIL")}</b><br><span class="v18CodePill">${safe(dep)}</span><span class="v18CodePill">${safe(group)}</span><span class="v18CodePill">${safe(roleCode)}</span> · Chức danh: <b>${safe(d.jobTitle||"CHƯA KHAI BÁO")}</b> <span class="v18CodePill">${safe(positionCode||"NO_POSITION")}</span> · Đơn vị: <b>${safe(unit||"CHƯA KHAI BÁO")}</b> · ${active?"ĐANG MỞ":"ĐÃ KHÓA"}</div></div><div class="sagsUserMeta">UID: ${safe(id)} · Cập nhật: ${new Date(Number(d.updatedAtMs||d.createdAtMs||0)||Date.now()).toLocaleString("vi-VN")}</div><div class="sagsUserActions"><button onclick='adminOpenProfileEditor(${JSON.stringify(id)})'>SỬA HỒ SƠ / QUYỀN</button><button onclick='adminEditEmployeeCode(${JSON.stringify(id)})'>SỬA MÃ NV</button><button onclick='adminToggleAccount(${JSON.stringify(id)},${!active})'>${active?"KHÓA":"MỞ"}</button><button onclick='v485OpenPermissionEditor(${JSON.stringify(id)})'>PHÂN QUYỀN</button><button onclick='adminResetAccountPassword(${JSON.stringify(id)})'>RESET 123456</button><button onclick='adminRecreateFirebaseAccount(${JSON.stringify(id)})'>TẠO LẠI AUTH</button><button class="dangerAccountBtn" onclick='adminDeletePersonalAccount(${JSON.stringify(id)})'>VÔ HIỆU</button></div></div>`};window.accountRowHtml=accountRowHtml;refreshAccountManager=async function(){if(currentRole!=="AD")return;const list=document.getElementById("accountManagerList");if(list)list.innerHTML="Đang tải Firebase users...";try{const snap=await firebase.firestore().collection("users").get(),arr=[];snap.forEach(doc=>{const d=doc.data()||{};arr.push({id:doc.id,uid:doc.id,...d,role:normalizeFirebaseOperationalRole(d.role)})});const ord={AD:0,DH:1,CBTT:2,KH:3,VIEWER:4};arr.sort((a,b)=>(ord[normalizeFirebaseOperationalRole(a.role)]??9)-(ord[normalizeFirebaseOperationalRole(b.role)]??9)||String(a.name||a.username||a.email||"").localeCompare(String(b.name||b.username||b.email||""),"vi"));try{v116AccountManagerItems=arr.slice()}catch(_){}void v466PublishUserCatalogFromItems(arr);if(list)list.innerHTML=arr.length?arr.map(x=>accountRowHtml(x,x.id)).join(""):"<div class='sagsUserMeta'>Chưa có tài khoản Firebase.</div>"}catch(e){if(list)list.textContent="Không tải được Firebase users: "+(e?.message||e)}};window.refreshAccountManager=refreshAccountManager;
function v18LegacyAccountRowHtml(d,id){
  const safe=x=>escapeHtml(String(x??"")),u=normalizePersonalUsername(d?.username||""),role=normalizeFirebaseOperationalRole(d?.role||""),dep=v18LegacyDept(d,role),group=v18InferGroup(d,role);
  return `<div class="sagsUserRow" style="border-color:#e0a84b;background:#fff8e8"><div class="sagsUserMain"><b>${safe(d?.name||u||id)}</b><div class="sagsUserMeta">${safe(d?.employeeCode||"")} · TK: ${safe(u)} · <b style="color:#9a5a00">CHƯA CÓ FIREBASE AUTH</b><br><span class="v18CodePill">${safe(dep)}</span><span class="v18CodePill">${safe(group)}</span><span class="v18CodePill">${safe(role)}</span> · Record PERSONAL_USER cũ.</div></div><div class="sagsUserActions"><button onclick='adminMigrateLegacyAccount(${JSON.stringify(id)})'>CHUYỂN SANG FIREBASE</button></div></div>`;
}
window.v18LegacyAccountRowHtml=v18LegacyAccountRowHtml;
adminMigrateLegacyAccount=async function(id){
  if(currentRole!=="AD")return roleDenied("Chỉ AD được chuyển tài khoản.");
  const legacyRef=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(id);
  let secApp=null,secAuth=null,createdUser=null,profileWritten=false;
  try{
    const snap=await legacyRef.get();
    if(!snap.exists||snap.data()?.kind!==PERSONAL_USER_KIND)return alert("Tài khoản cũ không còn tồn tại.");
    const d=snap.data()||{},username=normalizePersonalUsername(d.username||""),email=firebaseLoginEmail(username),employeeCode=normalizeEmployeeCode(d.employeeCode||""),role=normalizeFirebaseOperationalRole(d.role||""),storedRole=role==="AD"?"ADMIN":role,dep=String(d.departmentCode||d.systemDepartment||v18LegacyDept(d,role)||"").toUpperCase(),group=String(d.groupCode||v18InferGroup(d,role)||"").toUpperCase(),jobTitle=String(d.jobTitle||"").trim(),unit=String(d.unit||d.workUnit||v18GroupDef(dep,group)?.unit||"");
    if(!username||!email||!employeeCode||!role)return setAccountManagerStatus("Tài khoản cũ thiếu username / mã NV / vai trò nên chưa thể chuyển.",true);
    const users=firebase.firestore().collection("users"),sameUser=await users.where("username","==",username).limit(1).get();
    if(!sameUser.empty){if(confirm(username+" đã có trong Firebase users. Xóa record PERSONAL_USER cũ để hết trùng?")){await legacyRef.delete();await refreshAccountManager()}return}
    if(!(await users.where("employeeCode","==",employeeCode).limit(1).get()).empty)return setAccountManagerStatus("Mã nhân viên "+employeeCode+" đã thuộc một Firebase user khác.",true);
    if(!confirm("CHUYỂN "+username+" SANG FIREBASE?\n\nHệ thống sẽ tạo Firebase Authentication + users/{UID}.\nMật khẩu ban đầu: 123456"))return;
    setAccountManagerStatus("Đang chuyển "+username+" sang Firebase...");
    secApp=firebase.initializeApp(firebase.app().options,"sags-migrate-"+Date.now());secAuth=secApp.auth();
    const cred=await secAuth.createUserWithEmailAndPassword(email,"123456");createdUser=cred.user;
    const uid=String(createdUser.uid),now=Date.now(),profile={active:d.active!==false,email,username,employeeCode,name:String(d.name||username),role:storedRole,roleCode:String(d.roleCode||role),departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode:String(d.positionCode||v18PositionCode(jobTitle,d)||""),jobTitle,unit,workUnit:unit,mustChangePassword:true,featureOverridesV485:d.featureOverridesV485&&typeof d.featureOverridesV485==="object"?d.featureOverridesV485:{},permissionRoleV485:role,permissionRevV485:now,createdAtMs:Number(d.createdAtMs||now),migratedAtMs:now,migratedFrom:String(id),updatedAtMs:now,createdByUid:String(currentUserProfile?.firebaseUid||currentUserProfile?.uid||""),authMode:"FIREBASE_100"};
    await users.doc(uid).set(profile,{merge:false});profileWritten=true;
    const verify=await users.doc(uid).get(),vd=verify.data()||{};
    if(!verify.exists||normalizePersonalUsername(vd.username||"")!==username||String(vd.email||"").toLowerCase()!==email)throw new Error("Firebase chưa xác nhận đúng hồ sơ sau chuyển đổi.");
    await legacyRef.delete();
    setAccountManagerStatus("✓ ĐÃ CHUYỂN "+username+" SANG FIREBASE · "+email+" · users/"+uid+".");
    await refreshAccountManager();
  }catch(e){
    const code=String(e?.code||""),msg=String(e?.message||e);
    if(createdUser){try{if(profileWritten)await firebase.firestore().collection("users").doc(createdUser.uid).delete()}catch(_){}try{await createdUser.delete()}catch(_){}}
    if(code.includes("email-already-in-use"))setAccountManagerStatus("Email Firebase đã tồn tại trong Authentication nhưng chưa có users/{UID}. Cần xử lý đúng Auth user đó trước.",true);
    else setAccountManagerStatus("Không chuyển được sang Firebase: "+msg,true);
  }finally{try{await secAuth?.signOut()}catch(_){}try{await secApp?.delete()}catch(_){}}
};
window.adminMigrateLegacyAccount=adminMigrateLegacyAccount;
refreshAccountManager=async function(){
  if(currentRole!=="AD")return;
  const list=document.getElementById("accountManagerList");if(list)list.innerHTML="Đang tải Firebase users...";
  try{
    const users=firebase.firestore().collection("users"),legacyCol=initHandoverFirebase().collection(HANDOVER_COLLECTION),[snap,legacySnap]=await Promise.all([users.get(),legacyCol.where("kind","==",PERSONAL_USER_KIND).get()]),arr=[],legacy=[];
    snap.forEach(doc=>{const d=doc.data()||{};arr.push({id:doc.id,uid:doc.id,...d,role:normalizeFirebaseOperationalRole(d.role)})});
    const firebaseNames=new Set(arr.map(x=>normalizePersonalUsername(x.username||"")).filter(Boolean));
    legacySnap.forEach(doc=>{const d=doc.data()||{},u=normalizePersonalUsername(d.username||"");if(u&&!firebaseNames.has(u))legacy.push({id:doc.id,...d})});
    const ord={AD:0,DH:1,CBTT:2,KH:3,VIEWER:4};arr.sort((a,b)=>(ord[normalizeFirebaseOperationalRole(a.role)]??9)-(ord[normalizeFirebaseOperationalRole(b.role)]??9)||String(a.name||a.username||a.email||"").localeCompare(String(b.name||b.username||b.email||""),"vi"));legacy.sort((a,b)=>String(a.name||a.username||"").localeCompare(String(b.name||b.username||""),"vi"));
    try{v116AccountManagerItems=arr.slice()}catch(_){}void v466PublishUserCatalogFromItems(arr);
    const firebaseHtml=arr.length?arr.map(x=>accountRowHtml(x,x.id)).join(""):"<div class='sagsUserMeta'>Chưa có tài khoản Firebase.</div>";
    const legacyHtml=legacy.length?`<div class="sagsUserMeta" style="margin:10px 0 6px;color:#9a5a00"><b>TÀI KHOẢN CŨ CHƯA CÓ FIREBASE: ${legacy.length}</b> · Bấm CHUYỂN SANG FIREBASE.</div>`+legacy.map(x=>v18LegacyAccountRowHtml(x,x.id)).join(""):"";
    if(list)list.innerHTML=firebaseHtml+legacyHtml;
  }catch(e){if(list)list.textContent="Không tải được Firebase users: "+(e?.message||e)}
};
window.refreshAccountManager=refreshAccountManager;
v485RoleDefaults=function(role){const raw=String(role||"").trim().toUpperCase(),r=raw==="ADMIN"?"AD":raw==="ĐH"||raw==="DIEU HANH"||raw==="ĐIỀU HÀNH"||raw==="DIEUHANH"?"DH":raw,p=v485Blank(),on=(...ks)=>ks.forEach(k=>p[k]=true);if(r==="AD")on(...V485_FEATURE_KEYS);else if(r==="DH")on("FLIGHTS","FSAGS423","FSAGS421","FSAGS551","BBBT","FSAGS208","FINAL","EXPORT_RAMP","QUICK_TIME");else if(r==="CBTT")on("FSAGS208","FINAL");else if(r==="PVHK")on("FSAGS09");else if(r==="KH")on("FSAGS208");else if(r==="VIEWER")on("FLIGHTS","FSAGS423","FSAGS421","FSAGS551","BBBT","FSAGS208","FINAL");return p};function v18ManualBBBTRole(){return false}function v18FillManualBBBTMeta(){const map={v18BbbtFlight:"bbbtFlight",v18BbbtRegn:"bbbtRegn",v18BbbtAcType:"bbbtAcType",v18BbbtDate:"bbbtDateText",v18BbbtRoute:"bbbtRoute"};Object.entries(map).forEach(([id,k])=>{const el=document.getElementById(id);if(el)el.value=String(state?.[k]||"")})}function v18OpenManualBBBT(){if(!v18ManualBBBTRole()&&currentRole!=="AD")return roleDenied("BBBT thủ công đang tạm ẩn trong bản PĐH.");if(typeof v485Can==="function"&&!v485Can("BBBT"))return roleDenied("Tài khoản chưa được cấp quyền BBBT.");v18FillManualBBBTMeta();const m=document.getElementById("v18ManualBBBTModal");if(m)m.style.display="flex"}function v18CloseManualBBBTMeta(){const m=document.getElementById("v18ManualBBBTModal");if(m)m.style.display="none"}function v18SaveManualBBBTMeta(){const val=id=>String(document.getElementById(id)?.value||"").trim().toUpperCase();state.bbbtManualV18=true;state.bbbtFlight=val("v18BbbtFlight");state.bbbtRegn=val("v18BbbtRegn");state.bbbtAcType=val("v18BbbtAcType");state.bbbtDateText=val("v18BbbtDate");state.bbbtRoute=val("v18BbbtRoute");try{persist()}catch(e){}v18CloseManualBBBTMeta();try{hideRoleHomeIdle()}catch(e){}showFormGroup("bbbt",true);draw()}function v18ResetManualBBBT(){if(!confirm("Tạo BBBT mới? Dữ liệu BBBT đang nhập trên tài khoản này sẽ được xóa."))return;try{fields.filter(f=>f.page===4).forEach(f=>{if(f.type==="check"||f.type==="displayCheck")state[f.key]=false;else state[f.key]=""});state.bbbtAttachments=[];state.bbbtCxrNo=null;state.bbbtManualV18=true;persist();draw();v18FillManualBBBTMeta();const st=document.getElementById("v18ManualBBBTStatus");if(st)st.textContent="✓ Đã tạo BBBT trắng mới. Nhập thông tin chuyến rồi bấm LƯU & MỞ BBBT."}catch(e){alert("Không tạo được BBBT mới: "+(e?.message||e))}}window.v18OpenManualBBBT=v18OpenManualBBBT;window.v18CloseManualBBBTMeta=v18CloseManualBBBTMeta;window.v18SaveManualBBBTMeta=v18SaveManualBBBTMeta;window.v18ResetManualBBBT=v18ResetManualBBBT;const v18ApplyRoleUIBase=applyRoleUI;applyRoleUI=function(){v18ApplyRoleUIBase();roleSetVisible("fs09QuickBtn",false);roleSetVisible("roleBtnManualBBBT",false);const fm=document.getElementById("formMenu09");if(fm)fm.style.display="none";const r=String(currentRole||"").toUpperCase(),badge=document.getElementById("roleStatusBadge");if(badge&&currentUserProfile?.name){const dep=v18LegacyDept(currentUserProfile,r),group=v18InferGroup(currentUserProfile,r);badge.textContent=currentUserProfile.name+" • "+v18RoleLabel(r);badge.title=`${v18DeptLabel(dep)} · ${group} · ${v18RoleCode(r,currentUserProfile)}`}};window.applyRoleUI=applyRoleUI;const v18OpenExportChoiceBase=openExportChoiceMenu;openExportChoiceMenu=function(){if(v18ManualBBBTRole()&&v485Can("BBBT"))return sendReport("bbbt");return v18OpenExportChoiceBase()};window.openExportChoiceMenu=openExportChoiceMenu;const v18InitRoleLoginBase=initRoleLogin;initRoleLogin=function(){v18InitRoleLoginBase();if(currentUserProfile){const r=String(currentUserProfile.role||currentRole||"").toUpperCase(),dep=v18LegacyDept(currentUserProfile,r),group=v18InferGroup(currentUserProfile,r);currentUserProfile={...currentUserProfile,roleCode:v18RoleCode(r,currentUserProfile),departmentCode:dep,groupCode:group,positionCode:v18PositionCode(currentUserProfile.jobTitle,currentUserProfile)};try{localStorage.setItem(PERSONAL_SESSION_KEY,JSON.stringify(currentUserProfile))}catch(e){}}};setTimeout(()=>{try{v18InitAccountUi();applyRoleUI()}catch(e){console.warn("V1.8 hierarchy init",e)}},120);


/* E-REPORT SAGS V6.4.90 — release E-REPORT account profile so AD can recreate without deleting Firebase Auth. */
(function(root){
'use strict';
if(root.__SAGS_V6490_ACCOUNT_RECREATE_FIX__)return;root.__SAGS_V6490_ACCOUNT_RECREATE_FIX__=true;

const v6490BaseAccountRowHtml=accountRowHtml;
accountRowHtml=function(d,id){
  return v6490BaseAccountRowHtml(d,id).replace('>VÔ HIỆU</button>','>XÓA / TẠO LẠI</button>');
};
root.accountRowHtml=accountRowHtml;

adminDeletePersonalAccount=async function(id){
  if(currentRole!=="AD")return roleDenied("Chỉ AD được xóa hồ sơ tài khoản.");
  if(String(currentUserProfile?.firebaseUid||"")===String(id))return alert("Không thể xóa hồ sơ của chính tài khoản đang đăng nhập.");
  const users=firebase.firestore().collection("users"),ref=users.doc(id),snap=await ref.get();
  if(!snap.exists)return setAccountManagerStatus("Hồ sơ tài khoản không còn tồn tại.",true);
  const d=snap.data()||{},username=normalizePersonalUsername(d.username||""),employeeCode=String(d.employeeCode||"");
  if(!confirm("XÓA HỒ SƠ E-REPORT "+String(username||d.email||id)+"?\n\nThao tác này xóa users/{UID} để giải phóng username và mã nhân viên cho việc tạo lại. Firebase Authentication KHÔNG bị xóa."))return;
  try{
    setAccountManagerStatus("Đang xóa hồ sơ E-REPORT và giải phóng username/mã nhân viên...");
    await ref.delete();
    try{
      if(username){
        const legacyRef=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(personalUserDocId(username));
        const legacySnap=await legacyRef.get();
        if(legacySnap.exists&&legacySnap.data()?.kind===PERSONAL_USER_KIND)await legacyRef.delete();
      }
    }catch(e){console.info("V6.4.90 legacy cleanup",e?.message||e)}
    try{
      if(username&&typeof sagsV470Ref==="function")await sagsV470Ref("account_permissions/"+sagsV470Safe(username)).remove();
    }catch(e){console.info("V6.4.90 permission cleanup",e?.message||e)}
    await refreshAccountManager();
    setAccountManagerStatus("✓ ĐÃ XÓA HỒ SƠ E-REPORT: "+(username||id)+(employeeCode?" · "+employeeCode:"")+". Có thể tạo tài khoản lại. Firebase Authentication cũ (nếu có) được giữ nguyên.");
  }catch(e){
    setAccountManagerStatus("Không xóa được hồ sơ E-REPORT: "+String(e?.message||e),true);
    alert("Không xóa được hồ sơ E-REPORT. "+String(e?.message||e));
  }
};
root.adminDeletePersonalAccount=adminDeletePersonalAccount;

adminCreatePersonalAccount=async function(){
  if(currentRole!=="AD")return roleDenied("Chỉ AD được tạo tài khoản.");
  const employeeCode=normalizeEmployeeCode(document.getElementById("admEmployeeCode")?.value||""),
        name=String(document.getElementById("admFullName")?.value||"").trim(),
        username=normalizePersonalUsername(document.getElementById("admUsername")?.value),
        dep=String(document.getElementById("admSystemDepartment")?.value||"").toUpperCase(),
        group=String(document.getElementById("admGroupCode")?.value||"").toUpperCase(),
        jobTitle=String(document.getElementById("admJobTitle")?.value||"").trim();
  const def=v18GroupDef(dep,group),role=String(def?.role||"").toUpperCase(),roleCode=String(def?.roleCode||v18RoleLabel(role)),
        unit=String(def?.unit||""),positionCode=V18_POSITION_CODES[jobTitle]||"",storedRole=role==="AD"?"ADMIN":role,email=firebaseLoginEmail(username);
  if(!employeeCode||!name||!username||!def||!role||!positionCode||!email)return setAccountManagerStatus("Cần nhập/chọn đủ Mã nhân viên, Họ tên, Tài khoản, Phòng, Nhóm/chức năng và Chức danh.",true);
  const reserved=new Set(["AD","ĐH","DH","CBTT","PVHK","LNF","LOSTFOUND","KH","VIEWER","PĐH","ADMIN"]);
  if(reserved.has(username))return setAccountManagerStatus("Không dùng tên tài khoản "+username+" vì trùng mã hệ thống.",true);
  let secApp=null,secAuth=null,authUser=null,createdNewAuth=false,profileWritten=false,reusedAuth=false;
  try{
    const users=firebase.firestore().collection("users");
    if(!(await users.where("username","==",username).limit(1).get()).empty)return setAccountManagerStatus("Username "+username+" đã tồn tại trong Firebase users.",true);
    if(!(await users.where("employeeCode","==",employeeCode).limit(1).get()).empty)return setAccountManagerStatus("Mã nhân viên "+employeeCode+" đã được sử dụng.",true);
    setAccountManagerStatus("Đang tạo/nhận lại Firebase Authentication + users/{UID}...");
    secApp=firebase.initializeApp(firebase.app().options,"sags-create-v6490-"+Date.now());
    secAuth=secApp.auth();
    try{
      const cred=await secAuth.createUserWithEmailAndPassword(email,"123456");
      authUser=cred.user;createdNewAuth=true;
    }catch(createErr){
      const code=String(createErr?.code||"");
      if(!code.includes("email-already-in-use"))throw createErr;
      setAccountManagerStatus("Auth "+email+" đã tồn tại. Đang nhận lại Auth cũ bằng mật khẩu khởi tạo 123456...");
      try{
        const cred=await secAuth.signInWithEmailAndPassword(email,"123456");
        authUser=cred.user;reusedAuth=true;
      }catch(signErr){
        const err=new Error("Firebase Authentication cũ vẫn tồn tại nhưng không dùng mật khẩu khởi tạo 123456. Hãy dùng username khác hoặc xử lý Auth cũ thủ công.");
        err.code="auth/existing-auth-not-recoverable";throw err;
      }
    }
    if(!authUser?.uid)throw new Error("Firebase chưa trả UID.");
    const uid=String(authUser.uid),now=Date.now(),profile={
      active:true,email:email,username:username,employeeCode:employeeCode,name:name,role:storedRole,roleCode:roleCode,
      departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode:positionCode,jobTitle:jobTitle,unit:unit,workUnit:unit,
      mustChangePassword:true,featureOverridesV485:{},permissionRoleV485:role,permissionRevV485:now,
      createdAtMs:now,updatedAtMs:now,createdByUid:String(currentUserProfile?.firebaseUid||currentUserProfile?.uid||""),
      authMode:reusedAuth?"FIREBASE_REUSED_100":"FIREBASE_100"
    };
    if(reusedAuth)profile.reusedAuthAtMs=now;
    await users.doc(uid).set(profile,{merge:false});profileWritten=true;
    const verify=await users.doc(uid).get(),vd=verify.data()||{};
    if(!verify.exists||vd.active!==true||normalizePersonalUsername(vd.username||"")!==username||String(vd.email||"").toLowerCase()!==email)throw new Error("Firebase users/{UID} chưa xác nhận đúng hồ sơ vừa tạo.");
    try{
      const legacy=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(personalUserDocId(username)),old=await legacy.get();
      if(old.exists&&old.data()?.kind===PERSONAL_USER_KIND)await legacy.delete();
    }catch(e){console.info("V6.4.90 legacy user cleanup",e?.message||e)}
    ["admEmployeeCode","admFullName","admUsername","admJobTitle"].forEach(id=>{const x=document.getElementById(id);if(x)x.value=""});
    v18InitAccountUi();
    setAccountManagerStatus("✓ ĐÃ TẠO "+(reusedAuth?"BẰNG AUTH CŨ":"FIREBASE MỚI")+": "+username+" · "+email+" · users/"+uid+" · mật khẩu 123456.");
    await refreshAccountManager();
  }catch(e){
    const code=String(e?.code||""),msg=String(e?.message||e);
    if(authUser&&profileWritten){try{await firebase.firestore().collection("users").doc(authUser.uid).delete()}catch(_){}}
    if(authUser&&createdNewAuth){try{await authUser.delete()}catch(_){}}
    if(code.includes("existing-auth-not-recoverable"))setAccountManagerStatus(msg,true);
    else if(code.includes("email-already-in-use"))setAccountManagerStatus("Auth "+email+" đã tồn tại và chưa thể nhận lại.",true);
    else setAccountManagerStatus("Không tạo được Firebase Auth/users: "+msg,true);
  }finally{
    try{await secAuth?.signOut()}catch(_){}
    try{await secApp?.delete()}catch(_){}
  }
};
root.adminCreatePersonalAccount=adminCreatePersonalAccount;
})(window);


/* E-REPORT SAGS V6.4.92 — recreate accounts without deleting or knowing the password of old Firebase Auth users. */
(function(root){
'use strict';
if(root.__SAGS_V6492_FIREBASE_RECREATE_SLOTS__)return;root.__SAGS_V6492_FIREBASE_RECREATE_SLOTS__=true;
const V6492_MAX_AUTH_SLOTS=8;

function v6492AuthCandidates(raw){
  const base=firebaseLoginEmail(raw);
  if(!base||!base.includes("@"))return base?[base]:[];
  const at=base.lastIndexOf("@"),local=base.slice(0,at),domain=base.slice(at+1),out=[base];
  for(let i=1;i<=V6492_MAX_AUTH_SLOTS;i++)out.push(local+".r"+i+"@"+domain);
  return out;
}
root.v6492AuthCandidates=v6492AuthCandidates;

async function v6492CreateFreshAuth(secAuth,username){
  const emails=v6492AuthCandidates(username);
  let lastCollision=null;
  for(let slot=0;slot<emails.length;slot++){
    const email=emails[slot];
    try{
      const cred=await secAuth.createUserWithEmailAndPassword(email,"123456");
      if(!cred?.user?.uid)throw new Error("Firebase chưa trả UID cho Auth mới.");
      return {user:cred.user,email,slot};
    }catch(e){
      const code=String(e?.code||"");
      if(code.includes("email-already-in-use")){lastCollision=e;continue}
      throw e;
    }
  }
  const e=new Error("Các vị trí Firebase Auth dành cho username này đã được sử dụng hết. Hãy tạo username khác.");
  e.code="auth/recreate-slots-exhausted";e.cause=lastCollision;throw e;
}

async function v6492ProfileFromSignedIn(authUser){
  authUser=await firebaseAuthHardRecheck(authUser);
  const snap=await firebase.firestore().collection("users").doc(authUser.uid).get();
  if(!snap.exists){const e=new Error("firebase-profile-missing");e.code="sags/profile-missing";throw e}
  const d=snap.data()||{};
  if(d.active!==true){
    const e=new Error(d.replacedByUid?"firebase-profile-replaced":"firebase-profile-disabled");
    e.code=d.replacedByUid?"sags/profile-replaced":"sags/profile-disabled";e.profile=d;throw e;
  }
  const role=normalizeFirebaseOperationalRole(d.role);
  if(!firebasePersonalRoleAllowed(role))throw new Error("firebase-role-invalid");
  const username=normalizePersonalUsername(d.username||String(authUser.email||"").split("@")[0]||"");
  if(!username)throw new Error("firebase-username-missing");
  return {
    docId:String(authUser.uid),uid:String(authUser.uid),firebaseUid:String(authUser.uid),
    firebaseEmail:String(authUser.email||d.email||""),authProvider:FIREBASE_PERSONAL_PROVIDER,
    username,employeeCode:String(d.employeeCode||""),name:String(d.name||username),role,
    roleCode:String(d.roleCode||""),departmentCode:String(d.departmentCode||d.systemDepartment||""),
    groupCode:String(d.groupCode||""),positionCode:String(d.positionCode||""),
    systemDepartment:String(d.systemDepartment||d.departmentCode||""),jobTitle:String(d.jobTitle||""),
    unit:String(d.unit||d.workUnit||""),workUnit:String(d.workUnit||d.unit||""),active:true,
    mustChangePassword:!!d.mustChangePassword,
    featureOverridesV485:d.featureOverridesV485&&typeof d.featureOverridesV485==="object"?d.featureOverridesV485:{},
    permissionRevV485:Number(d.permissionRevV485||0),verifiedAtMs:Date.now()
  };
}

personalAccountLogin=async function(){
  const err=document.getElementById("roleLoginError"),
        raw=String(document.getElementById("personalLoginUser")?.value||"").trim(),
        pass=String(document.getElementById("roleLoginPass")?.value||"");
  if(!raw){if(err)err.textContent="Nhập username hoặc email Firebase hợp lệ.";return false}
  if(!pass){if(err)err.textContent="Nhập mật khẩu.";return false}
  if(!adFirebaseAuthAvailable()){if(err)err.textContent="Firebase Authentication chưa sẵn sàng. Hãy tải lại ứng dụng.";return false}
  const auth=adFirebaseGetAuth();if(!auth){if(err)err.textContent="Đăng nhập chưa sẵn sàng. Tải lại ứng dụng.";return false}
  try{await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(_){}
  const usernameMode=!raw.includes("@"),wanted=usernameMode?normalizePersonalUsername(raw):"";
  if(usernameMode&&wanted==="AD"){if(err)err.textContent="AD phải nhập đúng email Firebase Authentication.";return false}
  const candidates=usernameMode?v6492AuthCandidates(raw):[raw.toLowerCase()];
  let sawDisabled=false,lastAuthError=null;
  if(err)err.textContent="Đang xác thực tài khoản Firebase...";
  for(const email of candidates){
    let user=null;
    try{
      const cred=await auth.signInWithEmailAndPassword(email,pass);user=cred?.user||null;
    }catch(e){
      const code=String(e?.code||"");lastAuthError=e;
      if(code.includes("network-request-failed")){if(err)err.textContent="Không có kết nối. Kiểm tra mạng rồi thử lại.";return false}
      if(code.includes("too-many-requests")){if(err)err.textContent="Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.";return false}
      if(code.includes("unauthorized-domain")||code.includes("invalid-api-key")||code.includes("operation-not-allowed")){if(err)err.textContent="Đăng nhập Firebase chưa sẵn sàng trên thiết bị này.";return false}
      continue;
    }
    try{
      const profile=await v6492ProfileFromSignedIn(user);
      if(wanted&&profile.username!==wanted){await auth.signOut();continue}
      currentUserProfile=profile;currentRole=profile.role;
      localStorage.setItem(PERSONAL_SESSION_KEY,JSON.stringify(profile));localStorage.removeItem(ROLE_SESSION_KEY);
      if(err)err.textContent="Đăng nhập Firebase thành công. Đang mở vùng dữ liệu cá nhân...";
      try{
        sessionStorage.setItem("sagsPostLoginLandingV6439","1");
        sessionStorage.setItem("sagsActiveMenuV2","home");
        sessionStorage.removeItem("sagsUiWorkspaceV181");
        v1153ClearRefreshView?.();
      }catch(_){}
      setTimeout(()=>location.reload(),60);return true;
    }catch(e){
      const msg=String(e?.message||e);
      try{await auth.signOut()}catch(_){}
      if(msg==="firebase-profile-disabled"){sawDisabled=true;break}
      if(msg==="firebase-profile-missing"||msg==="firebase-profile-replaced")continue;
      if(err)err.textContent=msg==="firebase-role-invalid"?"Tài khoản chưa được cấp quyền hợp lệ.":"Tài khoản chưa được cấp hồ sơ sử dụng.";
      return false;
    }
  }
  if(err)err.textContent=sawDisabled?"Tài khoản đã bị khóa.":"Sai tài khoản hoặc mật khẩu.";
  console.warn("V6.4.92 Firebase slot login failed",wanted||raw,lastAuthError?.code||"");
  return false;
};
root.personalAccountLogin=personalAccountLogin;

adminDeletePersonalAccount=async function(id){
  if(currentRole!=="AD")return roleDenied("Chỉ AD được xóa hồ sơ tài khoản.");
  if(String(currentUserProfile?.firebaseUid||"")===String(id))return alert("Không thể xóa hồ sơ của chính tài khoản đang đăng nhập.");
  const users=firebase.firestore().collection("users"),ref=users.doc(id),snap=await ref.get();
  if(!snap.exists)return setAccountManagerStatus("Hồ sơ tài khoản không còn tồn tại.",true);
  const d=snap.data()||{},username=normalizePersonalUsername(d.username||""),employeeCode=String(d.employeeCode||"");
  if(normalizeFirebaseOperationalRole(d.role)==="AD")return alert("Không xóa ADMIN bằng chức năng này.");
  if(!confirm("XÓA HỒ SƠ E-REPORT "+String(username||d.email||id)+"?\n\nHệ thống sẽ xóa các hồ sơ E-REPORT cũ cùng username để giải phóng username/mã nhân viên. Firebase Authentication cũ KHÔNG bị xóa."))return;
  try{
    setAccountManagerStatus("Đang xóa hồ sơ E-REPORT và giải phóng username/mã nhân viên...");
    const victims=new Map([[snap.id,snap]]);
    if(username){
      const same=await users.where("username","==",username).get();
      same.forEach(doc=>{const x=doc.data()||{};if(String(doc.id)!==String(currentUserProfile?.firebaseUid||"")&&normalizeFirebaseOperationalRole(x.role)!=="AD")victims.set(doc.id,doc)});
    }
    const batch=firebase.firestore().batch();
    victims.forEach((_,uid)=>batch.delete(users.doc(uid)));
    await batch.commit();
    try{
      if(username){
        const legacyRef=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(personalUserDocId(username));
        const legacySnap=await legacyRef.get();
        if(legacySnap.exists&&legacySnap.data()?.kind===PERSONAL_USER_KIND)await legacyRef.delete();
      }
    }catch(e){console.info("V6.4.92 legacy cleanup",e?.message||e)}
    try{if(username&&typeof sagsV470Ref==="function")await sagsV470Ref("account_permissions/"+sagsV470Safe(username)).remove()}catch(e){}
    await refreshAccountManager();
    setAccountManagerStatus("✓ ĐÃ XÓA "+victims.size+" HỒ SƠ E-REPORT: "+(username||id)+(employeeCode?" · "+employeeCode:"")+". Có thể tạo lại ngay; Firebase Auth cũ được giữ nguyên.");
  }catch(e){
    setAccountManagerStatus("Không xóa được hồ sơ E-REPORT: "+String(e?.message||e),true);
  }
};
root.adminDeletePersonalAccount=adminDeletePersonalAccount;

adminCreatePersonalAccount=async function(){
  if(currentRole!=="AD")return roleDenied("Chỉ AD được tạo tài khoản.");
  const employeeCode=normalizeEmployeeCode(document.getElementById("admEmployeeCode")?.value||""),
        name=String(document.getElementById("admFullName")?.value||"").trim(),
        username=normalizePersonalUsername(document.getElementById("admUsername")?.value),
        dep=String(document.getElementById("admSystemDepartment")?.value||"").toUpperCase(),
        group=String(document.getElementById("admGroupCode")?.value||"").toUpperCase(),
        jobTitle=String(document.getElementById("admJobTitle")?.value||"").trim();
  const def=v18GroupDef(dep,group),role=String(def?.role||"").toUpperCase(),roleCode=String(def?.roleCode||v18RoleLabel(role)),
        unit=String(def?.unit||""),positionCode=V18_POSITION_CODES[jobTitle]||"",storedRole=role==="AD"?"ADMIN":role;
  if(!employeeCode||!name||!username||!def||!role||!positionCode||!firebaseLoginEmail(username))return setAccountManagerStatus("Cần nhập/chọn đủ Mã nhân viên, Họ tên, Tài khoản, Phòng, Nhóm/chức năng và Chức danh.",true);
  const reserved=new Set(["AD","ĐH","DH","CBTT","PVHK","LNF","LOSTFOUND","KH","VIEWER","PĐH","ADMIN"]);
  if(reserved.has(username))return setAccountManagerStatus("Không dùng tên tài khoản "+username+" vì trùng mã hệ thống.",true);
  let secApp=null,secAuth=null,authUser=null,profileWritten=false;
  try{
    const users=firebase.firestore().collection("users");
    const sameUser=await users.where("username","==",username).get();
    if(sameUser.docs.some(x=>(x.data()||{}).active===true))return setAccountManagerStatus("Username "+username+" đang có tài khoản hoạt động.",true);
    const sameCode=await users.where("employeeCode","==",employeeCode).get();
    if(sameCode.docs.some(x=>(x.data()||{}).active===true))return setAccountManagerStatus("Mã nhân viên "+employeeCode+" đang được tài khoản khác sử dụng.",true);
    setAccountManagerStatus("Đang tạo Firebase Authentication mới cho "+username+"...");
    secApp=firebase.initializeApp(firebase.app().options,"sags-create-v6492-"+Date.now());secAuth=secApp.auth();
    const fresh=await v6492CreateFreshAuth(secAuth,username);authUser=fresh.user;
    const uid=String(authUser.uid),now=Date.now(),profile={
      active:true,email:fresh.email,username,employeeCode,name,role:storedRole,roleCode,
      departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode,jobTitle,unit,workUnit:unit,
      mustChangePassword:true,featureOverridesV485:{},permissionRoleV485:role,permissionRevV485:now,
      createdAtMs:now,updatedAtMs:now,createdByUid:String(currentUserProfile?.firebaseUid||currentUserProfile?.uid||""),
      authMode:fresh.slot===0?"FIREBASE_100":"FIREBASE_SLOT_V6492",authSlot:fresh.slot
    };
    await users.doc(uid).set(profile,{merge:false});profileWritten=true;
    const verify=await users.doc(uid).get(),vd=verify.data()||{};
    if(!verify.exists||vd.active!==true||normalizePersonalUsername(vd.username||"")!==username||String(vd.email||"").toLowerCase()!==fresh.email)throw new Error("Firebase users/{UID} chưa xác nhận đúng hồ sơ vừa tạo.");
    try{
      const legacy=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(personalUserDocId(username)),oldLegacy=await legacy.get();
      if(oldLegacy.exists&&oldLegacy.data()?.kind===PERSONAL_USER_KIND)await legacy.delete();
    }catch(e){}
    ["admEmployeeCode","admFullName","admUsername","admJobTitle"].forEach(id=>{const x=document.getElementById(id);if(x)x.value=""});
    v18InitAccountUi();
    setAccountManagerStatus("✓ ĐÃ TẠO: "+username+" · mật khẩu ban đầu 123456 · Firebase slot "+fresh.slot+". Người dùng vẫn đăng nhập bằng USERNAME.");
    await refreshAccountManager();
  }catch(e){
    if(authUser){try{if(profileWritten)await firebase.firestore().collection("users").doc(authUser.uid).delete()}catch(_){}try{await authUser.delete()}catch(_){}}
    setAccountManagerStatus("Không tạo được tài khoản: "+String(e?.message||e),true);
  }finally{try{await secAuth?.signOut()}catch(_){}try{await secApp?.delete()}catch(_){}}
};
root.adminCreatePersonalAccount=adminCreatePersonalAccount;

adminRecreateFirebaseAccount=async function(id){
  if(currentRole!=="AD")return;
  const users=firebase.firestore().collection("users"),oldRef=users.doc(id),snap=await oldRef.get();
  if(!snap.exists)return alert("Hồ sơ users/{UID} không còn tồn tại.");
  const d=snap.data()||{},username=normalizePersonalUsername(d.username||""),role=normalizeFirebaseOperationalRole(d.role);
  if(!username)return alert("Tài khoản chưa có username.");
  if(role==="AD")return alert("Không tạo lại ADMIN bằng chức năng này.");
  if(!confirm("TẠO LẠI ĐĂNG NHẬP cho "+username+"?\n\nFirebase Auth cũ được giữ nguyên. Hệ thống sẽ tạo một Auth slot mới, mật khẩu 123456 và chuyển hồ sơ đang hoạt động sang UID mới."))return;
  let secApp=null,secAuth=null,newUser=null,profileWritten=false;
  try{
    secApp=firebase.initializeApp(firebase.app().options,"sags-recreate-v6492-"+Date.now());secAuth=secApp.auth();
    const fresh=await v6492CreateFreshAuth(secAuth,username);newUser=fresh.user;
    const now=Date.now(),newUid=String(newUser.uid),next={...d,active:true,email:fresh.email,username,mustChangePassword:true,
      authMode:"FIREBASE_SLOT_V6492",authSlot:fresh.slot,permissionRevV485:now,updatedAtMs:now,recreatedAtMs:now,
      recreatedByUid:String(currentUserProfile?.firebaseUid||""),recreatedFromUid:String(id)};
    delete next.disabledAtMs;delete next.replacedByUid;
    await users.doc(newUid).set(next,{merge:false});profileWritten=true;
    await oldRef.set({active:false,disabledAtMs:now,replacedByUid:newUid,updatedAtMs:now,permissionRevV485:now},{merge:true});
    try{if(typeof sagsV470Ref==="function")await sagsV470Ref("account_permissions/"+sagsV470Safe(username)).set({rev:now,updatedAtMs:now,source:"ACCOUNT_RECREATE_SLOT_V6492"})}catch(_){}
    setAccountManagerStatus("✓ ĐÃ TẠO LẠI "+username+" · mật khẩu 123456 · vẫn đăng nhập bằng USERNAME.");
    await refreshAccountManager();
  }catch(e){
    if(newUser){try{if(profileWritten)await users.doc(newUser.uid).delete()}catch(_){}try{await newUser.delete()}catch(_){}}
    setAccountManagerStatus("Không tạo lại được đăng nhập: "+String(e?.message||e),true);
  }finally{try{await secAuth?.signOut()}catch(_){}try{await secApp?.delete()}catch(_){}}
};
root.adminRecreateFirebaseAccount=adminRecreateFirebaseAccount;
})(window);


/* E-REPORT SAGS V6.4.93 — do not treat an active Firestore profile as proof that Firebase Auth exists. */
(function(root){
'use strict';
if(root.__SAGS_V6493_ORPHAN_PROFILE_REPAIR__)return;root.__SAGS_V6493_ORPHAN_PROFILE_REPAIR__=true;

adminCreatePersonalAccount=async function(){
  if(currentRole!=="AD")return roleDenied("Chỉ AD được tạo tài khoản.");
  const employeeCode=normalizeEmployeeCode(document.getElementById("admEmployeeCode")?.value||""),
        name=String(document.getElementById("admFullName")?.value||"").trim(),
        username=normalizePersonalUsername(document.getElementById("admUsername")?.value),
        dep=String(document.getElementById("admSystemDepartment")?.value||"").toUpperCase(),
        group=String(document.getElementById("admGroupCode")?.value||"").toUpperCase(),
        jobTitle=String(document.getElementById("admJobTitle")?.value||"").trim();
  const def=v18GroupDef(dep,group),role=String(def?.role||"").toUpperCase(),roleCode=String(def?.roleCode||v18RoleLabel(role)),
        unit=String(def?.unit||""),positionCode=V18_POSITION_CODES[jobTitle]||"",storedRole=role==="AD"?"ADMIN":role;
  if(!employeeCode||!name||!username||!def||!role||!positionCode||!firebaseLoginEmail(username))
    return setAccountManagerStatus("Cần nhập/chọn đủ Mã nhân viên, Họ tên, Tài khoản, Phòng, Nhóm/chức năng và Chức danh.",true);

  const reserved=new Set(["AD","ĐH","DH","CBTT","PVHK","LNF","LOSTFOUND","KH","VIEWER","PĐH","ADMIN"]);
  if(reserved.has(username))return setAccountManagerStatus("Không dùng tên tài khoản "+username+" vì trùng mã hệ thống.",true);

  let secApp=null,secAuth=null,authUser=null,profileWritten=false,newUid="";
  try{
    const users=firebase.firestore().collection("users");
    const [sameUser,sameCode]=await Promise.all([
      users.where("username","==",username).get(),
      users.where("employeeCode","==",employeeCode).get()
    ]);

    const foreignEmployeeOwner=sameCode.docs.find(doc=>{
      const d=doc.data()||{};
      return d.active===true && normalizePersonalUsername(d.username||"")!==username;
    });
    if(foreignEmployeeOwner){
      const d=foreignEmployeeOwner.data()||{};
      return setAccountManagerStatus("Mã nhân viên "+employeeCode+" đang thuộc tài khoản "+normalizePersonalUsername(d.username||"khác")+".",true);
    }

    const repairProfiles=sameUser.docs.filter(doc=>{
      const d=doc.data()||{};
      return normalizeFirebaseOperationalRole(d.role)!=="AD" && String(doc.id)!==String(currentUserProfile?.firebaseUid||"");
    });

    setAccountManagerStatus(
      repairProfiles.length
        ?"Phát hiện "+repairProfiles.length+" hồ sơ E-REPORT cũ của "+username+". Đang tạo Firebase Authentication thật và thay hồ sơ cũ..."
        :"Đang tạo Firebase Authentication mới cho "+username+"..."
    );

    secApp=firebase.initializeApp(firebase.app().options,"sags-create-v6493-"+Date.now());
    secAuth=secApp.auth();
    const fresh=await v6492CreateFreshAuth(secAuth,username);
    authUser=fresh.user;newUid=String(authUser.uid);

    const now=Date.now(),profile={
      active:true,email:fresh.email,username,employeeCode,name,role:storedRole,roleCode,
      departmentCode:dep,groupCode:group,systemDepartment:dep,positionCode,jobTitle,unit,workUnit:unit,
      mustChangePassword:true,featureOverridesV485:{},permissionRoleV485:role,permissionRevV485:now,
      createdAtMs:now,updatedAtMs:now,createdByUid:String(currentUserProfile?.firebaseUid||currentUserProfile?.uid||""),
      authMode:fresh.slot===0?"FIREBASE_100":"FIREBASE_SLOT_V6492",authSlot:fresh.slot,
      repairedFromProfiles:repairProfiles.map(x=>x.id),repairedAtMs:repairProfiles.length?now:0
    };
    await users.doc(newUid).set(profile,{merge:false});profileWritten=true;

    const verify=await users.doc(newUid).get(),vd=verify.data()||{};
    if(!verify.exists||vd.active!==true||normalizePersonalUsername(vd.username||"")!==username||String(vd.email||"").toLowerCase()!==fresh.email)
      throw new Error("Firebase users/{UID} chưa xác nhận đúng hồ sơ vừa tạo.");

    if(repairProfiles.length){
      const batch=firebase.firestore().batch();
      repairProfiles.forEach(doc=>{if(doc.id!==newUid)batch.delete(users.doc(doc.id))});
      await batch.commit();
    }

    try{
      const legacy=initHandoverFirebase().collection(HANDOVER_COLLECTION).doc(personalUserDocId(username)),oldLegacy=await legacy.get();
      if(oldLegacy.exists&&oldLegacy.data()?.kind===PERSONAL_USER_KIND)await legacy.delete();
    }catch(e){console.info("V6.4.93 legacy cleanup",e?.message||e)}

    try{
      if(typeof sagsV470Ref==="function")await sagsV470Ref("account_permissions/"+sagsV470Safe(username)).set({
        rev:now,updatedAtMs:now,source:repairProfiles.length?"ORPHAN_PROFILE_REPAIR_V6493":"ACCOUNT_CREATE_V6493"
      });
    }catch(_){}

    ["admEmployeeCode","admFullName","admUsername","admJobTitle"].forEach(id=>{const x=document.getElementById(id);if(x)x.value=""});
    v18InitAccountUi();
    setAccountManagerStatus(
      "✓ ĐÃ "+(repairProfiles.length?"SỬA VÀ TẠO LẠI":"TẠO")+" "+username+
      " · Firebase Auth thật: "+fresh.email+
      " · UID "+newUid+
      " · mật khẩu ban đầu 123456."
    );
    await refreshAccountManager();
  }catch(e){
    if(authUser){
      try{if(profileWritten&&newUid)await firebase.firestore().collection("users").doc(newUid).delete()}catch(_){}
      try{await authUser.delete()}catch(_){}
    }
    setAccountManagerStatus("Không tạo/sửa được tài khoản: "+String(e?.message||e),true);
  }finally{
    try{await secAuth?.signOut()}catch(_){}
    try{await secApp?.delete()}catch(_){}
  }
};
root.adminCreatePersonalAccount=adminCreatePersonalAccount;
})(window);
