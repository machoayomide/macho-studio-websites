# Shopify email capture and newsletter

The Shopify Pages Worker saves explicit follow-up requests and newsletter subscribers using the existing `ACTIVITY_LOG` KV binding. Records use `lead:review:` and `lead:newsletter:` prefixes, separate from activity events. No personal details go into activity alerts. Review requests expire after 12 months. Newsletter subscriptions are unique by normalized email and retained until withdrawal/removal. Newsletter opt-in is separate and never preselected; results remain available without an email.

## Owner access

1. In Cloudflare Pages project `macho-shopify-git`, set the encrypted secret `ADMIN_DASHBOARD_KEY` to a private random value and redeploy. Never put this value in Git or browser source. This is also the existing activity-dashboard credential.
2. Open `https://shopify.macho.studio/macho-leads/` and enter that key. The browser keeps it only during loading and never writes it to browser storage.
3. Export **active newsletter subscribers** as CSV. The separate review export does not imply marketing permission. Each subscriber export includes consent wording, timestamp, source and their unsubscribe URL. Include that URL in every newsletter and process email unsubscribe requests before the next send.

This change captures and exports contacts. It does not send newsletters or configure a bulk email provider. There is no automatic report email: the optional email field requests a follow-up, and the report is included only if the visitor opts in. A success message means the record was saved in KV. On failure the form retains the address and tells the visitor to retry.

`GET /api/leads/ready` exposes only storage/admin availability. `GET /api/leads/report` requires the admin bearer token and supports pagination. `POST /api/leads/unsubscribe` accepts the personal token only after the visitor confirms on the unsubscribe page; opening the URL does not unsubscribe. For an owner's deletion request, remove the matching `lead:review:` / `lead:newsletter:` and token mapping in Cloudflare KV. Suppress unsubscribed addresses in any exported mailing list before sending.

KV counters provide best-effort abuse throttling, not a globally atomic rate limiter. If spam becomes a problem, add a managed rate limit or Turnstile. Subscription records are kept independently of 7-day analytics retention; do not bulk-clear the lead prefixes when clearing activity.

Validation: run `node --test tests/*.test.mjs`. Production storage availability was checked before implementation. Test an opt-in with an address you control, inspect the private dashboard after setting the key, export subscribers, then exercise its unsubscribe link. Never treat a mocked test as inbox delivery or a production signup check.
