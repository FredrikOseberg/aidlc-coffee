# Kettle & Crane

A demo coffee shop used to show an AI-native delivery lifecycle (ai-dlc) end to end: agents plan, build, release and
validate capabilities on this repo, with every change shipped behind an Unleash feature flag.

- **App:** React + Vite + TypeScript, deployed to Cloudflare Pages.
- **Analytics service:** Pages Functions + D1 (`functions/api`).
  - `POST /api/events` batched shop events
  - `GET /api/analytics?minutes=60&flag=<name>` funnel, conversion, error rate and checkout latency, split by flag on/off
  - `GET /api/analytics/metric?name=errorRate&minutes=5&flag=<name>&cohort=on` one number, for release guardrails
  - `GET /api/analytics/daily?days=60` daily history
  - `GET|POST /api/feedback` social and app-store feedback
  - `/version.json` the deployed commit
- **Feature flags:** Unleash Frontend API (`VITE_UNLEASH_URL`, `VITE_UNLEASH_CLIENT_KEY`). With them unset, every flag is off.

## Develop

```
npm install
npm run db:migrate:local && npm run db:seed:local
npm run pages:dev        # app + API on http://localhost:8788
```

## Deploy

Pull requests get a preview deploy (link posted on the PR); merging to `main` deploys to production.
Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_UNLEASH_URL`, `VITE_UNLEASH_CLIENT_KEY`.
