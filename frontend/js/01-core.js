/* =========================================================================
   HALKA KAAM · 01 · Core (rebuilt — phone-first, bilingual, location-step)
   Storage: localStorage demo mode (swap for api.js to use the backend).
   ========================================================================= */
'use strict';

/* ---------- storage adapter ---------- */
const DB = {
  mem: {},
  available: (() => { try { localStorage.setItem('__hk','1'); localStorage.removeItem('__hk'); return true; } catch (e) { return false; } })(),
  async get(key) { if (this.available) { try { const r = localStorage.getItem(key); if (r != null) return JSON.parse(r); } catch (e) {} } return this.mem[key] ?? null; },
  async set(key, val) { this.mem[key] = val; if (this.available) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} } }
};

/* ---------- constants ---------- */
const CATS = ['Pick-up / Delivery','Moving Help','Tech Support','Home Cleaning','Quick Tutoring','Gardening','Errands / Other'];
const CATICON = {'Pick-up / Delivery':'📦','Moving Help':'🛋️','Tech Support':'💻','Home Cleaning':'🧹','Quick Tutoring':'📘','Gardening':'🌿','Errands / Other':'🛍️'};
const KIRTIPUR = { lat: 27.6789, lng: 85.2774 };
const AREAS = [
  { name: 'Kathmandu', ne: 'काठमाडौं', lat: 27.7172, lng: 85.3240 },
  { name: 'Kirtipur',  ne: 'कीर्तिपुर', lat: 27.6789, lng: 85.2774 },
  { name: 'Patan',     ne: 'पाटन', lat: 27.6731, lng: 85.3250 },
  { name: 'Bhaktapur', ne: 'भक्तपुर', lat: 27.6710, lng: 85.4298 },
  { name: 'Pokhara',   ne: 'पोखरा', lat: 28.2096, lng: 83.9856 },
  { name: 'Butwal',    ne: 'बुटवल', lat: 27.7006, lng: 83.4484 },
];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- state ---------- */
const S = {
  lang: 'en',
  view: 'langpick',
  me: null, users: [], jobs: [],
  pos: { ...KIRTIPUR },
  locName: '', locSet: false,
  mode: 'worker', tab: 'feed',
  radius: 4, cat: 'All',
  detailJobId: null, inboxJobId: null, chatCtx: null,
  authIntent: null, form: null, rv: { a: 0, b: 0, c: 0 },
  locTmp: null, _phone: '', _name: '', _area: '',
};

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const npr = n => 'रु ' + Number(n).toLocaleString('en-IN');
const starsHtml = r => { const f = Math.round(r); return '★'.repeat(f) + '☆'.repeat(5 - f); };
const COLORS = ['#DC143C','#003893','#1F8A5F','#A36A00','#6B4ABF','#0E7490','#B0307A'];
const avColor = n => COLORS[(n || '?').charCodeAt(0) % COLORS.length];
const initials = n => (n || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const timeAgo = ts => { const m = Math.floor((Date.now() - ts) / 60000); if (m < 1) return 'now'; if (m < 60) return m + 'm'; const h = Math.floor(m/60); if (h < 24) return h + 'h'; return Math.floor(h/24) + 'd'; };
function haversineKm(a, b) { const R=6371,d=Math.PI/180; const dLat=(b.lat-a.lat)*d,dLng=(b.lng-a.lng)*d; const s=Math.sin(dLat/2)**2+Math.cos(a.lat*d)*Math.cos(b.lat*d)*Math.sin(dLng/2)**2; return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s)); }
let toastTimer = null;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }
function openSheet(html) { $('sheetinner').innerHTML = html; $('sheetwrap').classList.add('open'); }
function closeSheet() { $('sheetwrap').classList.remove('open'); destroyMap('sheetmap'); }

