# MACHO — Direct project enquiry setup

Both contact experiences on the main portfolio (the **Contact** page and the **Start a project** popup) now POST JSON to `/api/enquiry`. The endpoint lives in `main/_worker.js`, the **existing Cloudflare Pages Advanced Mode Worker**, so do not introduce a conflicting `/functions` directory.

## Activate email delivery (one provider required)

Choose **one** of these two methods. The code does not send emails until an actual provider is configured; failed attempts remain in the form and no success is shown.

### Option A — Cloudflare Email Service (native, preferred if available on your account)

1. In Cloudflare, go to **Email Service → Email Sending** and onboard the `macho.studio` domain. Allow Cloudflare to add/verify sender DNS records. This is **outbound sending**, separate from Email Routing.
2. Open **Workers & Pages → macho-studio-git → Settings → Bindings** and add a **Send Email / Email Service** binding named exactly `EMAIL`, if that binding type is offered. If the Pages UI does not expose it, use Option B below instead of changing the existing Pages build settings.
3. Add a Pages environment variable named `CONTACT_TO_EMAIL` with the inbox **you actually monitor** (for example your existing `machomanexpert@gmail.com` address). Use **Encrypt/Secret** if the dashboard allows. Do not commit an address into source.
4. The code sends as `enquiries@macho.studio`. The `macho.studio` sending domain must be verified.
5. Deploy again, since new bindings and secrets must be available to the active deployment.

### Option B — Resend API (if native Cloudflare sending is unavailable)

1. Add and verify `macho.studio` as a sending domain with [Resend](https://resend.com/domains), applying the DNS records in Cloudflare.
2. Create an API key authorized to send email for this domain.
3. In **Workers & Pages → macho-studio-git → Settings → Variables and Secrets**, create encrypted secret `RESEND_API_KEY`.
4. Add `CONTACT_TO_EMAIL` with your receiving inbox.
5. Redeploy the Pages project.

Optional `CONTACT_FROM_EMAIL` overrides `enquiries@macho.studio` but must still be an address on the verified `macho.studio` domain.

**DO NOT place provider API keys in browser JavaScript, HTML, or GitHub source.**

## Delivery behavior

- Visitors enter name, email, service, timing, optional budget, and project details and click **Send enquiry**.
- The browser POSTs to the same-origin Cloudflare endpoint. The server validates origin, type, sizes and required fields, and rejects honeypot entries.
- The server sends a **plain-text** email to the configured inbox and uses the visitor's address only as **Reply-To** (never as the authenticated From address).
- The UI confirms **provider acceptance**, not guaranteed arrival in your inbox. If no provider is configured, the provider fails, or the network is interrupted, the UI shows a failure and retains their typed details.
- **WhatsApp is an opt-in fallback**, visible after a failed attempt. Clicking that link explicitly transfers their details to WhatsApp.
- No personal data from these enquiries is sent through the anonymous visitor activity / Telegram tracking. If `ACTIVITY_LOG` KV is present, the worker also uses hashed IP counters for a one-hour abuse throttle, stored separately under `rl:enquiry:`.

## Final tests

1. Run `node --test tests/enquiry-form.test.mjs tests/brand-contact-addresses.test.mjs tests/activity-worker.test.mjs tests/launch-readiness.test.mjs`.
2. Confirm `https://macho.studio/contact` shows **Send enquiry**; the popup on other pages should show **Send enquiry** too.
3. Submit a harmless test enquiry with your own email. Confirm that it **does not open Gmail**, that the page displays a positive status, and that a real email **arrives at your configured inbox**.
4. Try an empty description and invalid email: these must be rejected without contacting the sender.
5. Temporarily unset email provider configuration in a **preview environment only**; verify the form reports failure and preserves the entered message.
6. Check Cloudflare Pages logs for provider errors without logging visitor names, addresses or message bodies.
7. Test on Android Chrome, desktop Chrome and a non-JavaScript browser if supporting JS-disabled visitors is a requirement.

A working Cloudflare deployment is not proof of email delivery until you have completed a real end-to-end test. Shopify's separate specialist contact form continues to use its existing manual WhatsApp/email handoff and is not part of this change.
