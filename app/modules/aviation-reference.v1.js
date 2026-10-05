/* E-REPORT SAGS V6.4.100 · Reference home: airline identity + aligned console.
   Existing menu buttons and Daily Roster remain the business/permission authority. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const brand = '<b>E-REPORT <em>SAGS</em></b><small>AIRPORT GROUND OPERATIONS</small>';
  const CARRIER_GUIDE = './data/carrier-service-guide.json';
  const AIRLINE_LOGO_BASE = 'https://images.kiwi.com/airlines/64/';
  let pending = false, overviewKey = '', carrierPromise = null, logoObserver = null;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const U = value => String(value ?? '').trim().toUpperCase();
  function normalizeCarrier(raw) {
    return U(raw).replace(/[^A-Z0-9/]/g,'');
  }
  async function loadCarriers() {
    if (carrierPromise) return carrierPromise;
    carrierPromise = fetch(CARRIER_GUIDE, {cache:'force-cache'})
      .then(r => { if (!r.ok) throw new Error('carrier-guide-'+r.status); return r.json(); })
      .then(data => {
        const carriers = Array.isArray(data?.carriers) ? data.carriers : [];
        return carriers.map(row => {
          const carrier = normalizeCarrier(row?.carrier);
          const aliases = [...new Set((Array.isArray(row?.aliases) ? row.aliases : carrier.split('/')).map(normalizeCarrier).filter(Boolean))];
          return {carrier, aliases: aliases.length ? aliases : [carrier]};
        }).filter(x => x.carrier && x.aliases.length);
      }).catch(() => []);
    return carrierPromise;
  }
  function logoUrl(code) {
    code = normalizeCarrier(code);
    return code ? AIRLINE_LOGO_BASE + encodeURIComponent(code) + '.png' : '';
  }
  function airlineAlias(flightLabel, carriers) {
    const raw = U(flightLabel).replace(/[s-]+/g,'');
    const aliases = [];
    for (const row of carriers || []) for (const alias of row.aliases || []) aliases.push(alias);
    aliases.sort((a,b) => b.length - a.length);
    return aliases.find(alias => raw.startsWith(alias)) || '';
  }
  function logoHtml(code, cls='') {
    const c = normalizeCarrier(code);
    if (!c) return '<span class="opsAirlineFallback '+safe(cls)+'">—</span>';
    return '<span class="opsAirlineMark '+safe(cls)+'"><img class="opsAirlineLogo" src="'+safe(logoUrl(c))+'" alt="'+safe(c)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="opsAirlineFallback" hidden>'+safe(c)+'</span></span>';
  }
  function lazyLogoHtml(code) {
    const c = normalizeCarrier(code);
    return '<span class="opsAirlineMark"><img class="opsAirlineLogo" data-src="'+safe(logoUrl(c))+'" alt="'+safe(c)+'" decoding="async" referrerpolicy="no-referrer"><span class="opsAirlineFallback">'+safe(c)+'</span></span>';
  }
  function setupLogoObserver() {
    if (logoObserver || !('IntersectionObserver' in window)) return;
    logoObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target, src = img.dataset.src;
        if (src) { img.src = src; delete img.dataset.src; }
        logoObserver.unobserve(img);
      }
    }, {rootMargin:'180px'});
  }
  function observeLazyLogos(root=document) {
    setupLogoObserver();
    root.querySelectorAll?.('.opsAirlineLogo[data-src]').forEach(img => {
      if (logoObserver) logoObserver.observe(img);
      else { img.src = img.dataset.src; delete img.dataset.src; }
    });
  }
  function carrierStripHtml(carriers) {
    return '<div class="opsAirlineStripTrack">' + carriers.map(row => {
      const logos = row.aliases.slice(0,2).map(lazyLogoHtml).join('');
      return '<div class="opsAirlineChip" title="'+safe(row.carrier)+'"><span class="opsAirlineChipLogos">'+logos+'</span><b>'+safe(row.carrier)+'</b></div>';
    }).join('') + '</div>';
  }
  async function renderCarrierStrip() {
    const host = $('opsAirlineStrip'); if (!host || host.dataset.ready === '1') return;
    const carriers = await loadCarriers(); if (!host.isConnected) return;
    host.innerHTML = carriers.length ? carrierStripHtml(carriers) : '<div class="opsAirlineStripEmpty">Chưa tải được nhận diện hãng.</div>';
    host.dataset.ready = '1'; observeLazyLogos(host);
  }
  function statusClass(status) {
    return /HOÀN TẤT/i.test(status) ? 'complete' : /ĐANG LÀM/i.test(status) ? 'working' : 'pending';
  }
  async function overview() {
    const host = $('opsHomeFlights'), metrics = $('opsHomeMetrics');
    if (!host || !metrics) return;
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
      const [{groups}, carriers] = await Promise.all([api.readOverview(date), loadCarriers()]);
      if (overviewKey !== key) return;
      const complete = groups.filter(g => g.flightClosed).length;
      const working = groups.filter(g => !g.flightClosed && g.items.some((item,i) => api.itemWorking(item,g.states[i]))).length;
      metrics.innerHTML = [['Chuyến đang làm',working],['Hoàn tất hôm nay',complete],['Chờ xử lý',Math.max(0,groups.length-complete-working)]].map(([label,count]) => '<div><small>'+label+'</small><strong>'+count+'</strong></div>').join('');
      if (!groups.length) { host.textContent = 'Chưa có chuyến được phân công hôm nay.'; return; }
      host.innerHTML = '<div class="opsFlightTableWrap"><table><thead><tr><th>Giờ</th><th>Hãng</th><th>Chuyến bay</th><th>Chặng bay</th><th>Đăng bạ</th><th>Trạng thái</th><th>Biểu mẫu</th><th aria-label="Thao tác"></th></tr></thead><tbody>' + groups.map(g => {
        const flight = g.primary || {}, forms = api.visibleFormTasks(g);
        const label = api.flightLabel(flight) || '—';
        const alias = airlineAlias(label, carriers);
        const status = g.flightClosed ? 'Hoàn tất' : g.items.some((x,i) => api.itemWorking(x,g.states[i])) ? 'Đang làm' : 'Chờ xử lý';
        return '<tr><td class="opsTime">'+safe(flight.std || flight.sta || '—')+'</td><td class="opsAirlineCell">'+logoHtml(alias,'opsTableLogo')+'</td><td class="opsFlightNo"><b>'+safe(label)+'</b></td><td>'+safe(flight.route || '—')+'</td><td>'+safe(flight.acReg || '—')+'</td><td><span class="opsStatus opsStatus-'+statusClass(status)+'">'+safe(status)+'</span></td><td class="opsForms">'+forms.map(x => safe(api.formLabel(x.item))).join(' · ')+'</td><td class="opsOpenCell"><button type="button" data-ops-route="myflight">Mở</button></td></tr>';
      }).join('') + '</tbody></table></div>';
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
    const scroll = shell.querySelector('.v6494Scroll'), hero = scroll?.querySelector('.v6494Hero');
    if (!$('opsAirlineStrip') && hero) {
      const strip = document.createElement('section'); strip.id = 'opsAirlineStrip'; strip.setAttribute('aria-label','Các hãng trong Lưu ý phục vụ hãng');
      hero.insertAdjacentElement('afterend', strip);
      void renderCarrierStrip();
    }
    if (!$('opsHomeMetrics')) {
      const metrics = document.createElement('div'); metrics.id = 'opsHomeMetrics';
      const anchor = $('opsAirlineStrip') || hero;
      anchor?.insertAdjacentElement('afterend', metrics);
    }
    if (!$('opsHomeQueue')) {
      const queue = document.createElement('section'); queue.id = 'opsHomeQueue';
      queue.innerHTML = '<div class="opsQueueHead"><div><small>HÔM NAY</small><h2>Danh sách chuyến bay hôm nay</h2></div><button type="button" data-ops-retry>Làm mới</button></div><div id="opsHomeFlights">Các chuyến được phân qua Daily Roster sẽ xuất hiện tại đây.</div>';
      scroll.append(queue);
    }
    void renderCarrierStrip(); void overview();
  }
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('opsAirlineLogo')) return;
    img.hidden = true;
    const fallback = img.nextElementSibling; if (fallback) fallback.hidden = false;
  }, true);
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
  setTimeout(schedule,350); setTimeout(schedule,1400);
})();