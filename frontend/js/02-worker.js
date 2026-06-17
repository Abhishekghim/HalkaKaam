/* =========================================================================
   HALKA KAAM · 02 · Worker views — feed, job detail, private offer, chat
   ========================================================================= */

function visibleJobs() {
  return S.jobs
    .filter(j => j.status === 'open' && j.hostId !== S.me.id)
    .filter(j => j.type === 'Virtual' || haversineKm(S.pos, j) <= S.radius)
    .filter(j => S.cat === 'All' || j.cat === S.cat)
    .sort((a,b) => (b.featured - a.featured) || (b.createdAt - a.createdAt));
}

function viewFeed() {
  const jobs = visibleJobs();
  return `
    <div class="shead"><div><h2>${t('near_you')}</h2></div></div>
    <button class="locsum" onclick="changeLocation()">
      <span class="locsum-pin">📍</span>
      <span class="locsum-txt"><b>${esc(S.locName || t('your_location'))}</b><span>${t('showing_within')} ${S.radius} km</span></span>
      <span class="locsum-edit">${t('change')} ›</span>
    </button>
    <div class="chips">
      <button class="chip ${S.cat==='All'?'on':''}" onclick="S.cat='All';render()">${S.lang==='ne'?'सबै':'All'}</button>
      ${CATS.map(c => `<button class="chip ${S.cat===c?'on':''}" onclick="S.cat='${c}';render()">${CATICON[c]} ${catName(c)}</button>`).join('')}
    </div>
    ${jobs.length ? `<div class="jobs-grid">${jobs.map(jobCard).join('')}</div>` :
      `<div class="empty"><div class="big">🔭</div><b>${t('no_jobs')}</b><p>${t('no_jobs_sub')}</p>
       <div style="margin-top:18px"><button class="btn btn-outline" onclick="changeLocation()">${t('widen')}</button></div></div>`}`;
}

function jobCard(j) {
  const dist = j.type === 'Virtual' ? null : haversineKm(S.pos, j);
  const mine = j.bids.some(b => b.workerId === S.me.id);
  return `<div class="jobcard ${j.featured?'featured':''}" onclick="openJobDetail('${j.id}')">
    <div class="top"><h3>${esc(j.title)}</h3>
      <div class="jc-price"><div class="amt">${npr(j.price)}</div><div class="per">${j.ptype==='Hourly'?t('hourly'):t('flat')}</div></div></div>
    <div class="meta">
      ${j.featured?`<span class="feat-chip">★</span>`:''}
      <span class="tag cat">${CATICON[j.cat]} ${catName(j.cat)}</span>
      <span class="tag dist">${j.type==='Virtual'?'🌐 '+t('virtual'):'📍 '+dist.toFixed(1)+' km'}</span>
      <span class="tag">🗓 ${esc(j.when)}</span>
    </div>
    <div class="applied"><span class="lock">🔒</span>
      ${j.bids.length} ${j.bids.length===1?t('applied_one'):t('applied_count')}
      ${mine?`<span class="you">${t('you_offered')}</span>`:''}</div>
  </div>`;
}

/* FIXED map: fit bounds to the radius circle so it never disappears */
/* (feed no longer embeds a map — location is chosen on the dedicated
   "Where are you?" screen with the marketplace-style picker.) */

function photoStrip(j) {
  const imgs = (j.photos||[]).map(p => `<img src="${p}" alt="">`).join('');
  const emo = (j.emoji||[]).map(e => `<div class="emo">${e}</div>`).join('');
  return (imgs||emo) ? `<div class="pstrip">${imgs}${emo}</div>` : '';
}

