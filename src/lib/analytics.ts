import { sessionId, userId } from './identity';

export type EventType = 'view_menu' | 'add_to_cart' | 'remove_from_cart' | 'checkout_started' | 'order_placed' | 'error' | 'reorder_shown' | 'reorder_used' | 'theme_changed' | 'allergen_info_viewed' | 'favourite_added' | 'favourite_removed' | 'favourites_shown';

type AnalyticsEvent = {
  ts: string;
  userId: string;
  sessionId: string;
  type: EventType;
  /** Order total in cents, latency in ms, … depending on the event. */
  value?: number;
  /** Flags that were on for this user when the event happened, e.g. { "coffee-reorder": "on" }. */
  flags: Record<string, string>;
  props?: Record<string, string | number>;
};

const queue: AnalyticsEvent[] = [];
let flagSnapshot: Record<string, string> = {};
let timer: ReturnType<typeof setTimeout> | undefined;

/** Called whenever flags change, so every event carries the variants the user actually saw. */
export function setFlagSnapshot(flags: Record<string, string>) {
  flagSnapshot = flags;
}

async function flush() {
  timer = undefined;
  const batch = queue.splice(0, queue.length);
  if (!batch.length) return;
  try {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: batch }), keepalive: true });
  } catch {
    // Analytics must never break ordering.
  }
}

/** Events are batched for a couple of seconds to keep writes low. */
export function track(type: EventType, value?: number, props?: AnalyticsEvent['props']) {
  queue.push({ ts: new Date().toISOString(), userId, sessionId, type, value, flags: flagSnapshot, props });
  timer ??= setTimeout(() => void flush(), 2000);
}

addEventListener('pagehide', () => void flush());
