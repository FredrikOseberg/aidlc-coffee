import { bad, json, type Env } from '../../api-lib/http';

/** GET /api/feedback?limit=50[&since=ISO][&q=text] — the shop's social and app-store feedback, newest first. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? 50)));
  const since = url.searchParams.get('since') ?? '1970-01-01';
  const q = url.searchParams.get('q');
  const rows = await env.DB.prepare(
    `SELECT ts, author, channel, text, sentiment, flags FROM feedback WHERE ts >= ?${q ? ' AND text LIKE ?' : ''} ORDER BY ts DESC LIMIT ?`,
  )
    .bind(...(q ? [since, `%${q}%`, limit] : [since, limit]))
    .all<{ ts: string; author: string; channel: string; text: string; sentiment: number; flags: string }>();
  const posts = rows.results.map((r) => ({ ...r, flags: JSON.parse(r.flags) as Record<string, string> }));
  const avg = posts.length ? Math.round((posts.reduce((s, p) => s + p.sentiment, 0) / posts.length) * 100) / 100 : null;
  return json({ count: posts.length, averageSentiment: avg, posts });
};

/** POST /api/feedback { author, channel, text, sentiment (-1..1), flags } */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const p = (await request.json().catch(() => null)) as { author?: string; channel?: string; text?: string; sentiment?: number; flags?: Record<string, string> } | null;
  if (!p?.author || !p.text || typeof p.sentiment !== 'number') return bad('author, text and sentiment are required');
  await env.DB.prepare('INSERT INTO feedback (ts, author, channel, text, sentiment, flags) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(new Date().toISOString(), p.author.slice(0, 40), (p.channel ?? 'social').slice(0, 20), p.text.slice(0, 500), Math.max(-1, Math.min(1, p.sentiment)), JSON.stringify(p.flags ?? {}))
    .run();
  return json({ ok: true }, 201);
};
