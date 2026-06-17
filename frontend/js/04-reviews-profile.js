/* =========================================================================
   HALKA KAAM · 04 · Reviews, disputes, profiles
   ========================================================================= */
function starRow(key, label) {
  return `<div class="raterow"><div class="lbl">${label}</div>
    <div class="starpick" data-k="${key}">${[1,2,3,4,5].map(n => `<span onclick="pickStar('${key}',${n})">★</span>`).join('')}</div></div>`;
}
function pickStar(k, n) { S.rv[k] = n; document.querySelectorAll(`.starpick[data-k=${k}] span`).forEach((el,i) => el.classList.toggle('on', i<n)); }

function openWorkerReview(jobId) {
  S.rv = { a:0, b:0, c:0 }; const j = S.jobs.find(x => x.id === jobId);
  openSheet(`<h2>${t('review_worker')}: ${esc(assignedName(j))}</h2><p class="desc">${t('both_ways')}</p>
    ${starRow('a',t('rate_punctual'))}${starRow('b',t('rate_quality'))}${starRow('c',t('rate_attitude'))}
    <div class="field"><label>${t('public_comment')}</label><textarea id="rv-txt" placeholder="${t('comment_ph')}"></textarea></div>
    <button class="btn btn-primary btn-lg" onclick="submitWorkerReview('${jobId}')">${t('mark_done')}</button>`);
}
async function submitWorkerReview(jobId) {
  if (!S.rv.a||!S.rv.b||!S.rv.c) { toast(t('rate_all')); return; }
  const j = S.jobs.find(x => x.id === jobId); j.status='done';
  j.reviews.hostToWorker = { a:S.rv.a, b:S.rv.b, c:S.rv.c, stars:Math.round((S.rv.a+S.rv.b+S.rv.c)/3), txt:$('rv-txt').value.trim(), t:Date.now() };
  await saveJobs(); closeSheet(); render(); toast(t('review_published'));
  const b = j.bids.find(x => x.id === j.assignedBidId), w = userById(b?.workerId);
  if (w?.isBot) setTimeout(async () => { const s = 4+Math.round(Math.random());
    j.reviews.workerToHost = { a:s, b:5, c:s, stars:Math.round((s+5+s)/3), txt:'Clear instructions and friendly. Paid as agreed. 🙏', t:Date.now() };
    await saveJobs(); toast('⭐ ' + w.name); if (S.view==='app') render(); }, 3500);
}
function openHostReview(jobId) {
  S.rv = { a:0, b:0, c:0 }; const j = S.jobs.find(x => x.id === jobId), host = userById(j.hostId);
  openSheet(`<h2>${t('review_host')}: ${esc(host?.name)}</h2><p class="desc">${t('both_ways')}</p>
    ${starRow('a',t('rate_payment'))}${starRow('b',t('rate_comm'))}${starRow('c',t('rate_safety'))}
    <div class="field"><label>${t('public_comment')}</label><textarea id="rv-txt" placeholder="${t('comment_ph')}"></textarea></div>
    <button class="btn btn-primary btn-lg" onclick="submitHostReview('${jobId}')">${t('publish_review')}</button>`);
}
async function submitHostReview(jobId) {
  if (!S.rv.a||!S.rv.b||!S.rv.c) { toast(t('rate_all')); return; }
  const j = S.jobs.find(x => x.id === jobId);
  j.reviews.workerToHost = { a:S.rv.a, b:S.rv.b, c:S.rv.c, stars:Math.round((S.rv.a+S.rv.b+S.rv.c)/3), txt:$('rv-txt').value.trim(), t:Date.now() };
  await saveJobs(); closeSheet(); render(); toast(t('review_published'));
}
function openReport(jobId) {
  openSheet(`<h2>${t('report_issue')}</h2><p class="desc">${t('both_ways')}</p>
    <div class="field"><textarea id="rep-txt" placeholder="${t('comment_ph')}"></textarea></div>
    <button class="btn btn-primary btn-lg" onclick="submitReport('${jobId}')">${t('send')}</button>`);
}
async function submitReport(jobId) { const j = S.jobs.find(x => x.id === jobId); j.report = { txt:$('rep-txt').value.trim(), t:Date.now(), by:S.me.id }; await saveJobs(); closeSheet(); toast('🙏'); }

/* ---------- profiles ---------- */
function profileBlock(userId, role) {
  const u = userById(userId), r = ratingOf(userId,role), revs = reviewsOf(userId,role);
  const altRole = role==='worker'?'host':'worker', altR = ratingOf(userId,altRole);
  return `<div class="personrow" style="cursor:default">
      <div class="av av-lg" style="background:${avColor(u?.name)}">${initials(u?.name)}</div>
      <div><div class="nm" style="font-size:var(--fs-lg)">${esc(u?.name)}</div>
      <div class="rt">${esc(u?.campus||'Nepal')} · ${t('joined')} ${new Date(u?.created||Date.now()).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</div>
      <div class="rt"><span class="stars">${starsHtml(r.avg)}</span> ${r.avg?r.avg.toFixed(1):t('new_helper')} ${role==='worker'?t('as_worker'):t('as_host')} (${r.count})</div></div></div>
    ${u?.bio?`<p style="font-size:var(--fs-md);color:var(--slate);line-height:1.55;margin-bottom:16px">${esc(u.bio)}</p>`:''}
    <div class="shead"><h2 style="font-size:var(--fs-lg)">${t('reviews')}</h2></div>
    ${revs.length?revs.map(rv => `<div class="pubreview"><div class="who">${esc(rv.from)} · <span class="stars">${'★'.repeat(rv.stars)}</span> · ${esc(rv.job)}</div><div class="txt">${esc(rv.txt||'')}</div></div>`).join('')
      :`<div class="pubreview"><div class="txt" style="color:var(--slate)">${t('no_reviews')}${u?.baseCount?` · ${u.baseRating}★ (${u.baseCount})`:''}</div></div>`}`;
}
function openProfileSheet(userId, role) { openSheet(profileBlock(userId,role) + `<div class="infobox blue" style="margin-top:8px"><span class="ic">🤝</span><span>${t('both_ways')}</span></div>`); }
function viewProfile(userId, role, isMe) {
  return `<div class="shead"><h2>${t('nav_profile')}</h2><button class="lang-switch" style="font-size:var(--fs-sm);font-weight:700;color:var(--accent);background:var(--accent-soft);padding:8px 14px;border-radius:999px;border:none" onclick="toggleLang()">${t('other_lang')}</button></div>`
    + profileBlock(userId, role)
    + (isMe?`<div class="infobox blue" style="margin-top:14px"><span class="ic">🤝</span><span>${t('both_ways')}</span></div>
      <div class="btnrow"><button class="btn btn-ghost" onclick="editBio()">✏️ ${t('edit_profile')}</button>
      <button class="btn btn-danger" onclick="logout()">${t('log_out')}</button></div>`:'');
}
function editBio() {
  openSheet(`<h2>${t('about_me')}</h2><div class="field"><textarea id="bio-txt" placeholder="${t('pitch_ph')}">${esc(S.me.bio||'')}</textarea></div>
    <button class="btn btn-primary btn-lg" onclick="saveBio()">${t('save')}</button>`);
}
async function saveBio() { S.me.bio = $('bio-txt').value.trim(); await saveUsers(); closeSheet(); render(); toast(t('save')); }
