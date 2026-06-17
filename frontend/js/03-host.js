/* =========================================================================
   HALKA KAAM · 03 · Host views — my tasks, post, inbox, assign, chat, bots
   ========================================================================= */

function viewHostJobs() {
  const mine = S.jobs.filter(j => j.hostId === S.me.id).sort((a,b) => b.createdAt - a.createdAt);
  if (!mine.length) return `<div class="shead"><h2>${t('nav_myjobs')}</h2></div>
    <div class="empty"><div class="big">🗂️</div><b>${t('nav_myjobs')}</b><p>${t('land_need_help_sub')}</p>
    <div style="margin-top:20px"><button class="btn btn-primary btn-lg" onclick="startPost()">＋ ${t('post_title')}</button></div></div>`;
  return `<div class="shead"><h2>${t('nav_myjobs')}</h2></div>` + mine.map(j => {
    const off = j.bids.length;
    return `<div class="jobcard ${j.featured?'featured':''}" onclick="openInbox('${j.id}')">
      <div class="top"><h3>${esc(j.title)}</h3><div class="jc-price"><div class="amt">${npr(j.price)}</div><div class="per">${j.ptype==='Hourly'?t('hourly'):t('flat')}</div></div></div>
      <div class="meta"><span class="tag cat">${CATICON[j.cat]} ${catName(j.cat)}</span>
        <span class="status ${j.status==='open'?'st-open':j.status==='assigned'?'st-assigned':'st-done'}">
          ${j.status==='open'?t('only_host_sees'):j.status==='assigned'?t('in_progress')+' · '+esc(assignedName(j)):t('completed')+' ✓'}</span></div>
      <div class="applied">📥 ${off} ${off===1?t('offers_inbox_one'):t('offers_inbox')} ›</div></div>`;
  }).join('');
}
function assignedName(j) { const b = j.bids.find(x => x.id === j.assignedBidId); return userById(b?.workerId)?.name || '—'; }

