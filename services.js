/* Lead-gen app — integration stubs.
   Every function returns a Promise with fake latency + sample data.
   Developer: replace each body with the real call; signatures are the contract the UI relies on. */
(function () {
  const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
  // ---- Live backend (betterwayloan.com /api/app). Falls back to demo silently if unreachable. ----
  const API = (window.BWL_API || 'https://betterwayloan.com') + '/api/app';
  const qs = new URLSearchParams(location.search);
  const partner = qs.get('p') || '';
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  const call = (method, url, body, tok) => fetch(API + url, { method, headers: Object.assign({ 'Content-Type': 'application/json' }, tok ? { Authorization: 'Bearer ' + tok } : {}), body: body ? JSON.stringify(body) : undefined })
    .then(r => r.json().then(j => (r.ok ? j : Promise.reject(j))));
  const quiet = p => p.catch(e => { console.warn('[api]', e && e.error || e); return null; });
  const toB64 = file => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
  const shrink = file => (!/^image\/(jpeg|png|webp)/.test(file.type) ? toB64(file) : new Promise(res => {
    const img = new Image(); img.onload = () => { const s = Math.min(1, 2000 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.85)); URL.revokeObjectURL(img.src); };
    img.onerror = () => res(toB64(file)); img.src = URL.createObjectURL(file); }));
  const api = {
    partner,
    ref: () => ls('bwl_lead_ref'),
    token: () => ls('bwl_token'),
    config: () => quiet(call('GET', '/config?p=' + encodeURIComponent(partner))),
    getProducts: () => quiet(call('GET', '/config?p=' + encodeURIComponent(partner))).then(c => (c && c.products) || []),
    startLead: (lead) => quiet(call('POST', '/leads', Object.assign({ partner }, lead))).then(r => { if (r && r.ref) ls('bwl_lead_ref', r.ref); return r; }),
    update: (patch) => api.ref() ? quiet(call('PATCH', '/leads/' + api.ref(), patch)) : Promise.resolve(null),
    upload: (file, type) => (api.ref() && file) ? shrink(file).then(data => quiet(call('POST', '/leads/' + api.ref() + '/docs', { type, filename: file.name, mime: data.slice(5, data.indexOf(';')), data }))) : Promise.resolve(null),
    login: (email, password) => quiet(call('POST', '/login', { email, password })).then(r => { if (r && r.token) ls('bwl_token', r.token); return r; }),
    logout: () => ls('bwl_token', null),
    saveProducts: (list) => api.token() ? quiet(call('PUT', '/products', list, api.token())) : Promise.resolve(null),
    leads: () => api.token() ? quiet(call('GET', '/leads', null, api.token())) : Promise.resolve(null),
    listing: (code) => code ? quiet(call('GET', '/listing/' + encodeURIComponent(code))) : Promise.resolve(null),
    resume: (url) => api.ref() ? quiet(call('POST', '/leads/' + api.ref() + '/resume', { url })) : Promise.resolve(null)
  };
  // Broker sign-in: open the app with ?signin=1 once on the broker's device.
  if (qs.get('signin') === '1' && !api.token()) setTimeout(() => {
    const e = prompt('Broker sign-in: your betterwayloan.com email'); if (!e) return;
    const p = prompt('Password'); if (!p) return;
    api.login(e, p).then(r => alert(r && r.token ? 'Signed in as ' + r.me.name + '. Product changes now publish live.' : 'Sign-in failed.'));
  }, 600);
  window.LGS = {
    api,
    sms: {
      // TODO: MessageMedia / Twilio Verify. POST /otp {mobile} -> {requestId}
      sendOtp: (mobile) => wait(400, { requestId: 'otp_' + Date.now(), mobile }),
      // TODO: POST /otp/verify {requestId, code} -> {verified, buyerToken}
      verifyOtp: (requestId, code) => wait(300, { verified: String(code).length === 4, buyerToken: 'buyer_demo' }),
      // TODO: send branded vault/offer link. {mobile, url, template}
      sendLink: (mobile, url, template) => wait(200, { sent: true })
    },
    crm: {
      // TODO: OAuth per provider (Rex, VaultRE, Agentbox, MyDesktop, Box+Dice, Eagle, PropertyMe, PropertyTree, Console Cloud).
      connect: (provider) => wait(600, { provider, status: 'connected' }),
      // TODO: GET listings (REAXML / provider REST). Map -> {id,address,price,beds,baths,cars,photos[],openHomes[],documents[]}
      listListings: (provider) => wait(500, []),
      // TODO: webhook receiver: open_home.attendee_created -> {name, mobile, listingId} -> auto SMS link
      onOpenHomeCheckIn: (handler) => {},
      // Webhooks to subscribe to per CRM (Rex, VaultRE, Agentbox... all expose listing + document events or pollable endpoints):
      //   listing.created / listing.updated  -> pull listing, photos, docs; call corelogic.getPropertyReport; create buyer link + QR
      //   document.uploaded                  -> getListingDocuments + classify; attach; SMS existing buyers
      // Where a CRM has no webhooks, poll every 15 min using updated_since.
      onListingCreated: (handler) => {},
      onDocumentUploaded: (handler) => {},
      // GET listing documents -> [{name, url, mime, uploadedAt}]
      getListingDocuments: (provider, listingId) => wait(400, []),
      // TODO: upsert contact + note/activity against the listing in the agent CRM
      writeLead: (provider, lead) => wait(250, { ok: true })
    },
    corelogic: {
      // CoreLogic (RP Data) Property Data API — needs a commercial licence + client_id/secret from CoreLogic.
      // Flow (confirm exact paths against CoreLogic developer docs):
      //   1. POST oauth token (client credentials)            -> access_token
      //   2. address suggest / match  (listing address)          -> propertyId
      //   3. property attributes, sales history, AVM, comparables, suburb statistics for propertyId
      //   4. render branded PDF (or use CoreLogic report endpoint) and cache by propertyId for 30 days
      // Trigger: on listing.created webhook from the agent CRM, NOT per buyer, so buyers get it instantly.
      matchAddress: (address) => wait(300, { propertyId: 'demo_123' }),
      getPropertyReport: (address) => wait(700, { address })
    },
    reports: {
      // TODO: building & pest: agent upload (CRM docs) or order from inspector panel; strata; title search; contract of sale.
      // Cache per address so later buyers get it instantly.
      orderBuildingPest: (listingId) => wait(2500, { status: 'ready' }),
      // Classify a CRM document by filename + first-page text: building_pest | contract | strata | title | other
      classify: (doc) => wait(200, { type: 'building_pest' }),
      getTitleSearch: (address) => wait(600, { status: 'ready' })
    },
    ocr: {
      // TODO: ID OCR + liveness (e.g. document verification provider). Returns licence fields.
      readLicence: (file) => wait(900, {})
    },
    bank: {
      // TODO: CDR / Open Banking accredited data recipient (or via intermediary). Returns balances + liabilities.
      connect: () => wait(1200, {})
    },
    docs: {
      // TODO: encrypted upload to document vault (S3 + KMS). type: licence_front|licence_back|payslip|tax_return
      upload: (file, type) => file ? api.upload(file, type) : wait(400, { id: 'doc_' + Date.now(), type })
    },
    broker: {
      // TODO: map fact-find -> provider's form (e.g. BetterWayLoan Customer Information Form PDF fields) + push to broker CRM / aggregator.
      submitFactFind: (lead) => api.update({ stage: 'preapproval', name: lead && lead.name, email: lead && lead.email, data: lead, consents: lead && lead.consents }).then(() => ({ formPdf: 'customer-information-form.pdf', prefilled: true })),
      // TODO: broker's offer -> SMS to buyer with secure link
      sendOffer: (leadId, offer) => wait(300, { sent: true })
    }
  };
})();
