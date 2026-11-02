# MIKA Labs website

Static site for MIKA LABS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε., hosted on GitHub Pages.

## Files

- `index.html` — the website (currently Alexandros Mikelis's CV)
- `company.html` — the MIKA Labs company site, hidden for now (not linked, `noindex`). To bring it back, rename it to `index.html`
- `card.html` — digital business card (not linked from the site; share it via its URL or QR)
- `alexandros-mikelis.vcf` — contact file used by "Save to contacts" on the card
- `favicon.svg` — ML logo favicon

## Deploy

1. Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: **main** / **(root)**.
2. Custom domain: enter the domain in Settings → Pages, then add the DNS records GitHub shows
   (four A records for the bare domain, and a `www` CNAME to `alexandrosmikelis.github.io`).
3. Tick **Enforce HTTPS** once the certificate is issued.

Every push to `main` redeploys the site.

## To update before going live

- Replace `hello@mikalabs.gr` in `company.html` with the real company email once it exists.
- Update the email in `alexandros-mikelis.vcf` and `card.html` to the company address.
