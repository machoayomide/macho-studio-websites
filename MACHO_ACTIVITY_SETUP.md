# MACHO Visitor Activity — Cloudflare + Telegram Setup

**Status:** Code is committed on the review branch, but real alert delivery requires configuration in Cloudflare. **Never put bot tokens or dashboard passwords into GitHub, HTML, frontend JavaScript or chat messages.**

## What it provides

- Combined consenting-visitor activity for the MACHO main website and Shopify specialist website.
- Events: page views, returning sessions, activity duration, scroll depth, Store Check start/progress/completion, service clicks, opening the contact page, preparing a project brief, WhatsApp or email handoffs.
- Coarse country, device type, route without query strings, UTC time, anonymous per-browser-session ID.
- No typed contact details, form contents, store URL, sales answer, precise location or IP address in activity alerts.
- A private chat-style dashboard at the Shopify project's `/macho-activity/` route.
- Optional Telegram message per event. It indicates activity, **not** a confirmed customer or sale.
- The Store Check recommendation report is not automatically transmitted; visitors can explicitly include it in an enquiry.

## Important privacy and accuracy constraints

1. Visitors receive an Allow activity / No thanks choice. Those who decline are not tracked in the custom activity system.
2. Browser script blockers, lost connections and visitors without JavaScript can prevent activity capture. This will not record literally every website visitor.
3. Only the latest 120 records from the preceding seven days appear in the initial dashboard feed.
4. Returning status is inferred from an **opted-in** local browser marker; it is not a stable real-world identity.
5. Events are not verified real enquiries: clicking WhatsApp is a **handoff**, not evidence of a sent message or purchase.
6. Cloudflare KV and Pages Functions have plan quotas; review usage limits before high-volume production use. One message per event can also hit Telegram rate limits.

## Step 1: Create a Cloudflare KV namespace

In Cloudflare Dashboard, open **Storage & databases → KV** (menu names can vary). Create a namespace named, for example, `MACHO_ACTIVITY`.

In **Workers & Pages → macho-shopify-git → Settings → Bindings**, add a **KV namespace binding**:
- Variable: `ACTIVITY_LOG`
- KV namespace: the namespace you just created.

Repeat in **Workers & Pages → macho-studio-git → Settings → Bindings**, selecting the **same namespace** and **same variable name** `ACTIVITY_LOG`. Using the same underlying namespace combines both sites into one activity feed.

Configure both the **Preview** and **Production** environments as appropriate; Cloudflare may separate them.

## Step 2: Private dashboard key

Create a long, randomly generated secret (32 or more characters). Store it only as an encrypted Cloudflare Pages secret/environment variable:

- Variable: `ADMIN_DASHBOARD_KEY`
- Value: your generated secret.

Add this to the **Shopify Pages project** to access the dashboard. Optionally add it to the main project if you plan to expose the same report there later.

**Never put the key in a query string.** The dashboard accepts it only through an Authorization header and keeps it in memory while the page is open.

Dashboard preview: `https://site-refresh-oct2026.macho-shopify-git.pages.dev/macho-activity/`

After deployment to production, the corresponding path is `https://shopify.machostudio.dpdns.org/macho-activity/`. This is an address, **not** a claim that the production feature has been published.

## Step 3: Telegram notifications (optional)

1. In the Telegram app, open the verified **@BotFather** bot and create your own private notification bot using `/newbot`.
2. Save the bot token privately.
3. Start a chat with your new bot (or add it to an admin-only notification group).
4. Get the destination chat ID using Telegram's official `getUpdates` API or another verified method, then keep the value private.
5. In each Cloudflare Pages project, add **encrypted secrets**, not plain repository files:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
6. Redeploy the review branch and test with a browser where you explicitly select **Allow activity**.

The Telegram credentials must be connected to **both** Pages projects if you want notifications from both websites. Use the same bot/group if you want a single chat stream.

Telegram messages will carry coarse information such as:
```
👁 New page view
2026-10-14T14:00:00Z
🏠 shopify.machostudio.dpdns.org
🔖 Session 8f41c5a… / View 3e12c7f…
📄 /store-check/
📱 Desktop · 🌍 NG
Anonymous activity · not a confirmed lead or sale
```

The timestamps, IDs and example values above are illustrative.

## Step 4: Test the full journey

- Open the preview in an incognito/private window.
- Check that **No thanks** prevents event submission.
- Select **Allow activity** and visit Home, Services, Store Check and Contact.
- Complete Store Check and choose the enquiry link, then verify the click is labeled as **assessment handoff**, not **converted**.
- Open `/macho-activity/` and enter the `ADMIN_DASHBOARD_KEY`; check the recent-feed cards and filters.
- Verify Telegram messages and session labeling.
- Test from a second device with consent.
- Check Cloudflare Functions/KV usage and browser Network tab for `POST /api/activity` -> HTTP 202.
- Confirm a visitor without consent sees no custom event requests.
- Validate on mobile and with ad/tracker blockers.
- Only after tests and approval, merge the draft PR into `main`.

## Dashboard access/security

The dashboard page is public HTML but the data API is protected by `ADMIN_DASHBOARD_KEY`; do **not** rely on its URL being obscure for security. Never copy screenshots that show your secret. Do not share the private link/key with prospects.

If you require **WhatsApp notifications** instead of Telegram, that is a separate integration using the official WhatsApp Business Platform; business-initiated messaging may require approved templates and usage charges. Do not deploy unofficial WhatsApp automation for this.

## Troubleshooting

- `401 Unauthorized` on `GET /api/activity/report`: dashboard key missing/wrong or its environment has not been configured.
- `503 Activity backend not configured` on `POST /api/activity`: no KV binding and no Telegram secret.
- `503 KV binding ACTIVITY_LOG not configured` on the dashboard: connect the KV binding to the Shopify Pages project.
- Dashboard works, Telegram empty: confirm the bot token/chat ID secrets and that the bot has access to the destination chat.
- Dashboard shows no events: confirm visitors opted in, preview and production bindings match, Cloudflare function deployed, and JavaScript/network requests aren't blocked.
- Errors on static pages: verify `_worker.js` includes `return env.ASSETS.fetch(request)` for all non-API requests.

Official background: https://developers.cloudflare.com/pages/functions/advanced-mode/
