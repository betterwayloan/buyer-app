# Going live on a shoestring

**Target:** `app.betterwayloan.com.au`. **Cost to start:** about $0–60/month plus SMS.

## Stack
| Piece | Service | Cost |
|---|---|---|
| Website / app hosting | Vercel (or GitHub Pages for the demo) | Free |
| Database, logins, encrypted files | Supabase, **Sydney region** | Free → $25/mo |
| SMS codes and links | Twilio or MessageMedia | ~8c per SMS |
| Property data | CoreLogic **sandbox** (free) → partner's own subscription → own licence | $0 to start |
| CRM sync | Rex API (1-click), API keys, Zapier fallback, email-in | Free–$30/mo |
| Email-in for documents | Postmark / Mailgun inbound | Free tier |
| Payments (later) | Stripe | 1.7% + 30c |

## Step 1: Demo live this week (no backend)
1. Push this project to the BetterWayLoan GitHub repo in a `/buyer-app` folder.
2. Turn on GitHub Pages, or import the repo into Vercel.
3. Point `app.betterwayloan.com.au` at it with a CNAME record at your domain registrar.
4. Demo links:
   - Full platform: `/buyer-app/Lead Gen App.dc.html`
   - Buyer app as installed on a phone: `/buyer-app/Lead Gen App.dc.html?app=buyer`

## Step 2: Real data (2–4 weeks)
1. **Supabase:** new project, Sydney region. Run `backend/schema.sql`.
2. **Twilio:** buy an Australian number and register the sender ID "BetterWay".
3. **CoreLogic:** self-serve sign-up at developer.corelogic.asia → create a sandbox client. Put the keys in Supabase Vault, never in the app.
4. **Rex:** request API access as an integration partner. Use the agency's own API key for the pilot.
5. Swap each stub in `services.js` for a Supabase Edge Function call. The function names already match.

## Step 3: Before real clients
- [ ] Lawyer reviews the Credit Guide, privacy policy, collection notice, terms and referral-fee wording (drafts are in the app).
- [ ] Licensee details (ACL, AFCA, commission ranges) entered for each broker.
- [ ] Rates in the broker portal checked against the lender's current rate sheet.
- [ ] Pilot with one agency and one broker.