function openJobDetail(id) {
  const j = S.jobs.find(x => x.id === id); if (!j) return;
  const host = userById(j.hostId), hr = ratingOf(j.hostId, 'host');
  const dist = j.type === 'Virtual' ? null : haversineKm(S.pos, j);
  const mine = j.bids.find(b => b.workerId === S.me.id);
  openSheet(`
    <h2>${esc(j.title)}</h2>
    <div class="meta" style="margin-top:10px">
      <span class="tag cat">${CATICON[j.cat]} ${catName(j.cat)}</span>
      <span class="tag dist">${j.type==='Virtual'?'🌐 '+t('virtual'):'📍 '+dist.toFixed(1)+' km · '+esc(j.address)}</span>
      <span class="tag">🗓 ${esc(j.when)}</span></div>
    ${photoStrip(j)}
    <p class="desc">${esc(j.desc)}</p>
    ${j.type!=='Virtual'?`<div class="map" id="sheetmap" style="height:160px"></div>`:''}
    <div class="personrow" onclick="openProfileSheet('${j.hostId}','host')" style="margin-top:14px">
      <div class="av av-md" style="background:${avColor(host?.name)}">${initials(host?.name)}</div>
      <div><div class="nm">${esc(host?.name)}</div>
      <div class="rt"><span class="stars">${starsHtml(hr.avg)}</span> ${hr.avg.toFixed(1)} · ${hr.count} ${t('reviews')} · ${t('tap_profile')}</div></div></div>
    <div class="infobox blue"><span class="ic">🔒</span><span><b>${j.bids.length} ${j.bids.length===1?t('applied_one'):t('applied_count')}.</b> ${t('offer_private')}</span></div>
    ${mine
      ? `<button class="btn btn-green" disabled>✓ ${t('offer_sent')} (${npr(mine.amount)})</button>`
      : `<button class="btn btn-primary btn-lg" onclick="openOfferForm('${j.id}')">${t('make_offer')}</button>`}`);
  if (j.type !== 'Virtual') setTimeout(() => {
    const el = $('sheetmap'); if (!el || typeof L === 'undefined') return; destroyMap('sheetmap');
    const m = L.map('sheetmap', { scrollWheelZoom:false, dragging:false, zoomControl:false }).setView([j.lat,j.lng],15);
    MAPS['sheetmap'] = m; tiles().addTo(m); L.marker([j.lat,j.lng],{icon:pin('📍')}).addTo(m);
    setTimeout(() => { try { m.invalidateSize(); } catch(e){} }, 50);
  }, 60);
}

function openOfferForm(id) {
  const j = S.jobs.find(x => x.id === id), host = userById(j.hostId);
  openSheet(`
    <h2>${t('make_offer')}</h2>
    <p class="desc">${t('offer_private')}</p>
    <div class="field"><label>${t('your_offer')} (रु${j.ptype==='Hourly'?' / '+t('hourly'):''})</label>
      <input type="number" id="bid-amt" value="${j.price}" min="50" step="10" inputmode="numeric"></div>
    <div class="field"><label>${t('your_pitch')}</label>
      <textarea id="bid-txt" placeholder="${t('pitch_ph')}"></textarea></div>
    <button class="btn btn-primary btn-lg" onclick="submitOffer('${j.id}')">${t('send_offer')} 🔒</button>`);
}
async function submitOffer(id) {
  const j = S.jobs.find(x => x.id === id);
  const amt = Math.max(50, +($('bid-amt').value || j.price));
  const txt = $('bid-txt').value.trim();
  if (!txt) { toast(t('your_pitch')); return; }
  j.bids.push({ id: uid(), workerId: S.me.id, amount: amt, pitch: txt, status:'pending', chat:[], createdAt: Date.now() });
  await saveJobs(); closeSheet(); toast(t('offer_sent') + ' 🔒'); render();
}