const userById = id => S.users.find(u => u.id === id);
function ratingOf(userId, role) {
  const u = userById(userId); let sum = (u?.baseRating||0)*(u?.baseCount||0), n = u?.baseCount||0;
  for (const j of S.jobs) {
    if (role === 'worker') { const r = j.reviews?.hostToWorker, w = j.bids.find(b => b.id === j.assignedBidId); if (r && w?.workerId === userId) { sum += r.stars; n++; } }
    else { const r = j.reviews?.workerToHost; if (r && j.hostId === userId) { sum += r.stars; n++; } }
  }
  return { avg: n ? sum/n : 0, count: n };
}
function reviewsOf(userId, role) {
  const out = [];
  for (const j of S.jobs) {
    if (role === 'worker') { const w = j.bids.find(b => b.id === j.assignedBidId); if (j.reviews?.hostToWorker && w?.workerId === userId) out.push({ from: userById(j.hostId)?.name||'', role:'host', job:j.title, ...j.reviews.hostToWorker }); }
    else { if (j.reviews?.workerToHost && j.hostId === userId) { const w = j.bids.find(b => b.id === j.assignedBidId); out.push({ from: userById(w?.workerId)?.name||'', role:'worker', job:j.title, ...j.reviews.workerToHost }); } }
  }
  return out.reverse();
}

/* ---------- persistence ---------- */
const saveJobs = () => DB.set('hk-jobs-v2', S.jobs);
const saveUsers = () => DB.set('hk-users-v2', S.users);
const saveSession = () => DB.set('hk-session-v2', S.me ? { id: S.me.id, lang: S.lang } : null);

