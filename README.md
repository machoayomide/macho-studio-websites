# MACHO STUDIO — Websites

Production source for the **Macho Studio** website network, maintained through GitHub and deployed to **Cloudflare Pages**.

## Sites

| Website | Repository directory | Planned hostname | Status |
| --- | --- | --- | --- |
| Main portfolio | `sites/main/` | `machostudio.dpdns.org` | Initial source upload pending |
| Shopify specialist | `sites/shopify/` | `shopify.machostudio.dpdns.org` | Initial source upload pending |
| Apps studio | `sites/apps/` | `apps.machostudio.dpdns.org` | Planned |
| Web studio | `sites/web/` | `web.machostudio.dpdns.org` | Planned |
| Wix studio | `sites/wix/` | `wix.machostudio.dpdns.org` | Planned |
| CRM studio | `sites/crm/` | `crm.machostudio.dpdns.org` | Planned |
| Automation studio | `sites/automation/` | `automation.machostudio.dpdns.org` | Planned |

Each specialist site is **an independent website**, not a service page of the main portfolio. Keep case-study imagery authentic and distinguish illustrative art from real client screenshots.

## First-time source upload

A prebuilt `Macho-Studio-GitHub-Upload.zip` contains the two existing static sites. Extract it on your computer, then upload the `sites` directory to the root of **this repository**, preserving its folder structure. One-time initial upload is necessary for the media files, then connected tooling can edit source files directly.

## Cloudflare Pages — Git connected

Create **two separate Pages applications** from this repository using the `main` branch:

| Setting | Main Portfolio | Shopify |
| --- | --- | --- |
| Git repo | `machoayomide/macho-studio-websites` | same |
| Branch | `main` | `main` |
| Framework preset | None | None |
| Root directory | repository root (`/`) | repository root (`/`) |
| Build command | leave blank or `exit 0` | leave blank or `exit 0` |
| Build output directory | `sites/main` | `sites/shopify` |

After Cloudflare establishes Git integration, pushes to `main` cause automatic deploys. Test new `pages.dev` addresses before attaching the custom domains; **do not change the DigitalPlat DNS until both destinations work**.

The earlier `macho-studio-main.pages.dev` is a *Direct Upload* Pages project; it cannot simply be converted to a Git-integrated project. Create a second, Git-connected project for the main site.

### Security and forms

- Do not commit tokens, passwords, private keys, internal client records, or WordPress configuration.
- Static contact forms must use an actual backend or hand off to an email client / WhatsApp without falsely reporting delivery.
- Public email: `machomanexpert@gmail.com` · WhatsApp: `https://wa.me/2349160956794`
- DNS and HTTPS are separate from source control. Publishing the repository alone does not change existing custom domains.

## Later switch to WordPress

Source-controlled design, media, navigation, and writing can be reused when moving to WordPress. WordPress itself (PHP and MySQL) is **not supported** on Cloudflare Pages.