/* ---------- POST a job ---------- */
function startPost() { if (S.mode !== 'host') setMode('host'); S.form = { cat:'Moving Help', type:'In-person', ptype:'Flat', photos:[], lat:S.pos.lat, lng:S.pos.lng, title:'', desc:'', address:'', date:'', time:'', price:'' }; S.tab='post'; render(); }
function captureForm() { if (!S.form) return; const g = id => $(id)?.value; S.form.title=g('f-title')??S.form.title; S.form.desc=g('f-desc')??S.form.desc; S.form.address=g('f-addr')??S.form.address; S.form.date=g('f-date')??S.form.date; S.form.time=g('f-time')??S.form.time; S.form.price=g('f-price')??S.form.price; }
function fset(k,v) { captureForm(); S.form[k]=v; render(); }
function viewPost() {
  const f = S.form;
  return `<div class="backrow"><button class="backbtn" onclick="setTab('jobs')">‹</button><h2>${t('post_title')}</h2></div>
    <div class="field"><label>${t('f_what')}</label><input type="text" id="f-title" value="${esc(f.title)}" placeholder="${t('f_what_ph')}"></div>
    <div class="field"><label>${t('f_category')}</label>
      <div class="catgrid">${CATS.map(c => `<button class="catcell ${f.cat===c?'on':''}" onclick="fset('cat','${c}')"><div class="ic">${CATICON[c]}</div>${catName(c)}</button>`).join('')}</div></div>
    <div class="field"><label>${t('f_where')}</label>
      <div class="choices">
        <button class="choice ${f.type==='In-person'?'on':''}" onclick="fset('type','In-person')"><span class="ic">📍</span>${t('f_inperson')}</button>
        <button class="choice ${f.type==='Virtual'?'on':''}" onclick="fset('type','Virtual')"><span class="ic">🌐</span>${t('f_online')}</button></div></div>
    ${f.type==='In-person'?`<div class="field"><div class="map" id="postmap" style="height:200px"></div>
      <div class="maphint">${t('f_pin')} · ${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}</div>
      <input type="text" id="f-addr" value="${esc(f.address)}" placeholder="${t('f_address_ph')}" style="margin-top:10px"></div>`:''}
    <div class="field"><label>${t('f_when')}</label>
      <div class="choices"><input type="date" id="f-date" value="${esc(f.date)}"><input type="time" id="f-time" value="${esc(f.time)}"></div></div>
    <div class="field"><label>${t('f_desc')}</label><textarea id="f-desc" placeholder="${t('f_desc_ph')}">${esc(f.desc)}</textarea></div>
    <div class="field"><label>${t('f_photos')}</label>
      <div class="photos">
        ${f.photos.map((p,i) => `<div class="photo-slot filled"><img src="${p}"><button class="rm" onclick="S.form.photos.splice(${i},1);captureForm();render()">✕</button></div>`).join('')}
        ${f.photos.length<3?`<label class="photo-slot">＋<input type="file" accept="image/*" class="hidden" onchange="addPhoto(this)"></label>`:''}</div></div>
    <div class="field"><label>${t('f_price_type')}</label>
      <div class="choices">
        <button class="choice ${f.ptype==='Flat'?'on':''}" onclick="fset('ptype','Flat')">${t('flat')}</button>
        <button class="choice ${f.ptype==='Hourly'?'on':''}" onclick="fset('ptype','Hourly')">${t('hourly')}</button></div></div>
    <div class="field"><label>${t('f_price')}</label><input type="number" id="f-price" value="${esc(f.price)}" placeholder="${t('f_amount_ph')}" min="50" step="10" inputmode="numeric"></div>
    <button class="btn btn-primary btn-lg" onclick="publishJob()">${t('publish')}</button>
    <p style="text-align:center;font-size:var(--fs-sm);color:var(--slate);margin-top:12px">${t('free_phase')}</p>`;
}
function mountPostMap() {
  const el = $('postmap'); if (!el || typeof L === 'undefined') return;
  const map = L.map('postmap').setView([S.form.lat, S.form.lng], 15); MAPS['postmap']=map; tiles().addTo(map);
  let marker = L.marker([S.form.lat,S.form.lng],{ icon:pin('📍'), draggable:true }).addTo(map);
  const upd = ll => { S.form.lat=ll.lat; S.form.lng=ll.lng; const h = el.parentElement.querySelector('.maphint'); if (h) h.textContent = `${t('f_pin')} · ${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`; };
  map.on('click', e => { marker.setLatLng(e.latlng); upd(e.latlng); });
  marker.on('dragend', () => upd(marker.getLatLng()));
  setTimeout(() => { try { map.invalidateSize(); } catch(e){} }, 60);
}
function addPhoto(input) {
  const file = input.files && input.files[0]; if (!file) return;
  const img = new Image();
  img.onload = () => { const max=360, sc=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc); c.getContext('2d').drawImage(img,0,0,c.width,c.height); captureForm(); S.form.photos.push(c.toDataURL('image/jpeg',0.6)); URL.revokeObjectURL(img.src); render(); };
  img.src = URL.createObjectURL(file);
}
async function publishJob() {
  captureForm(); const f = S.form;
  if (!f.title.trim()) { toast(t('need_title')); return; }
  if (!(+f.price > 0)) { toast(t('need_price')); return; }
  const when = [f.date, f.time].filter(Boolean).join(' · ') || (S.lang==='ne'?'लचिलो':'Flexible');
  const j = { id:uid(), hostId:S.me.id, title:f.title.trim(), cat:f.cat, type:f.type, price:+f.price, ptype:f.ptype, lat:f.lat, lng:f.lng,
    address: f.type==='Virtual'?'Online':(f.address.trim()||'Pinned'), when, desc:f.desc.trim()||'—', photos:f.photos, emoji:[], status:'open', assignedBidId:null, featured:false, createdAt:Date.now(), reviews:{}, bids:[] };
  S.jobs.unshift(j); await saveJobs(); S.form=null; S.tab='jobs'; render(); toast(t('posted_ok'));
  scheduleBotBids(j);
}
function scheduleBotBids(j) {
  const bots = S.users.filter(u => u.isBot && u.id !== j.hostId).sort(() => Math.random()-.5).slice(0,3);
  const pitches = [ n => 'Namaste! I study nearby and I am free at your time. Please check my reviews. 🙏',
                    n => `I have done ${n} similar gigs on Halka Kaam. I can bring my own tools and I am punctual.`,
                    n => 'I live in your area and can start on time. Fair price, good quality work.' ];
  bots.forEach((bot,k) => setTimeout(async () => {
    const job = S.jobs.find(x => x.id === j.id); if (!job || job.status !== 'open') return;
    if (job.bids.some(b => b.workerId === bot.id)) return;
    const amount = Math.max(50, Math.round(job.price*(0.85+Math.random()*0.25)/10)*10);
    job.bids.push({ id:uid(), workerId:bot.id, amount, pitch:pitches[k%3](bot.baseCount||5), status:'pending', chat:[], createdAt:Date.now() });
    await saveJobs(); toast('🔔 ' + (S.lang==='ne'?'नयाँ प्रस्ताव':'New offer') + ' · ' + (job.title.length>22?job.title.slice(0,22)+'…':job.title));
    if (S.view==='app') render();
  }, 3000 + k*4500));
}

