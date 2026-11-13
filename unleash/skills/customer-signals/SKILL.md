---
name: customer-signals
description: Use when you need what customers and the team are raising outside the product itself, e.g. support tickets, team chat, Reddit threads and the internal ideas board, to find problems worth solving or to gauge demand for an idea.
allowed-tools: Bash
---

# Customer signals

The product's signals service lives on its production deployment. Take the base URL from the **Production** line in
your task and read it with `curl -s` and `jq`. It is read-only and needs no credentials.

```bash
BASE="<production url from your task>"
curl -s "$BASE/api/signals?days=30" | jq '{count, bySource: (.items | group_by(.source) | map({(.[0].source): length}) | add)}'
```

## Endpoint

`GET /api/signals?source=<zendesk|slack|reddit|internal>[&days=30][&q=text]`, newest first:

```json
{ "sources": ["zendesk", "slack", "reddit", "internal"], "count": 2,
  "items": [{ "id": "zendesk-1004", "source": "zendesk", "ts": "…", "author": "Lucy F.", "title": "…", "text": "…", "url": "…",
              "meta": { "priority": "high", "status": "open", "tags": "allergens,menu" } }] }
```

| Source | What it is | Useful `meta` |
|---|---|---|
| `zendesk` | Support tickets from customers | `priority` (low/normal/high), `status`, `tags` |
| `slack` | The team's own channels: stores, ops, sales, legal, marketing | `channel` |
| `reddit` | Public threads that mention the shop | `subreddit`, `upvotes`, `comments` |
| `internal` | The internal ideas board | `team`, `votes` |

## Recipes

```bash
# Everything from one source, compact
curl -s "$BASE/api/signals?source=zendesk&days=60" | jq -r '.items[] | "\(.ts[:10])\t\(.meta.priority // "")\t\(.title // "")\t\(.text)"'
# Search across sources for a theme
curl -s "$BASE/api/signals?days=60&q=pickup" | jq -r '.items[] | "\(.source)\t\(.title // .meta.channel // "")\t\(.text[:120])"'
# Reddit reach
curl -s "$BASE/api/signals?source=reddit&days=60" | jq '[.items[] | {title, upvotes: .meta.upvotes, comments: .meta.comments}]'
```

## Reading signals

- Group items into themes by the underlying need, not by wording ("pick a pickup slot" and "order for later" are one theme).
- For each theme give the count per source, the strongest evidence (high-priority tickets, upvotes, votes), and 1–3 quotes with their `url`.
- Team chat is the people who see the problem every day (stores, sales, legal); weigh a legal or ops concern as risk, not just demand.
- Don't invent volume: if a theme appears once, say once.
