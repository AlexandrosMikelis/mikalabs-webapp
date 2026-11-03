# MIKA Labs website

Site for MIKA LABS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε. React + Vite, hosted on GitHub Pages.

## Routes

- `/` — MIKA Labs company page: services, how we work, contact (`src/pages/Home.jsx`)
- `/team` — Alexandros Mikelis's CV (`src/pages/Team.jsx`)
- `/privacy` — privacy page (`src/pages/Privacy.jsx`)
- `/card.html` — digital business card, plain static page in `public/` (not linked; share via URL or QR)

Shared pieces: `src/components/Layout.jsx` (nav, hero, footer), `BookButton.jsx` (Google Calendar booking,
loaded only on click for GDPR), `Icons.jsx`. Styles in `src/styles.css`. Static files (fonts, favicon, logo,
CNAME, vcf) live in `public/`.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/ (index.html is copied to 404.html so /team works on GitHub Pages)
```

## Deploy

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.
One-time: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
Custom domain comes from `public/CNAME`.

Contact email used across all pages: `info@mikalaboratories.com`.
