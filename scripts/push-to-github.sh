#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required" >&2
  exit 1
fi

# Initialize git if needed
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
  git add .
  git commit -m "Initial commit: Naghma Tea website (multilingual, inline SVG boxes, Netlify function, WhatsApp, SEO)"
  git branch -M main
fi

read -rp "Enter GitHub remote URL (e.g., https://github.com/<user>/<repo>.git): " REMOTE

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

git push -u origin main

echo "Pushed to $REMOTE"