/* ---------- inbox ---------- */
function openInbox(id) { S.inboxJobId = id; S.tab='inbox'; render(); }
function viewInbox() {
  const j = S.jobs.find(x => x.id === S.inboxJobId); if (!j) { S.tab='jobs'; return viewHostJobs(); }
  let banner = '';
  if (j.status === 'done') {
    const r = j.reviews?.hostToWorker;
    banner = `<div class="infobox green"><span class="ic">✅</span><span><b>${t('completed')} · ${esc(assignedName(j))}.</b></span></div>
      ${r?`<div class="pubreview"><div class="who">${esc(S.me.name)} → ${esc(assignedName(j))} · <span class="stars">${'★'.repeat(r.stars)}</span></div><div class="txt">${esc(r.txt||'')}</div></div>`:''}`;
  } else if (j.status === 'assigned') {
    banner = `<div class="infobox amber"><span class="ic">🛠️</span><span><b>${esc(assignedName(j))} · ${t('in_progress')}.</b></span></div>
      <div class="btnrow" style="margin-bottom:14px"><button class="btn btn-green" onclick="openWorkerReview('${j.id}')">${t('mark_done')}</button>
      <button class="btn btn-danger" style="flex:0 0 auto;min-width:54px" onclick="openReport('${j.id}')">⚠️</button></div>`;
  } else {
    banner = `<div class="infobox blue"><span class="ic">📥</span><span><b>${j.bids.length} ${j.bids.length===1?t('offers_inbox_one'):t('offers_inbox')}.</b> ${t('only_you_see')}</span></div>
      ${!j.featured?`<button class="btn btn-ghost" style="margin-bottom:14px" onclick="featureJob('${j.id}')">★ ${t('feature_post')} · <span style="color:var(--green);font-weight:700">${t('free_phase').split('·')[0]}</span></button>`:''}`;
  }
  const cards = j.bids.length ? j.bids.slice().sort((a,b) => a.amount-b.amount).map(b => offerCard(j,b)).join('')
    : `<div class="empty"><div class="big">⏳</div><b>${t('waiting')}</b><p>${t('no_jobs_sub')}</p></div>`;
  return `<div class="backrow"><button class="backbtn" onclick="setTab('jobs')">‹</button><h2>${esc(j.title)}</h2></div>${banner}${cards}`;
}
function offerCard(j, b) {
  const w = userById(b.workerId), wr = ratingOf(b.workerId,'worker');
  const isAssigned = j.assignedBidId === b.id, locked = j.assignedBidId && !isAssigned;
  return `<div class="offer" style="${locked?'opacity:.55':''}">
    <div class="head">
      <div class="av av-md" style="background:${avColor(w?.name)}">${initials(w?.name)}</div>
      <div><div class="nm" onclick="openProfileSheet('${b.workerId}','worker')">${esc(w?.name)} ${isAssigned?`<span class="chosenchip">${t('chosen')}</span>`:''}</div>
      <div class="sub"><span class="stars">${starsHtml(wr.avg)}</span> ${wr.avg?wr.avg.toFixed(1):t('new_helper')} · ${wr.count} ${t('reviews')}</div></div>
      <div class="amt"><b>${npr(b.amount)}</b><span>${t('private_bid')}</span></div></div>
    <div class="pitch">"${esc(b.pitch)}"</div>
    ${locked?`<span class="lockchip">🔒 ${t('chat_locked')}</span>`
      : j.status==='done'?''
      : isAssigned?`<div class="btnrow"><button class="btn btn-ghost" onclick="openHChat('${j.id}','${b.id}')">💬 ${t('open_chat')}</button></div>`
      : `<div class="btnrow"><button class="btn btn-ghost" onclick="initChat('${j.id}','${b.id}')">${b.chat.length?'💬 '+t('continue_chat'):'💬 '+t('start_chat')}</button>
         <button class="btn btn-primary" onclick="assignWorker('${j.id}','${b.id}')">${t('choose')}</button></div>`}</div>`;
}
async function featureJob(id) { const j = S.jobs.find(x => x.id === id); j.featured = true; await saveJobs(); render(); toast('★'); }
async function initChat(jobId, bidId) {
  const j = S.jobs.find(x => x.id === jobId), b = j.bids.find(x => x.id === bidId);
  if (!b.chat.length && b.status !== 'chat') { b.status='chat'; const w = userById(b.workerId);
    if (w?.isBot) b.chat.push({ from:b.workerId, txt:'Namaste! Thank you for the message 🙏 Happy to answer anything.', t:Date.now() });
    await saveJobs(); toast(t('poster_started')); }
  openHChat(jobId, bidId);
}
function openHChat(jobId, bidId) { S.chatCtx = { jobId, bidId }; S.tab='hchat'; render(); }
function viewHostChat() {
  const j = S.jobs.find(x => x.id === S.chatCtx.jobId), b = j?.bids.find(x => x.id === S.chatCtx.bidId);
  if (!j || !b) { S.tab='jobs'; return viewHostJobs(); }
  const w = userById(b.workerId);
  return `<div class="backrow"><button class="backbtn" onclick="openInbox('${j.id}')">‹</button><h2>${esc(w?.name)} · ${npr(b.amount)}</h2></div>
    <div class="chatwrap"><div class="chatnote">${t('you_started')}</div>
    <div class="chatlog">${b.chat.map(m => `<div class="bubble ${m.from===S.me.id?'me':'them'}">${esc(m.txt)}<span class="tm">${timeAgo(m.t)}</span></div>`).join('')}</div>
    <div class="chatbar"><input id="chat-in" placeholder="${t('type_msg')}" onkeydown="if(event.key==='Enter')sendChat('host')"><button onclick="sendChat('host')">➤</button></div></div>`;
}
async function assignWorker(jobId, bidId) { const j = S.jobs.find(x => x.id === jobId); j.assignedBidId = bidId; j.status='assigned'; await saveJobs(); toast(assignedName(j)+' · '+t('chosen')+' 🔒'); render(); }
