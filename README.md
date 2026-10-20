# Put the app on app.betterwayloan.com.au (about 15 minutes, free)

## Option A: GitHub Pages (uses the BetterWayLoan GitHub)
1. On github.com, open the BetterWayLoan account → **New repository** → name it `buyer-app` → set it to **Public** → Create.
2. Click **"uploading an existing file"** and drag in **everything in this folder**, including `CNAME`. Then click Commit.
3. Go to Settings → **Pages** → Source: `Deploy from a branch` → Branch: `main` / root → Save.
4. Under **Custom domain**, it should already show `app.betterwayloan.com.au`. Tick **Enforce HTTPS** once it's available.
5. At your domain registrar (wherever betterwayloan.com.au is managed), add one DNS record:
   - Type: **CNAME** · Name: **app** · Value: **<your-github-username>.github.io**
6. Wait 10–60 minutes, then open **https://app.betterwayloan.com.au**.

## Option B: Vercel (also free, faster)
1. vercel.com → sign in with GitHub → **Add New → Project** → import `buyer-app` → Deploy.
2. Project → Settings → **Domains** → add `app.betterwayloan.com.au`.
3. Add the DNS record Vercel shows (a CNAME to `cname.vercel-dns.com`).

## The links you'll use
- **Desktop:** https://app.betterwayloan.com.au opens the full platform demo (all tabs).
- **Phone or QR code:** opens the buyer app full-screen. It can be added to the home screen.
- **Force the buyer view:** https://app.betterwayloan.com.au/?app=buyer

## Note
This is the demo build. Integrations are simulated, and the demo data is saved in the visitor's browser. For real buyers, follow Step 2 in `DEPLOY.md`.
