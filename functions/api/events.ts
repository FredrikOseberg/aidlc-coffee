import { bad, json, type Env } from '../../api-lib/http';

const TYPES = new Set(['view_menu', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'order_placed', 'error', 'reorder_shown', 'reorder_used', 'theme_changed', 'allergen_info_viewed', 'favourite_added', 'favourite_removed', 'favourites_shown']);
const MAX_BATCH = 200;

type Incoming = { ts?: string; userId?: string; sessionId?: string; type?: string; value?: number; flags?: Record<string, string>; props?: Record<string, unknown> };

/** Batched analytics events from the shop or from simulated users. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { events?: Incoming[]; source?: string };
  try {
    body = await request.json();
  } catch {
    return bad('expected JSON');
  }
  const events = (body.events ?? []).slice(0, MAX_BATCH).filter((e) => e.userId && e.sessionId && e.type && TYPES.has(e.type));
  if (!events.length) return bad('no valid events');
  const source = body.source === 'simulator' ? 'simulator' : 'web';
  const stmt = env.DB.prepare('INSERT INTO events (ts, user_id, session_id, type, value, flags, props, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  await env.DB.batch(
    events.map((e) =>
      stmt.bind(
        e.ts ?? new Date().toISOString(),
        String(e.userId).slice(0, 64),
        String(e.sessionId).slice(0, 64),
        e.type!,
        typeof e.value === 'number' ? e.value : null,
        JSON.stringify(e.flags ?? {}),
        e.props ? JSON.stringify(e.props) : null,
        source,
      ),
    ),
  );
  return json({ stored: events.length }, 202);
};