/* ---------- seed ---------- */
function makeSeed() {
  const mk = (name, campus, br, bc, bio) => ({ id: 'seed-'+name.toLowerCase().replace(/[^a-z]/g,''), name, phone:'', campus, bio, baseRating:br, baseCount:bc, isBot:true, created: Date.now()-90*864e5 });
  const users = [
    mk('Sunita Gurung','Kirtipur',4.8,23,'Homemaker. I post small household tasks weekly.'),
    mk('Ramesh Karki','Balkhu',4.5,11,'Shop owner near Balkhu chowk.'),
    mk('Anita Shrestha','New Baneshwor',5.0,8,'Frequent delivery tasks.'),
    mk('Bikash Thapa','TU Gate',4.7,15,'Looking for student tutors.'),
    mk('Prakriti Maharjan','Patan',4.9,31,'Cleaning and gardening gigs around Patan.'),
    mk('Kiran Bista','Pulchowk Campus',4.9,34,'Engineering student · moving & assembly. 34 gigs done!'),
    mk('Dipesh Maharjan','Kirtipur',4.6,12,'BBS student, part-time at a hardware shop.'),
    mk('Sarita KC','Tribhuvan University',5.0,8,'My brother and I take moving jobs together.'),
    mk('Roshan Tamang','TU Gate',4.2,5,'New to HK — building my rating.'),
    mk('Pratiksha Sharma','Patan Campus',4.9,21,'CSIT student · laptop repair, tutoring.'),
    mk('Anish Gautam','Kirtipur',4.7,9,'BSc student, free most afternoons.'),
  ];
  const J = (host,title,cat,type,price,pt,lat,lng,addr,when,desc,emo,hrs,bids=[]) => ({
    id: uid(), hostId:'seed-'+host.toLowerCase().replace(/[^a-z]/g,''), title, cat, type, price, ptype:pt,
    lat, lng, address:addr, when, desc, photos:[], emoji:emo, status:'open', assignedBidId:null, featured:false,
    createdAt: Date.now()-hrs*36e5, reviews:{},
    bids: bids.map(b => ({ id:uid(), workerId:'seed-'+b[0].toLowerCase().replace(/[^a-z]/g,''), amount:b[1], pitch:b[2], status:'pending', chat:[], createdAt: Date.now()-hrs*30e5 }))
  });
  const jobs = [
    J('Sunita Gurung','Need help moving study tables to 3rd floor','Moving Help','In-person',800,'Flat',27.6801,85.2810,'Naya Bazar, Kirtipur','Today, 4–6 PM','Two study tables and a bookshelf from ground floor to 3rd floor (no lift). Under an hour. Water and chiya provided!',['🪑','🪜'],3,[['Kiran Bista',750,'Namaste! Engineering student at Pulchowk, I live 10 min away. Done 6 moving gigs — can bring a friend.'],['Roshan Tamang',700,'New but strong and punctual. Willing to do it for a bit less to build my rating.']]),
    J('Ramesh Karki','Fix slow laptop before exam week','Tech Support','In-person',300,'Hourly',27.6855,85.2980,'Balkhu Chowk','Tomorrow morning','Old laptop takes 10 min to boot. Needs cleanup, maybe an SSD. Looking for a CSIT student.',['💻'],6,[['Pratiksha Sharma',300,'CSIT student — I do laptop tune-ups weekly. Will bring a bootable USB.']]),
    J('Anita Shrestha','Pick up parcel from Baneshwor & drop in Kirtipur','Pick-up / Delivery','In-person',450,'Flat',27.6915,85.3420,'New Baneshwor','Today, before 7 PM','Small box (~3 kg) at a shop in New Baneshwor → Naya Bazar, Kirtipur. Need your own scooter/cycle.',['📦','🛵'],2,[['Anish Gautam',450,'I ride that route daily. Can pick up within the hour.'],['Dipesh Maharjan',430,'Careful with packages, know both areas well.']]),
    J('Bikash Thapa','Grade 8 maths tutoring, 2 sessions/week','Quick Tutoring','In-person',600,'Hourly',27.6822,85.2865,'Near TU Gate','Flexible evenings','Daughter needs algebra and geometry help. Patient student tutor, twice a week near TU gate.',['📘','✏️'],10,[['Sarita KC',600,'I tutor two other Grade 8 students. Patient, with weekly progress notes.']]),
    J('Prakriti Maharjan','Deep-clean 2BHK flat before house-warming','Home Cleaning','In-person',1500,'Flat',27.6730,85.3250,'Patan, Mangal Bazar','Saturday morning','Sweep + mop, windows, kitchen. Supplies provided. Two people may bid together.',['🧹','🪟'],20,[['Sarita KC',1400,'My brother and I clean as a pair — 2BHK in 3 hours. Covers both.'],['Roshan Tamang',1300,'Thorough. Cleaned my hostel common room last week.']]),
    J('Prakriti Maharjan','Trim hedge & clear leaves, small garden','Gardening','In-person',700,'Flat',27.6620,85.2890,'Chobhar','This weekend','Small front garden. Trimmer available, bring energy. 2–3 hours.',['🌿','🍂'],26,[]),
    J('Ramesh Karki','Format & proofread BBA assignment','Tech Support','Virtual',350,'Flat',27.6855,85.2980,'Online','Within 2 days','12-page Word doc needs APA formatting, references, grammar pass. Remote.',['📄','✅'],8,[['Pratiksha Sharma',350,'APA is my comfort zone. Quick turnaround with tracked changes.']]),
    J('Bikash Thapa','Carry cement bags to rooftop (15 bags)','Moving Help','In-person',1200,'Flat',27.6840,85.2840,'Panga Road, Kirtipur','Sunday morning','15 bags (50 kg) from gate to rooftop, 2 floors. Two helpers ideal — bid per person.',['🧱','🏠'],5,[['Kiran Bista',1100,'Done 6 cement gigs. Can bring a friend to finish in an hour.'],['Dipesh Maharjan',1200,'I work at a hardware shop, used to cement. Free Sunday, start 7 AM.'],['Sarita KC',1000,'My brother and I take heavy jobs together — covers both.'],['Roshan Tamang',950,'Strong and punctual. Bidding lower to earn first reviews.']]),
  ];
  return { users, jobs };
}

/* ---------- boot ---------- */
async function boot() {
  let users = await DB.get('hk-users-v2'), jobs = await DB.get('hk-jobs-v2');
  if (!users || !users.length || !jobs) { const s = makeSeed(); users = s.users; jobs = s.jobs; await DB.set('hk-users-v2', users); await DB.set('hk-jobs-v2', jobs); }
  S.users = users; S.jobs = jobs;
  const sess = await DB.get('hk-session-v2');
  if (sess?.id) { const me = S.users.find(u => u.id === sess.id); if (me) { S.me = me; S.lang = sess.lang || 'en'; document.documentElement.lang = S.lang; show('locstep'); renderLocStep(); return; } }
  show('langpick'); renderLangpick();
}
function show(view) { S.view = view; ['langpick','landing','auth','locstep','app'].forEach(v => $(v).classList.toggle('hidden', v !== view)); window.scrollTo(0,0); }

