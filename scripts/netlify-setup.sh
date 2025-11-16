#!/usr/bin/env bash
set -euo pipefail

# Netlify one-time setup + deploy script
# Usage: bash scripts/netlify-setup.sh
# Notes:
# - Requires Node.js (for npx) and a Netlify account
# - Will open a browser window for Netlify login the first time

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

command -v npx >/dev/null 2>&1 || {
  echo "npx (Node.js) is required. Please install Node.js first." >&2
  exit 1
}

# Login (opens browser on first run)
echo "\n>>> Logging into Netlify (browser may open)..."
npx netlify-cli login

# Link or init the site
if [ -f ".netlify/state.json" ]; then
  echo ">>> Netlify site already linked."
else
  echo ">>> Linking/creating Netlify site..."
  npx netlify-cli init --manual
fi

# Environment variables
# If .env exists, import automatically; otherwise print helpful commands
if [ -f .env ]; then
  echo ">>> Importing environment variables from .env ..."
  # shellcheck disable=SC2002
  while IFS='=' read -r key val; do
    # skip comments/empty
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    k=$(echo "$key" | xargs)
    v=$(echo "$val" | sed 's/^\"\|\"$//g' | xargs)
    if [ -n "$k" ] && [ -n "$v" ]; then
      npx netlify-cli env:set "$k" "$v" >/dev/null
    fi
  done < .env
  echo ">>> Env vars imported."
else
  echo ">>> .env not found. Set these in Netlify (Site settings → Environment variables) or run:" 
  cat <<EOF
npx netlify-cli env:set SMTP_HOST <your-smtp-host>
npx netlify-cli env:set SMTP_PORT 587
npx netlify-cli env:set SMTP_SECURE false
npx netlify-cli env:set SMTP_USER <your-smtp-user>
npx netlify-cli env:set SMTP_PASS <your-smtp-pass>
npx netlify-cli env:set SMTP_FROM "Naghma Tea <no-reply@naghmateas.com>"
npx netlify-cli env:set TO_EMAIL orders@naghmateas.com
EOF
fi

# Production deploy
echo ">>> Deploying to Netlify (production)..."
npx netlify-cli deploy --build --prod --dir .

echo "\n>>> Done. Your site should be live. Check the URL above."
