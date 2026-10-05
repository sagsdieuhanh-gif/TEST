/* Reference presentation. Existing menu buttons remain the permission/action authority. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const brand = '<b>E-REPORT <em>SAGS</em></b><small>AIRPORT GROUND OPERATIONS</small>';
  let pending = false, overviewKey = '';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  async function overview() {
    const host = $('opsHomeFlights'), metrics = $('opsHomeMetrics');
    if (!host) return;
    let session;
    try { session = window.__sagsGetSession?.(); } catch (_) { return; }
    const user = session?.profile;
    if (!document.body.classList.contains('v157-authenticated') || !user?.firebaseUid) {
      if (overviewKey) { overviewKey = ''; host.textContent = 'Các chuyến được phân qua Daily Roster sẽ xuất hiện tại đây.'; metrics.replaceChildren(); }
      return;
    }
    if (!document.body.classList.contains('v157-home')) return;
    const api = window.__SAGS_DAILY_ROSTER_FINAL_V1199;
    if (!api?.readOverview) return;
    const date = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const key = user.firebaseUid + ':' + date;
    if (overviewKey === key) return;
    overviewKey = key; host.textContent = 'Đang tải chuyến bay...'; metrics.replaceChildren();
    try {
      const {groups} = await api.readOverview(date);
      if (overviewKey !== key) return;
      const complete = groups.filter(g => g.flightClosed).length;
      const working = groups.filter(g => !g.flightClosed && g.items.some((item,i) => api.itemWorking(item,g.states[i]))).length;
      metrics.innerHTML = [['Chuyến đang làm',working],['Hoàn tất hôm nay',complete],['Chờ xử lý',groups.length-complete-working]].map(([label,count]) => '<div><small>'+label+'</small><strong>'+count+'</strong></div>').join('');
      if (!groups.length) { host.textContent = 'Chưa có chuyến được phân công hôm nay.'; return; }
      host.innerHTML = '<table><thead><tr><th>Giờ</th><th>Chuyến bay</th><th>Chặng bay</th><th>Đăng bạ</th><th>Trạng thái</th><th>Biểu mẫu</th><th></th></tr></thead><tbody>' + groups.map(g => {
        const flight = g.primary || {}, forms = api.visibleFormTasks(g);
        const status = g.flightClosed ? '✓ Hoàn tất' : g.items.some((x,i) => api.itemWorking(x,g.states[i])) ? 'Đang làm' : 'Chờ xử lý';
        return '<tr><td>'+safe(flight.std || flight.sta || '—')+'</td><td><b>'+safe(api.flightLabel(flight) || '—')+'</b></td><td>'+safe(flight.route || '—')+'</td><td>'+safe(flight.acReg || '—')+'</td><td><span class="opsStatus">'+safe(status)+'</span></td><td>'+forms.map(x => safe(api.formLabel(x.item))).join(' · ')+'</td><td><button type="button" data-ops-route="myflight">Mở →</button></td></tr>';
      }).join('') + '</tbody></table>';
    } catch (_) {
      if (overviewKey === key) host.innerHTML = '<p>Không tải được dữ liệu chuyến bay.</p><button type="button" data-ops-retry>Thử lại</button>';
    }
  }
  function route(key) {
    const target = document.querySelector('.v157MenuItem[data-v157-key="' + key + '"]');
    if (target && !target.disabled && !target.hidden && target.style.display !== 'none') target.click();
  }
  function sync() {
    const login = $('roleLoginModal');
    if (login && !login.querySelector('.opsReferenceBrand')) {
      const heading = document.createElement('div');
      heading.className = 'opsReferenceBrand'; heading.innerHTML = brand;
      login.prepend(heading);
      const card = login.querySelector('.roleLoginCard');
      const strap = document.createElement('p'); strap.className = 'opsLoginStrap';
      strap.textContent = 'AN TOÀN · HIỆU QUẢ · CHUYÊN NGHIỆP'; card?.append(strap);
      $('personalLoginUser')?.setAttribute('aria-label', 'Tên đăng nhập');
      $('roleLoginPass')?.setAttribute('aria-label', 'Mật khẩu');
    }
    const shell = $('v6494AviationHome');
    if (!shell) return;
    const scroll = shell.querySelector('.v6494Scroll');
    if (!$('opsHomeMetrics')) {
      const metrics = document.createElement('div'); metrics.id = 'opsHomeMetrics';
      scroll.querySelector('.v6494Hero')?.insertAdjacentElement('afterend', metrics);
    }
    if (!$('opsHomeQueue')) {
      const queue = document.createElement('section'); queue.id = 'opsHomeQueue';
      queue.innerHTML = '<div class="opsQueueHead"><h2>Danh sách chuyến bay hôm nay</h2><button type="button" data-ops-retry>Làm mới</button></div><div id="opsHomeFlights">Các chuyến được phân qua Daily Roster sẽ xuất hiện tại đây.</div><button type="button" data-ops-route="myflight">Mở My Flight →</button>';
      scroll.append(queue);
    }
    void overview();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-ops-route], [data-ops-retry]');
    if (!button) return;
    if (button.hasAttribute('data-ops-retry')) { overviewKey = ''; void overview(); return; }
    route(button.dataset.opsRoute);
  });
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; sync(); }); }
  function resetOverview(){ overviewKey=''; schedule(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, {once: true}); else schedule();
  window.addEventListener('pageshow', schedule, {passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()},{passive:true});
  window.addEventListener('sags:personal-roster-updated',resetOverview);
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#roleLoginSubmit,[data-v6494-key],[data-ops-route],[data-ops-retry],#v479MyFlightHome,.fwcHead button'))setTimeout(schedule,0);
  },true);
  setTimeout(schedule,350);setTimeout(schedule,1400);
})();
