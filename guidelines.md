# Kettle & Crane engineering guidelines

## Architecture
- `src/`: React 19 + Vite + TypeScript. Components in `src/components/` are small and presentational; state lives in
  `App.tsx` and hooks in `src/lib/` (`useCart`, orders, identity).
- `functions/api/`: Cloudflare Pages Functions backed by D1 (`env.DB`). Shared query code lives in `api-lib/`, never
  inside `functions/` (every file there becomes a route). Schema changes are new files in `migrations/`.
- Orders and favourites a customer creates live in `localStorage` (this is a demo shop without accounts), keyed by
  `userId` from `src/lib/identity.ts`.
- Styling: plain CSS in `src/styles.css` with the existing palette (`--espresso`, `--crema`, `--cream`, `--leaf`).
  Fraunces for headings, Inter for text. Mobile first: check 390px wide.

## Analytics
- Every new customer-facing interaction is tracked with `track()` from `src/lib/analytics.ts`. Add new event types to
  `EventType` and to `TYPES` in `functions/api/events.ts` together.
- Events automatically carry the flags that were on for the user, so analytics can compare flag on vs off.

## Code style
- Strict TypeScript, no `any`. Keep components under ~150 lines.
- `npm run typecheck && npm run build` must pass.

## Feature flagging policy
- Every change in behaviour ships behind an Unleash feature flag; with the flag off the shop behaves exactly like main.
- The Unleash React SDK is **already set up**: `FlagProvider` in `src/main.tsx`, and `useFeature(name)` from
  `src/lib/flags.ts` is the only way components read flags. Do not add another initialisation.
- Server-side (Functions) changes in behaviour must also be gated or be strictly additive (new routes only called by
  flagged UI).
- Flag names: kebab-case, prefixed `coffee-`, e.g. `coffee-reorder-usual`.
- Preview deploys use the Unleash `development` environment; production uses `production`.