/* ---------- language ---------- */
function setLang(l) { S.lang = l; document.documentElement.lang = l; if (S.view === 'langpick') { show('landing'); renderLanding(); } else renderAll(); }
function toggleLang() { setLang(S.lang === 'en' ? 'ne' : 'en'); }
function renderAll() {
  if (S.view === 'landing') renderLanding();
  else if (S.view === 'auth') renderAuth();
  else if (S.view === 'locstep') renderLocStep();
  else if (S.view === 'app') { buildShell(); applyMode(); render(); }
}

/* ---------- language picker ---------- */
function renderLangpick() {
  $('langpick').innerHTML = `
    <div class="pennants"><i></i><i></i></div>
    <div class="wordmark"><span class="h">हल्का</span> <span class="k">काम</span></div>
    <div class="tagline">No work is too small · कुनै काम सानो हुँदैन</div>
    <div class="choose">Choose language · भाषा छान्नुहोस्</div>
    <button class="langbtn" onclick="setLang('ne')"><span class="flag">🇳🇵</span> नेपाली</button>
    <button class="langbtn" onclick="setLang('en')"><span class="flag">🌐</span> English</button>`;
}

/* ---------- landing ---------- */
function renderLanding() {
  $('landing').innerHTML = `
    <div>
      <div class="lhead">
        <div class="brand"><div class="pennants"><i></i><i></i></div>
          <div class="wordmark" style="font-size:var(--fs-lg)"><span class="h">हल्का</span> <span class="k">काम</span></div></div>
        <button class="lang-switch" onclick="toggleLang()">${t('other_lang')}</button>
      </div>
      <div class="hero">
        <div class="wordmark"><span class="h">हल्का</span> <span class="k">काम</span></div>
        <p class="lead">${t('land_lead')}</p>
      </div>
    </div>
    <div class="rolecards">
      <button class="rolecard host" onclick="goAuth('host')">
        <div class="ic">🏠</div><div><b>${t('land_need_help')}</b><span>${t('land_need_help_sub')}</span></div><div class="arrow">›</div></button>
      <button class="rolecard worker" onclick="goAuth('worker')">
        <div class="ic">🎒</div><div><b>${t('land_want_work')}</b><span>${t('land_want_work_sub')}</span></div><div class="arrow">›</div></button>
    </div>
    <p class="foot">हल्का काम, ठूलो सम्मान 🇳🇵</p>`;
}

/* ---------- auth ---------- */
let authStep = 1;
function goAuth(intent) { S.authIntent = intent || null; authStep = 1; show('auth'); renderAuth(); }
function renderAuth() {
  const a = $('auth');
  if (authStep === 1) {
    a.innerHTML = `
      <div class="brand"><div class="pennants"><i></i><i></i></div>
        <div class="wordmark"><span class="h">हल्का</span> <span class="k">काम</span></div></div>
      <h1>${t('welcome')}</h1>
      <p class="sub">${t('auth_sub')}</p>
      <div class="field"><label>${t('full_name')}</label><input type="text" id="au-name" placeholder="${t('name_ph')}" value="${esc(S._name)}"></div>
      <div class="field"><label>${t('mobile')}</label><input type="tel" id="au-phone" placeholder="${t('mobile_ph')}" maxlength="10" inputmode="numeric" value="${esc(S._phone)}"></div>
      <div class="field"><label>${t('area_opt')}</label><input type="text" id="au-area" placeholder="${t('area_ph')}" value="${esc(S._area)}"></div>
      <button class="btn btn-primary btn-lg" onclick="sendOtp()">${t('send_code')}</button>
      <p class="changelink" onclick="show('landing');renderLanding()">${t('back')}</p>`;
  } else {
    a.innerHTML = `
      <div class="brand"><div class="pennants"><i></i><i></i></div>
        <div class="wordmark"><span class="h">हल्का</span> <span class="k">काम</span></div></div>
      <h1>${t('enter_code')}</h1>
      <p class="sub">${t('code_sent_to')} <b>+977 ${esc(S._phone)}</b></p>
      <div class="otp-note">📱 ${t('demo_otp')}</div>
      <div class="field"><label>${t('otp_label')}</label><input type="text" id="au-otp" placeholder="••••••" maxlength="6" inputmode="numeric"></div>
      <button class="btn btn-primary btn-lg" onclick="verifyOtp()">${t('verify')}</button>
      <p class="changelink" onclick="authStep=1;renderAuth()">${t('change_number')}</p>`;
  }
}
function sendOtp() {
  const name = $('au-name').value.trim(), phone = $('au-phone').value.trim();
  if (name.length < 3) { toast(t('full_name')); return; }
  if (!/^9[78]\d{8}$/.test(phone)) { toast('98XXXXXXXX'); return; }
  S._phone = phone; S._name = name; S._area = $('au-area').value.trim();
  authStep = 2; renderAuth(); $('au-otp').focus();
}
async function verifyOtp() {
  const code = $('au-otp').value.trim();
  if (!/^\d{6}$/.test(code)) { toast(t('otp_label')); return; }
  let me = S.users.find(u => u.phone === S._phone);
  if (!me) { me = { id: uid(), name: S._name, phone: S._phone, campus: S._area, bio:'', baseRating:0, baseCount:0, isBot:false, created: Date.now() }; S.users.push(me); await saveUsers(); }
  S.me = me; await saveSession();
  S.locTmp = null; show('locstep'); renderLocStep();
}
async function logout() { S.me = null; S.locSet = false; await saveSession(); closeSheet(); show('langpick'); renderLangpick(); }

