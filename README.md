# Sovereign Guard — Landing Page

A standalone, single-page marketing site for Sovereign Guard. Pure HTML/CSS/JS,
**no build step**, no dependencies. Completely separate from the application frontend.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and all copy |
| `styles.css` | Theme, layout, animations |
| `script.js` | Nav, scroll reveals, contact form + newsletter handling |

## Sections

1. **Hero** — slogan: *"Control the data your enterprise sends to AI."*
2. **Problem** — the pain: no real control over data sent to OpenAI/Anthropic, EU exposure.
3. **Why now** — EU AI Act, GDPR, DORA and the risk of non-compliance.
4. **Product** — plain-language: a control plane between people and AI.
5. **Platform** — the technical pitch: PII tokenization, policy engine, audit log, proxies.
6. **Roadmap** — MVP done, seeking investors / design partners.
7. **Demo + Contact form** — qualified lead capture.
8. **Newsletter** — email capture.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
# from the landing/ directory
python -m http.server 8080
# then visit http://localhost:8080
```

## Wire up the forms (2 minutes)

The contact form and newsletter POST JSON. By default, with no endpoint set,
they fall back to opening the visitor's email client so no lead is lost.

To collect submissions automatically with **no backend**:

1. Create a free form endpoint at [Formspree](https://formspree.io) (or similar).
2. Open `script.js` and set:
   ```js
   const CONFIG = {
     FORM_ENDPOINT: "https://formspree.io/f/your-id",
     CONTACT_EMAIL: "hello@sovereignguard.eu",
   };
   ```
3. Done — submissions arrive in your inbox / dashboard.

Prefer your own API? Point `FORM_ENDPOINT` at any URL that accepts a JSON `POST`.

## Deploy to GitHub Pages (free, automated)

This folder is ready for GitHub Pages. A workflow at
`.github/workflows/deploy-landing.yml` publishes the `landing/` folder
automatically — you don't move any files.

**One-time setup:**

1. Push this repository to GitHub (if you haven't yet):
   ```bash
   git add .
   git commit -m "Add Sovereign Guard landing page"
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin master      # or: main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. That's it. Every push that touches `landing/` redeploys. You can also run it
   manually from the **Actions** tab ("Deploy landing page to GitHub Pages" →
   *Run workflow*).

Your site will be live at:
`https://<your-user>.github.io/<your-repo>/`

> **Asset paths are relative**, so the page works correctly under that
> `/<your-repo>/` sub-path with no changes.

### Custom domain (optional)

1. In **Settings → Pages → Custom domain**, enter e.g. `sovereignguard.eu`.
2. Add the DNS records GitHub shows (a `CNAME` for `www`, or `A`/`ALIAS` records
   for the apex domain).
3. GitHub creates a `CNAME` file and provisions HTTPS automatically.

> If you set a custom domain through the dashboard, commit the generated
> `CNAME` file into `landing/` so it survives redeploys.

## Other one-click hosts

Because it's static, you can also deploy in under a minute to:

- **Netlify** — drag the `landing/` folder onto <https://app.netlify.com/drop>.
- **Vercel** — `vercel deploy` from inside `landing/`, or import the folder.
- **Cloudflare Pages / S3 + CloudFront** — upload the files as-is.

## Included files for hosting

| File | Why |
| --- | --- |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (skip Jekyll). |
| `404.html` | Branded fallback for unknown paths. |
| `../.github/workflows/deploy-landing.yml` | Auto-deploys `landing/` on push. |

## Customize

- **Copy** — edit text directly in `index.html`.
- **Brand colors** — change the CSS variables at the top of `styles.css` (`--accent`, `--accent-2`, `--accent-3`).
- **Contact email** — update `CONFIG.CONTACT_EMAIL` in `script.js` and the `mailto:` link in `index.html`.
- **Stats / dates** — the "Why now" figures are illustrative; adjust to your latest positioning.
