import { signals, type SignalSource } from '../../api-lib/signals';
import { bad, json, type Env } from '../../api-lib/http';

const SOURCES: SignalSource[] = ['zendesk', 'slack', 'reddit', 'internal'];

/**
 * GET /api/signals?source=zendesk|slack|reddit|internal[&days=30][&q=text]
 * Support tickets, team chat, Reddit threads and internal ideas that mention the shop, newest first.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const url = new URL(request.url);
  const source = url.searchParams.get('source');
  if (source && !SOURCES.includes(source as SignalSource)) return bad(`source must be one of ${SOURCES.join(', ')}`);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days') ?? 30)));
  const q = url.searchParams.get('q')?.toLowerCase();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const items = signals(new Date()).filter(
    (s) => (!source || s.source === source) && s.ts >= since && (!q || `${s.title ?? ''} ${s.text}`.toLowerCase().includes(q)),
  );
  return json({ sources: SOURCES, count: items.length, items });
};
