/* =========================================================================
   HALKA KAAM · 05 · Bootstrap — expose inline handlers, start the app
   ========================================================================= */
Object.assign(window, {
  S, DB, t, catName, setLang, toggleLang, renderLangpick, renderLanding,
  goAuth, sendOtp, verifyOtp, logout,
  renderLocStep, useMyLocation, pickArea, confirmLocation, changeLocation, onSlider, mountLocMap,
  setMode, setTab, logoTap, gotoProfile, render,
  openJobDetail, openOfferForm, submitOffer, openWChat, sendChat,
  viewMyPitches, openInbox, startPost, fset, captureForm, addPhoto, publishJob,
  featureJob, initChat, openHChat, assignWorker,
  openWorkerReview, submitWorkerReview, openHostReview, submitHostReview,
  openReport, submitReport, pickStar, openProfileSheet, editBio, saveBio, closeSheet,
  get authStep(){return authStep;},
});
$('sheetwrap').addEventListener('click', e => { if (e.target === $('sheetwrap')) closeSheet(); });
boot();
