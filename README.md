# MACHO STUDIO — Websites

Production source for the **Macho Studio** portfolio and specialist sites. The first two sites are present and can be deployed through **Cloudflare Pages' native Git integration** — no GitHub Actions workflow is required.

## Websites

| Site | Directory | Target domain | State |
| --- | --- | --- | --- |
| Macho Studio main portfolio | `main/` | `machostudio.dpdns.org` | Source uploaded; Cloudflare Git deployment pending |
| Shopify specialist site | `shopify/` | `shopify.machostudio.dpdns.org` | Source uploaded; Cloudflare Git deployment pending |
| Apps, Web, Wix, CRM, Automation | Future projects/repositories | Separate specialist subdomains | Planned |

Both existing folders contain their own `index.html`, assets, and page routes. Each site is an independent standalone website.

## Cloudflare Pages deployment (without GitHub Actions)

In Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**, authorize this repository: `machoayomide/macho-studio-websites`.

Create **two separate Pages projects**:

| Setting | Main Portfolio | Shopify |
| --- | --- | --- |
| Pages project name | `macho-studio-git` | `macho-shopify-git` |
| Git repository | `machoayomide/macho-studio-websites` | Same |
| Production branch | `main` | `main` |
| Framework preset | `None` | `None` |
| Root directory (advanced) | Leave blank; repository root | Leave blank; repository root |
| Build command | `exit 0` | `exit 0` |
| Build output directory | `main` | `shopify` |

**Important:** The existing `macho-studio-main.pages.dev` was created via Direct Upload and cannot be converted into a Git-integrated project. Keep it working until the new project is tested, then reassign the domain if desired.

Cloudflare Pages will redeploy when updates are pushed to `main`. It does **not** consume GitHub Actions minutes. For a monorepo, Cloudflare by default rebuilds both projects on every commit; optional Build watch paths may later reduce unnecessary builds.

Cloudflare Pages currently supports **up to 5 Git-integrated Pages projects per repository**. We can use a second repository for the remaining independent specialist websites if needed.

## Before changing domain DNS

1. Verify each new `*.pages.dev` website, including links, desktop and mobile layouts, and contact handoffs.
2. Back up and keep DigitalPlat WordPress intact.
3. Add custom domains in Cloudflare Pages and update DNS/delegation carefully. The current `dpdns.org` subdomain arrangement may require additional verification.
4. Switch traffic only after TLS certificates and target URLs work.

## Security and later WordPress migration

Do not commit credentials, API tokens, secrets, customer data, or WordPress config files. Static forms must either use a real submission service or clearly hand off to WhatsApp/email; do not falsely report a successful message delivery.

Public contact: `hello@macho.studio`; form enquiries: `contact@macho.studio` · WhatsApp `https://wa.me/2349160956794`.

WordPress PHP and MySQL cannot run on Cloudflare Pages. Static site markup, styles, scripts and assets can be reused for a later WordPress rebuild.
