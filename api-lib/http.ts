export type Env = { DB: D1Database };

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
  });

export const bad = (message: string, status = 400) => json({ error: message }, status);

/** Time window from ?minutes=N, or ?from=&to= (ISO). Defaults to the last 60 minutes. */
export function windowFrom(url: URL) {
  const to = url.searchParams.get('to') ?? new Date().toISOString();
  const minutes = Number(url.searchParams.get('minutes') ?? 60);
  const from = url.searchParams.get('from') ?? new Date(Date.parse(to) - minutes * 60_000).toISOString();
  return { from, to };
}
