/**
 * Shop metrics over a time window, optionally split by whether a flag was on for the user.
 * A flag counts as "on" for an event when it appears in the event's flag snapshot.
 */
export type Cohort = 'all' | 'on' | 'off';

export type Summary = {
  sessions: number;
  users: number;
  addToCart: number;
  checkoutsStarted: number;
  orders: number;
  revenueCents: number;
  errors: number;
  /** orders / sessions */
  conversionRate: number;
  /** orders / checkouts started */
  checkoutCompletion: number;
  /** 1 - orders / sessions that added to cart */
  cartAbandonment: number;
  /** errors / sessions */
  errorRate: number;
  avgOrderCents: number;
  checkoutLatencyP50Ms: number | null;
  checkoutLatencyP95Ms: number | null;
  /** sessions that rendered dark (view_menu with props.theme = 'dark') / sessions */
  darkSessionShare: number;
  /** sessions that opened an allergen panel (allergen_info_viewed) */
  allergenViewSessions: number;
  /** allergenViewSessions / sessions */
  allergenViewRate: number;
};

const ratio = (a: number, b: number) => (b ? Math.round((a / b) * 10_000) / 10_000 : 0);

function cohortClause(flag: string | null, cohort: Cohort) {
  if (!flag || cohort === 'all') return { sql: '', args: [] as string[] };
  const path = `$."${flag.replace(/"/g, '')}"`;
  return cohort === 'on'
    ? { sql: ' AND json_extract(flags, ?) IS NOT NULL', args: [path] }
    : { sql: ' AND json_extract(flags, ?) IS NULL', args: [path] };
}

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return null;
  return Math.round(sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]!);
}

/** `withLatency: false` skips the latency query when the caller doesn't need it (saves D1 reads). */
export async function summarize(db: D1Database, from: string, to: string, flag: string | null, cohort: Cohort, withLatency = true): Promise<Summary> {
  const c = cohortClause(flag, cohort);
  const counts = await db
    .prepare(
      `SELECT
         COUNT(DISTINCT CASE WHEN type = 'view_menu' THEN session_id END) AS sessions,
         COUNT(DISTINCT user_id) AS users,
         SUM(type = 'add_to_cart') AS addToCart,
         SUM(type = 'checkout_started') AS checkoutsStarted,
         SUM(type = 'order_placed') AS orders,
         COALESCE(SUM(CASE WHEN type = 'order_placed' THEN value END), 0) AS revenueCents,
         SUM(type = 'error') AS errors,
         COUNT(DISTINCT CASE WHEN type = 'add_to_cart' THEN session_id END) AS cartSessions,
         COUNT(DISTINCT CASE WHEN type = 'order_placed' THEN session_id END) AS orderSessions,
         COUNT(DISTINCT CASE WHEN type = 'view_menu' AND json_extract(props, '$.theme') = 'dark' THEN session_id END) AS darkSessions,
         COUNT(DISTINCT CASE WHEN type = 'allergen_info_viewed' THEN session_id END) AS allergenViewSessions
       FROM events WHERE ts >= ? AND ts < ?${c.sql}`,
    )
    .bind(from, to, ...c.args)
    .first<Record<string, number | null>>();
  const n = (k: string) => Number(counts?.[k] ?? 0);

  const latencies = !withLatency
    ? { results: [] as { ms: number | null }[] }
    : await db
    .prepare(`SELECT CAST(json_extract(props, '$.latencyMs') AS REAL) AS ms FROM events WHERE type = 'order_placed' AND ts >= ? AND ts < ?${c.sql} AND props IS NOT NULL LIMIT 5000`)
    .bind(from, to, ...c.args)
    .all<{ ms: number | null }>();
  const ms = latencies.results.map((r) => r.ms).filter((v): v is number => typeof v === 'number').sort((a, b) => a - b);

  return {
    sessions: n('sessions'),
    users: n('users'),
    addToCart: n('addToCart'),
    checkoutsStarted: n('checkoutsStarted'),
    orders: n('orders'),
    revenueCents: n('revenueCents'),
    errors: n('errors'),
    conversionRate: ratio(n('orders'), n('sessions')),
    checkoutCompletion: ratio(n('orders'), n('checkoutsStarted')),
    cartAbandonment: n('cartSessions') ? Math.round((1 - n('orderSessions') / n('cartSessions')) * 10_000) / 10_000 : 0,
    errorRate: ratio(n('errors'), n('sessions')),
    avgOrderCents: n('orders') ? Math.round(n('revenueCents') / n('orders')) : 0,
    checkoutLatencyP50Ms: percentile(ms, 50),
    checkoutLatencyP95Ms: percentile(ms, 95),
    darkSessionShare: ratio(n('darkSessions'), n('sessions')),
    allergenViewSessions: n('allergenViewSessions'),
    allergenViewRate: ratio(n('allergenViewSessions'), n('sessions')),
  };
}

export const METRICS: (keyof Summary)[] = [
  'sessions', 'users', 'addToCart', 'checkoutsStarted', 'orders', 'revenueCents', 'errors', 'conversionRate',
  'checkoutCompletion', 'cartAbandonment', 'errorRate', 'avgOrderCents', 'checkoutLatencyP50Ms', 'checkoutLatencyP95Ms',
  'darkSessionShare', 'allergenViewSessions', 'allergenViewRate',
];
