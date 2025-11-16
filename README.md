# Naghma Tea Website

A multilingual (EN/AR/FR) static site with a serverless backend for handling "Dream Tea" requests.

## Features
- Language switcher with RTL support for Arabic
- Product grid with tiered pricing and value badges
- Custom Tea form that submits to a serverless email endpoint (with mailto fallback)
- WhatsApp click-to-chat button

## Backend (Serverless Email)
The form posts to `/api/send-custom-tea` which sends an email using SMTP via Nodemailer. Environment variables are required and must be configured on the hosting platform.

### Environment Variables
Create and set the following (see `.env.example` for a template):

- `SMTP_HOST` — SMTP server hostname
- `SMTP_PORT` — SMTP port (e.g., 587)
- `SMTP_SECURE` — `true` if using port 465 (SSL), else `false`
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `SMTP_FROM` — From header, e.g., `"Naghma Tea <no-reply@naghmateas.com>"`
- `TO_EMAIL` — Destination inbox for new requests (e.g., `orders@naghmateas.com`)

## Deploy Options

### 1) Netlify (free, static + functions)
- Use the Netlify UI: New site from Git → choose this repo → publish dir: `.` → functions dir: `netlify/functions`.
- Set env vars (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, TO_EMAIL) in Site settings → Environment variables.
- Deploy. The function will be available at `/.netlify/functions/send-custom-tea` and frontend calls `/api/send-custom-tea` thanks to `netlify.toml` redirect.

Or via terminal (fast):

```bash
bash scripts/netlify-setup.sh
```

This will log in, link or create a Netlify site, import env vars from `.env` if present, and deploy to production.

Deploy button (after pushing to a Git host like GitHub):

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### 2) Vercel (alternative: static + serverless)
- Install Vercel CLI and log in.
- Create a new project, import this folder.
- Vercel will detect the `api/` directory and create serverless functions.
- Set the environment variables in Project Settings → Environment Variables.
- Deploy. The site will be available with `/api/send-custom-tea` working.

No build step is needed; it's a static site with serverless functions.

### 3) Static-only (GitHub Pages / Netlify static / Cloudflare Pages)
- If you don't need the email backend, you can deploy the static files as-is. The form will fallback to opening the user's email client via `mailto:`.

## Local Development
You can serve the static site locally:

- Python: `python3 -m http.server 5500`
- Or use any static server.

Note: Serverless functions require a platform (like Vercel) to execute.

## Security & Anti-spam
- Honeypot field (`website`) is used to deter bots. The backend discards submissions when it's filled.
- Validation occurs server-side; do not expose SMTP secrets client-side.

## Structure
- `index.html`, `css/`, `js/`, `images/` — Static site
- `api/` — Serverless functions (Vercel)
- `package.json` — Dependencies for serverless functions

## Support
If you'd like, provide deploy access on Vercel and I can finish the deployment and environment setup for you. I will need only project creation and environment variable configuration permissions (no SMTP credentials in code).