import { summarize, type Cohort } from '../../../api-lib/analytics';
import { bad, json, windowFrom, type Env } from '../../../api-lib/http';

/**
 * GET /api/analytics?minutes=60[&flag=name]
 * Shop metrics for the window. With ?flag, also split into users who had the flag on vs off.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const { from, to } = windowFrom(url);
  if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) return bad('invalid window');
  const flag = url.searchParams.get('flag');
  const all = await summarize(env.DB, from, to, null, 'all');
  if (!flag) return json({ window: { from, to }, all });
  const [on, off] = await Promise.all((['on', 'off'] as Cohort[]).map((c) => summarize(env.DB, from, to, flag, c)));
  return json({ window: { from, to }, flag, all, on, off });
};
