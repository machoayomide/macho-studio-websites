# MACHO private visitor-activity feed — Cloudflare setup

The Shopify and main portfolio sites include **consent-based anonymous event tracking** and Cloudflare Pages advanced-mode workers. They do not work as a hosted analytics service until the following bindings are configured.

## 1. Cloudflare Pages: database/storage

For each Pages project `macho-shopify-git` and `macho-studio-git`:

1. In Cloudflare, create a **Workers KV namespace** named e.g. `MACHO_ACTIVITY_LOG`.
2. Go to the Pages project -> Settings -> Functions -> KV namespace bindings (or Settings -> Variables and Secrets, depending on dashboard UI).
3. Bind the namespace with variable name **`ACTIVITY_LOG`**.
4. Do the same in **Preview** as well as **Production**, using separate KV namespaces for testing when possible.
5. Deploy the applicable branch again. Test `GET /api/activity/ready`. It should return `enabled:true` and `storage:true`.

The worker retains anonymous activity for seven days and returns up to 120 latest events in the dashboard.

## 2. Dashboard access

Create a long, random **`ADMIN_DASHBOARD_KEY`** and add it to each Pages project as an encrypted secret, not plain source code. Use the same key for both if you prefer. Visit the Shopify dashboard at `/macho-activity/` and enter the key. The dashboard sends it as an Authorization header and does not embed it in a link or persist it in storage.

**The dashboard URL is not the security boundary.** The bearer key protects `/api/activity/report`. Never send a screenshot containing the key.

## 3. Telegram notifications (optional)

Create a bot with Telegram's **@BotFather** and obtain the bot token. Start a chat with your bot or invite it to a private group, then obtain the destination chat ID.

Create encrypted Pages secrets:
- `TELEGRAM_BOT_TOKEN` — token from BotFather
- `TELEGRAM_CHAT_ID` — your private chat/group ID

Never paste these into GitHub or commit them. Test by opting into activity on a preview and opening a service page. The worker sends separate messages for events; a service link click or WhatsApp link click is **not a confirmed message, lead or sale**.

## 4. Data and consent

- No events are sent until the visitor actively opts into activity tracking. A visitor may decline.
- Records include short-lived anonymous session/view IDs, timestamp, page path (no query), coarse country and device, and a small predefined event label.
- No IPs, full referrers, Shopify store URLs, answers, names, contact details or form values are included in this custom event feed.
- Storage expires after seven days. The system cannot retroactively reconstruct page views from before consent.
- Confirm applicable privacy-law disclosures and publish correct privacy/cookie information **before turning the feed on**. Cloudflare Web Analytics, if enabled independently, has its own separate settings and disclosures.

## 5. Validation checklist

- Open the preview dashboard, enter key, verify event history and filters.
- Accept activity tracking in another browser, load three pages, start and complete the Store Check, and click a contact method.
- Reject activity tracking in a fresh session; confirm the event API is not called.
- Verify returning session labeling (not identity), timezone display, and no accidental buyer contact data.
- Test Telegram alerts only after setting bot token and chat ID.
- Check Cloudflare KV usage and Worker quotas; sending every event to Telegram can be noisy and consume free plan quotas.
- Confirm the active Pages advanced-mode worker routes all static asset requests to `env.ASSETS.fetch(request)`.
- Retest in Production separately after approval. Preview-only settings do not necessarily carry over.

## Deployment status

The source is published from `main`; **a passing build alone does not mean KV/secrets are set or notifications are delivering**.

## Connection and delivery verification

The dashboard now checks `/api/activity/ready` and lists missing setting names before login. A configured Telegram flag only confirms the secrets are present. After entering the dashboard key, use **Send test alert**. The authenticated endpoint awaits storage and Telegram responses and reports a failed delivery as an error, including Telegram responses with `ok:false`. The test is labeled as an owner test, not a visitor or lead. Keep the dashboard key and bot token out of screenshots and source code.

Run `node tests/activity-worker.test.mjs` to check both workers with simulated storage and Telegram responses. This does not prove production delivery.

## Production setup progress — 19 October 2026

Created the dedicated `MACHO_ACTIVITY_LOG` namespace and saved the production `ACTIVITY_LOG` binding on both `macho-studio-git` and `macho-shopify-git`, using the same namespace for a combined feed. Redeploy to apply these settings. The private dashboard still requires the owner to enter `ADMIN_DASHBOARD_KEY` as an encrypted secret on `macho-shopify-git`. Telegram remains optional and unconfigured until the owner supplies `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in Cloudflare. Configuration presence is not proof of real delivery; use the authenticated Send test alert control after setup.