/* =========================================================================
   LOCATION STEP (its own screen)
   ========================================================================= */
function renderLocStep() {
  S.locTmp = S.locTmp || { pos: { ...S.pos }, name: '', radius: S.radius || 4, picked: true };
  S.locTmp.picked = true;
  show('locstep');
  $('locstep').innerHTML = `
    <div class="loc-shell">
      <div class="loc-head">
        <div class="top"><button class="backbtn" onclick="goAuth(S.authIntent)">‹</button>
          <button class="lang-switch" style="margin-left:auto" onclick="toggleLang()">${t('other_lang')}</button></div>
        <h1>${t('where_title')}</h1>
        <p class="sub">${t('where_sub')}</p>
      </div>

      <div class="loc-main">
        <!-- MARKETPLACE-STYLE MAP: fixed centered circle, pan to move, zoom/slider for radius -->
        <div class="mappick">
          <div id="locmap" class="mappick-map"></div>
          <div class="mappick-ring" id="locring"><span class="dot"></span></div>
          <div class="mappick-hint">${t('drag_hint')}</div>
        </div>

        <div class="loc-controls">
          <button class="locopt" onclick="useMyLocation()">
            <div class="ic">📍</div><div><b>${t('use_my_loc')}</b><span>${t('use_my_loc_sub')}</span></div></button>
          <div id="locstatus"></div>

          <div class="distbox">
            <div class="row"><b>${t('how_far')}</b><span class="val" id="distval">${S.locTmp.radius} km</span></div>
            <input type="range" id="distslider" min="1" max="15" step="1" value="${S.locTmp.radius}" oninput="onSlider(+this.value)">
            <div class="distmarks"><span>1 km</span><span>7 km</span><span>15 km</span></div>
          </div>

          <div class="pick-area-label">${t('pick_area')}</div>
          <div class="catgrid" id="arealist">
            ${AREAS.map((ar,i) => `<button class="catcell ${S.locTmp.name===(S.lang==='ne'?ar.ne:ar.name)?'on':''}" onclick="pickArea(${i})"><div class="ic">🏙️</div>${S.lang==='ne'?ar.ne:ar.name}</button>`).join('')}
          </div>

          <button class="btn btn-primary btn-lg loc-apply" onclick="confirmLocation()">${t('apply_loc')} ›</button>
        </div>
      </div>
    </div>`;
  setTimeout(mountLocMap, 60);
}

/* ---------- the marketplace map widget ----------
   The circle is a FIXED overlay in the centre of the map (#locring).
   Panning moves the map under it (centre = map centre).
   Radius (km) is derived from how many km that fixed circle spans at the
   current zoom — so zooming OUT increases km, zooming IN decreases km.
   The slider sets the zoom needed to hit a target km, keeping them in sync. */