/* ---------- my offers ---------- */
function myPitchList() { const out = []; for (const j of S.jobs) for (const b of j.bids) if (b.workerId === S.me.id) out.push({ j, b }); return out.sort((x,y) => y.b.createdAt - x.b.createdAt); }
function pitchStatus(j, b) { if (j.assignedBidId === b.id) return j.status === 'done' ? 'done' : 'assigned'; if (j.assignedBidId) return 'locked'; return (b.chat.length || b.status === 'chat') ? 'chat' : 'pending'; }
function viewMyPitches() {
  const list = myPitchList();
  if (!list.length) return `<div class="shead"><h2>${t('my_offers')}</h2></div><div class="empty"><div class="big">🤝</div><b>${t('my_offers')}</b><p>${t('no_jobs_sub')}</p></div>`;
  return `<div class="shead"><h2>${t('my_offers')}</h2></div>` + list.map(({j,b}) => {
    const st = pitchStatus(j,b), host = userById(j.hostId);
    const canChat = ['chat','assigned','done'].includes(st);
    const needReview = st === 'done' && !j.reviews?.workerToHost;
    return `<div class="jobcard" onclick="${canChat?`openWChat('${j.id}','${b.id}')`:`openJobDetail('${j.id}')`}">
      <div class="top"><h3>${esc(j.title)}</h3><div class="jc-price"><div class="amt">${npr(b.amount)}</div><div class="per">${t('your_offer')}</div></div></div>
      <div class="meta"><span class="tag">${t('poster')}: ${esc(host?.name)}</span>
        ${st==='pending'?`<span class="tag">⏳ ${t('waiting')}</span>`:''}
        ${st==='chat'?`<span class="tag dist">💬 ${t('poster_replied')}</span>`:''}
        ${st==='assigned'?`<span class="status st-assigned">✓ ${t('you_assigned')}</span>`:''}
        ${st==='locked'?`<span class="tag">🔒 ${t('not_chosen')}</span>`:''}
        ${st==='done'?`<span class="status st-done">✓ ${t('completed')}</span>`:''}</div>
      ${needReview?`<div style="margin-top:12px"><button class="btn btn-primary" onclick="event.stopPropagation();openHostReview('${j.id}')">⭐ ${t('review_host')}</button></div>`:''}
    </div>`;
  }).join('') + `<div class="infobox blue"><span class="ic">ℹ️</span><span>${t('cannot_msg_first')}</span></div>`;
}
function openWChat(jobId, bidId) { S.chatCtx = { jobId, bidId }; S.tab = 'wchat'; render(); }
function viewWorkerChat() {
  const j = S.jobs.find(x => x.id === S.chatCtx.jobId), b = j?.bids.find(x => x.id === S.chatCtx.bidId);
  if (!j || !b) { S.tab = 'bids'; return viewMyPitches(); }
  const host = userById(j.hostId), locked = j.assignedBidId && j.assignedBidId !== b.id;
  return `<div class="backrow"><button class="backbtn" onclick="setTab('bids')">‹</button><h2>${esc(host?.name)}</h2></div>
    <div class="chatwrap"><div class="chatnote">💬 ${t('poster_started')}</div>
    <div class="chatlog">${b.chat.map(m => `<div class="bubble ${m.from===S.me.id?'me':'them'}">${esc(m.txt)}<span class="tm">${timeAgo(m.t)}</span></div>`).join('')}</div>
    ${locked?`<div class="chatnote">🔒 ${t('not_chosen')}</div>`
      :`<div class="chatbar"><input id="chat-in" placeholder="${t('type_msg')}" onkeydown="if(event.key==='Enter')sendChat('worker')"><button onclick="sendChat('worker')">➤</button></div>`}</div>`;
}
async function sendChat(side) {
  const v = $('chat-in').value.trim(); if (!v) return;
  const j = S.jobs.find(x => x.id === S.chatCtx.jobId), b = j.bids.find(x => x.id === S.chatCtx.bidId);
  b.chat.push({ from: S.me.id, txt: v, t: Date.now() }); await saveJobs(); render();
  const otherId = side === 'host' ? b.workerId : j.hostId, other = userById(otherId);
  if (other?.isBot) { const r = side==='host'?['Sounds good! I will be on time. 👍','No problem — see you then! 🙏']:['Perfect, dhanyabad! 🙏','Great, see you!'];
    setTimeout(async () => { b.chat.push({ from: otherId, txt: r[Math.floor(Math.random()*r.length)], t: Date.now() }); await saveJobs(); if ((S.tab==='hchat'||S.tab==='wchat') && S.chatCtx?.bidId===b.id) render(); }, 1200); }
}
