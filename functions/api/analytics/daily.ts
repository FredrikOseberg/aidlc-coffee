import { bad, json, type Env } from '../../../api-lib/http';

/**
 * GET /api/analytics/daily?days=60[&metric=orders]
 * Daily history: seeded aggregates, plus live events rolled up for days that have them.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days') ?? 60)));
  const metric = url.searchParams.get('metric');
  if (metric && !/^[a-z_]+$/.test(metric)) return bad('invalid metric');
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const history = await env.DB.prepare(`SELECT day, metric, value FROM daily_metrics WHERE day >= ?${metric ? ' AND metric = ?' : ''} ORDER BY day`)
    .bind(...(metric ? [since, metric] : [since]))
    .all<{ day: string; metric: string; value: number }>();

  const live = await env.DB.prepare(
    `SELECT substr(ts, 1, 10) AS day,
            COUNT(DISTINCT CASE WHEN type = 'view_menu' THEN session_id END) AS sessions,
            SUM(type = 'add_to_cart') AS add_to_cart,
            SUM(type = 'checkout_started') AS checkouts_started,
            SUM(type = 'order_placed') AS orders,
            COALESCE(SUM(CASE WHEN type = 'order_placed' THEN value END), 0) AS revenue_cents,
            SUM(type = 'error') AS errors
     FROM events WHERE ts >= ? GROUP BY day ORDER BY day`,
  )
    .bind(since)
    .all<Record<string, number | string>>();

  const byDay = new Map<string, Record<string, number>>();
  for (const r of history.results) byDay.set(r.day, { ...(byDay.get(r.day) ?? {}), [r.metric]: r.value });
  for (const r of live.results) {
    const { day, ...metrics } = r;
    const existing = byDay.get(String(day)) ?? {};
    for (const [k, v] of Object.entries(metrics)) existing[k] = (existing[k] ?? 0) + Number(v ?? 0);
    byDay.set(String(day), existing);
  }
  const rows = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, m]) => ({ day, ...(metric ? { [metric]: m[metric] ?? 0 } : m) }));
  return json({ days, rows });
};