const LOC = { map:null, ringPx:0 };
function ringRadiusPx() {
  const r = $('locring'); if (!r) return 90;
  return r.getBoundingClientRect().width / 2 || 90;
}
function kmFromZoom() {
  const m = LOC.map; if (!m) return S.locTmp.radius;
  const c = m.getCenter();
  const cp = m.latLngToContainerPoint(c);
  const edge = m.containerPointToLatLng([cp.x, cp.y - LOC.ringPx]);
  return haversineKm({lat:c.lat,lng:c.lng}, {lat:edge.lat,lng:edge.lng});
}
function zoomForKm(km) {
  // invert: find the fractional zoom so the fixed ring spans `km`
  const m = LOC.map, c = m.getCenter();
  // metres per pixel at current zoom & latitude, then solve for target
  const mppNow = 40075016.686 * Math.cos(c.lat * Math.PI/180) / Math.pow(2, m.getZoom() + 8);
  const targetMpp = (km * 1000) / LOC.ringPx;
  return m.getZoom() + Math.log2(mppNow / targetMpp);
}
function syncFromMap() {
  if (!LOC.map) return;
  const km = Math.max(1, Math.min(15, Math.round(kmFromZoom())));
  S.locTmp.radius = km;
  const dv = $('distval'), ds = $('distslider');
  if (dv) dv.textContent = km + ' km';
  if (ds) ds.value = km;
  S.locTmp.pos = { lat: LOC.map.getCenter().lat, lng: LOC.map.getCenter().lng };
}
function mountLocMap() {
  const el = $('locmap'); if (!el || typeof L === 'undefined') return;
  destroyMap('locmap');
  const map = L.map('locmap', { zoomControl:true, scrollWheelZoom:true, zoomSnap:0, attributionControl:true })
    .setView([S.locTmp.pos.lat, S.locTmp.pos.lng], 13);
  LOC.map = map; MAPS['locmap'] = map; tiles().addTo(map);
  LOC.ringPx = ringRadiusPx();
  // set initial zoom so the ring matches the starting radius
  try { map.setZoom(zoomForKm(S.locTmp.radius)); } catch (e) {}
  map.on('move zoom', syncFromMap);
  map.on('moveend zoomend', syncFromMap);
  setTimeout(() => { try { map.invalidateSize(); LOC.ringPx = ringRadiusPx(); map.setZoom(zoomForKm(S.locTmp.radius)); syncFromMap(); } catch(e){} }, 80);
  S.locTmp.picked = true;
}
function onSlider(km) {
  S.locTmp.radius = km;
  const dv = $('distval'); if (dv) dv.textContent = km + ' km';
  if (LOC.map) { try { LOC.map.setZoom(zoomForKm(km), { animate:false }); syncFromMap(); } catch(e){} }
}
function useMyLocation() {
  const st = $('locstatus'); st.className = 'locstatus'; st.textContent = '⏳ ' + t('locating');
  if (!navigator.geolocation) { st.className = 'locstatus err'; st.textContent = t('loc_denied'); return; }
  navigator.geolocation.getCurrentPosition(
    p => { S.locTmp.pos = { lat: p.coords.latitude, lng: p.coords.longitude }; S.locTmp.name = t('your_location'); S.locTmp.picked = true;
      document.querySelectorAll('#arealist .catcell').forEach(c => c.classList.remove('on'));
      st.className = 'locstatus ok'; st.textContent = '✓ ' + t('loc_found');
      if (LOC.map) LOC.map.setView([S.locTmp.pos.lat, S.locTmp.pos.lng], LOC.map.getZoom()); },
    () => { const s2 = $('locstatus'); s2.className = 'locstatus err'; s2.textContent = '⚠️ ' + t('loc_denied'); },
    { timeout: 8000, enableHighAccuracy: true });
}
function pickArea(i) {
  const ar = AREAS[i]; S.locTmp.pos = { lat: ar.lat, lng: ar.lng }; S.locTmp.name = S.lang==='ne'?ar.ne:ar.name; S.locTmp.picked = true;
  document.querySelectorAll('#arealist .catcell').forEach((c,k) => c.classList.toggle('on', k===i));
  const st = $('locstatus'); st.className = 'locstatus ok'; st.textContent = '✓ ' + (S.lang==='ne'?ar.ne:ar.name);
  if (LOC.map) LOC.map.setView([ar.lat, ar.lng], LOC.map.getZoom());
}
function confirmLocation() {
  if (!S.locTmp.picked) { toast(t('where_sub')); return; }
  S.pos = { ...S.locTmp.pos }; S.locName = S.locTmp.name || t('your_location'); S.radius = S.locTmp.radius; S.locSet = true;
  destroyMap('locmap'); LOC.map = null;
  enterApp();
}
function changeLocation() { S.locTmp = { pos:{...S.pos}, name:S.locName, radius:S.radius, picked:true }; renderLocStep(); }

