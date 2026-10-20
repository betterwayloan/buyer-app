/* Lead-gen app — integration stubs.
   Every function returns a Promise with fake latency + sample data.
   Developer: replace each body with the real call; signatures are the contract the UI relies on. */
(function () {
  const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
  window.LGS = {
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
      upload: (file, type) => wait(400, { id: 'doc_' + Date.now(), type })
    },
    broker: {
      // TODO: map fact-find -> provider's form (e.g. BetterWayLoan Customer Information Form PDF fields) + push to broker CRM / aggregator.
      submitFactFind: (lead) => wait(600, { formPdf: 'customer-information-form.pdf', prefilled: true }),
      // TODO: broker's offer -> SMS to buyer with secure link
      sendOffer: (leadId, offer) => wait(300, { sent: true })
    }
  };
})();
