#!/usr/bin/env bash
# One-time setup in your Cloudflare account. Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.
# Creates the D1 database and the Pages project, applies the schema and seeds history.
set -euo pipefail
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"

if ! grep -q '00000000-0000-0000-0000-000000000000' wrangler.toml; then
  echo "wrangler.toml already has a database_id; skipping database creation"
else
  id=$(npx wrangler d1 create aidlc-coffee 2>&1 | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  [ -n "$id" ] || { echo "could not create the D1 database"; exit 1; }
  sed -i.bak "s/00000000-0000-0000-0000-000000000000/$id/" wrangler.toml && rm wrangler.toml.bak
  echo "D1 database: $id (written to wrangler.toml)"
fi

npx wrangler pages project create aidlc-coffee --production-branch main 2>/dev/null || echo "Pages project already exists"
npx wrangler d1 migrations apply aidlc-coffee --remote
node scripts/seed.mjs > .seed.sql && npx wrangler d1 execute aidlc-coffee --remote --file .seed.sql
echo "Done. Commit wrangler.toml and push to main to deploy."