/* =========================================================================
   APP SHELL
   ========================================================================= */
function enterApp() {
  S.mode = S.authIntent === 'host' ? 'host' : 'worker';
  S.tab = S.mode === 'host' ? 'jobs' : 'feed';
  show('app'); buildShell(); applyMode(); render();
}
function isDesktop() { return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 900px)').matches; }
function navItems() {
  if (S.mode === 'worker') return [
    { tab:'feed',  on:S.tab==='feed', ic:'🧭', label:t('nav_find') },
    { tab:'bids',  on:['bids','wchat'].includes(S.tab), ic:'🤝', label:t('nav_pitches') },
    { tab:'profile', on:S.tab==='profile', ic:'👤', label:t('nav_profile') } ];
  return [
    { tab:'jobs',  on:['jobs','inbox','hchat'].includes(S.tab), ic:'🗂️', label:t('nav_myjobs') },
    { tab:'post',  on:S.tab==='post', ic:'➕', label:t('nav_post'), accent:true },
    { tab:'profile', on:S.tab==='profile', ic:'👤', label:t('nav_profile') } ];
}
function buildShell() {
  document.body.classList.toggle('is-desktop', isDesktop());
  if (isDesktop()) buildDesktopShell(); else buildMobileShell();
}
function buildMobileShell() {
  $('app').innerHTML = `
    <div class="phasebar">🎉 ${t('free_phase')}</div>
    <header class="appbar">
      <div class="wordmark" onclick="logoTap()"><span class="h">हल्का</span> <span class="k">काम</span></div>
      <button class="loc-btn" onclick="changeLocation()"><span class="pin">📍</span>
        <span class="txt">${esc(S.locName || (S.radius+' km'))}</span> ▾</button>
      <div class="av av-sm" onclick="gotoProfile()" style="background:${avColor(S.me.name)}">${initials(S.me.name)}</div>
    </header>
    <div class="modebar">
      <div class="modetoggle">
        <div class="pill"></div>
        <button id="m-worker" onclick="setMode('worker')"><span class="ic">🎒</span>${t('mode_work')}</button>
        <button id="m-host" onclick="setMode('host')"><span class="ic">🏠</span>${t('mode_host')}</button>
      </div>
    </div>
    <main id="screen"></main>
    <nav class="bottomnav" id="bottomnav"></nav>`;
}
function buildDesktopShell() {
  $('app').innerHTML = `
    <aside class="rail">
      <div class="rail-brand" onclick="logoTap()"><div class="pennants"><i></i><i></i></div>
        <div class="wordmark"><span class="h">हल्का</span> <span class="k">काम</span></div></div>
      <div class="rail-modetoggle modetoggle">
        <div class="pill"></div>
        <button id="m-worker" onclick="setMode('worker')"><span class="ic">🎒</span>${t('mode_work')}</button>
        <button id="m-host" onclick="setMode('host')"><span class="ic">🏠</span>${t('mode_host')}</button>
      </div>
      <nav class="rail-nav" id="railnav"></nav>
      <div class="rail-spacer"></div>
      <button class="rail-loc" onclick="changeLocation()"><span class="pin">📍</span>
        <span><b>${esc(S.locName || t('your_location'))}</b><small>${t('within')} ${S.radius} km · ${t('change')}</small></span></button>
      <button class="rail-user" onclick="gotoProfile()">
        <div class="av av-sm" style="background:${avColor(S.me.name)}">${initials(S.me.name)}</div>
        <span>${esc(S.me.name)}</span>
        <button class="rail-lang" onclick="event.stopPropagation();toggleLang()">${t('other_lang')}</button></button>
    </aside>
    <div class="maincol">
      <div class="phasebar">🎉 ${t('free_phase')}</div>
      <main id="screen"></main>
    </div>`;
}
function logoTap() { S.tab = S.mode === 'worker' ? 'feed' : 'jobs'; render(); }
function gotoProfile() { S.tab = 'profile'; render(); }
function applyMode() {
  document.body.classList.toggle('mode-host', S.mode === 'host');
  document.body.classList.toggle('mode-worker', S.mode === 'worker');
  const w = $('m-worker'), h = $('m-host'); if (w && h) { w.classList.toggle('on', S.mode==='worker'); h.classList.toggle('on', S.mode==='host'); }
}
function setMode(m) { S.mode = m; S.tab = m === 'worker' ? 'feed' : 'jobs'; applyMode(); render(); }
function setTab(t2) { S.tab = t2; render(); }

