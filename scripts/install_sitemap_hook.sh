#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f ".githooks/pre-commit" ]; then
  echo "Missing .githooks/pre-commit"
  exit 1
fi

chmod +x .githooks/pre-commit
git config core.hooksPath .githooks

echo "Installed Git hooks path: .githooks"
echo "Sitemap pre-commit hook is active."

