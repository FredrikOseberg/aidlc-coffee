import { METRICS, summarize, type Cohort, type Summary } from '../../../api-lib/analytics';
import { bad, json, windowFrom, type Env } from '../../../api-lib/http';

/**
 * GET /api/analytics/metric?name=errorRate&minutes=5[&flag=name&cohort=on|off][&minSessions=5]
 * One number, for release guardrails.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') as keyof Summary | null;
  if (!name || !METRICS.includes(name)) return bad(`name must be one of ${METRICS.join(', ')}`);
  const cohort = (url.searchParams.get('cohort') ?? 'all') as Cohort;
  if (!['all', 'on', 'off'].includes(cohort)) return bad('cohort must be all, on or off');
  const { from, to } = windowFrom(url);
  const summary = await summarize(env.DB, from, to, url.searchParams.get('flag'), cohort, name.startsWith('checkoutLatency'));
  // Too few sessions to say anything: report no data rather than a misleading 0, so guardrails hold instead of acting.
  const minSessions = Number(url.searchParams.get('minSessions') ?? 5);
  const enough = summary.sessions >= minSessions;
  return json({ name, cohort, window: { from, to }, value: enough ? summary[name] : null, sessions: summary.sessions, minSessions });
};
