#!/bin/sh
# Usage: ./push-github.sh TON_USERNAME_GITHUB
set -e
cd "$(dirname "$0")"
USER="${1:-}"
if [ -z "$USER" ]; then
  echo "Usage: ./push-github.sh TON_USERNAME_GITHUB"
  echo "Crée d'abord le repo vide sur https://github.com/new (nom: soundlog)"
  exit 1
fi
if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin déjà configuré:"
  git remote -v
else
  git remote add origin "https://github.com/${USER}/soundlog.git"
fi
git branch -M main
git push -u origin main
echo "OK — va sur https://vercel.com et importe le repo soundlog"
