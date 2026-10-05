let sagsFirebaseFunctionsSdkPromise=null;
window.sagsEnsureFirebaseFunctionsSdk=function(){
 if(typeof window.firebase?.functions==='function')return Promise.resolve(true);
 if(sagsFirebaseFunctionsSdkPromise)return sagsFirebaseFunctionsSdkPromise;
 sagsFirebaseFunctionsSdkPromise=new Promise((resolve,reject)=>{
   const src='https://www.gstatic.com/firebasejs/10.14.1/firebase-functions-compat.js';
   let script=document.querySelector('script[data-sags-firebase-functions-lazy="1"]');
   const ready=()=>{if(typeof window.firebase?.functions==='function')resolve(true);else{script?.remove();sagsFirebaseFunctionsSdkPromise=null;reject(new Error('Firebase Functions SDK chưa khởi tạo.'))}};
   const failed=()=>{script?.remove();sagsFirebaseFunctionsSdkPromise=null;reject(new Error('Không tải được Firebase Functions SDK.'))};
   if(script){script.addEventListener('load',ready,{once:true});script.addEventListener('error',failed,{once:true});return}
   script=document.createElement('script');script.src=src;script.async=true;script.dataset.sagsFirebaseFunctionsLazy='1';script.addEventListener('load',ready,{once:true});script.addEventListener('error',failed,{once:true});document.head.appendChild(script);
 });
 return sagsFirebaseFunctionsSdkPromise;
};
window.adminResetAccountPassword=async function(uid){if(currentRole!=="AD")return roleDenied("Chỉ AD được khôi phục mật khẩu.");const snap=await firebase.firestore().collection("users").doc(uid).get();if(!snap.exists)return alert("Không tìm thấy hồ sơ tài khoản.");const d=snap.data()||{},name=String(d.name||d.username||d.email||uid);if(!confirm("KHÔI PHỤC MẬT KHẨU AUTH\n\n"+name+"\n\nMật khẩu sẽ về 123456, tài khoản được mở lại và bắt buộc đổi mật khẩu khi đăng nhập.\n\nKhông xóa Firebase Authentication. Tiếp tục?"))return;try{setAccountManagerStatus("Đang khôi phục Firebase Authentication cho "+name+"...");await window.sagsEnsureFirebaseFunctionsSdk();const call=firebase.app().functions("asia-southeast1").httpsCallable("adminResetAuthPassword");await call({uid:String(uid)});setAccountManagerStatus("✓ Đã khôi phục AUTH cho "+name+". Mật khẩu: 123456.");alert("ĐÃ KHÔI PHỤC AUTH\n\nTài khoản: "+name+"\nMật khẩu tạm: 123456\n\nNgười dùng phải đổi mật khẩu khi đăng nhập.");await refreshAccountManager()}catch(e){const msg=String(e?.message||e);setAccountManagerStatus("Không khôi phục được AUTH: "+msg,true);alert("KHÔNG KHÔI PHỤC ĐƯỢC AUTH\n\n"+msg+"\n\nKiểm tra Cloud Function adminResetAuthPassword đã được deploy.")}};