/* ---------- maps (radius circle ALWAYS fit in frame) ---------- */
const MAPS = {};
function destroyMap(id) { if (MAPS[id]) { try { MAPS[id].remove(); } catch (e) {} delete MAPS[id]; } }
function tiles() { return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }); }
function pin(label, me) { return L.divIcon({ className:'hk-pin', html:`<div class="pinbox ${me?'me':''}">${esc(label)}</div>`, iconSize:[0,0] }); }

/* ---------- nav + router ---------- */
function renderNav() {
  const items = navItems();
  const rail = $('railnav');
  if (rail) { // desktop
    rail.innerHTML = items.map(it =>
      `<button class="rail-item ${it.on?'on':''} ${it.accent?'accent':''}" onclick="${it.tab==='post'?'startPost()':`setTab('${it.tab}')`}">
        <span class="ic">${it.ic}</span><span class="lbl">${it.label}</span></button>`).join('');
    return;
  }
  const bn = $('bottomnav'); if (!bn) return; // mobile
  if (S.mode === 'worker') {
    bn.innerHTML = items.map(it =>
      `<button class="${it.on?'on':''}" onclick="setTab('${it.tab}')"><span class="ic">${it.ic}</span>${it.label}</button>`).join('');
  } else {
    bn.innerHTML = `
      <button class="${['jobs','inbox','hchat'].includes(S.tab)?'on':''}" onclick="setTab('jobs')"><span class="ic">🗂️</span>${t('nav_myjobs')}</button>
      <div class="fabwrap"><button class="fab" onclick="startPost()">＋</button></div>
      <button class="${S.tab==='profile'?'on':''}" onclick="setTab('profile')"><span class="ic">👤</span>${t('nav_profile')}</button>`;
  }
}
function render() {
  if (S.view !== 'app') return;
  if (!$('screen') || (isDesktop() !== document.body.classList.contains('is-desktop'))) { buildShell(); applyMode(); }
  renderNav(); destroyMap('postmap');
  const sc = $('screen'); if (!sc) return;
  if (S.mode === 'worker') {
    if (S.tab === 'feed') { sc.innerHTML = viewFeed(); }
    else if (S.tab === 'bids') sc.innerHTML = viewMyPitches();
    else if (S.tab === 'wchat') sc.innerHTML = viewWorkerChat();
    else sc.innerHTML = viewProfile(S.me.id, 'worker', true);
  } else {
    if (S.tab === 'jobs') sc.innerHTML = viewHostJobs();
    else if (S.tab === 'post') { sc.innerHTML = viewPost(); mountPostMap(); }
    else if (S.tab === 'inbox') sc.innerHTML = viewInbox();
    else if (S.tab === 'hchat') sc.innerHTML = viewHostChat();
    else sc.innerHTML = viewProfile(S.me.id, 'host', true);
  }
  sc.scrollTop = 0;
}
/* rebuild shell when crossing the desktop/mobile breakpoint */
if (typeof window !== 'undefined' && window.matchMedia) {
  let _wasDesktop = isDesktop();
  window.addEventListener('resize', () => {
    const now = isDesktop();
    if (now !== _wasDesktop) { _wasDesktop = now; if (S.view === 'app') { buildShell(); applyMode(); render(); } }
  });
}
