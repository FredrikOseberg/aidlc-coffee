---
name: social-listening
description: Use when you need to know what customers are saying about the product on social media and app stores, e.g. finding unmet needs during research, or checking how customers received a newly released capability.
allowed-tools: Bash
---

# Social listening

The product collects social and app-store posts that mention it. Take the base URL from the **Production** line in your
task and read the feed with `curl -s` and `jq`. It is read-only and needs no credentials.

```bash
BASE="<production url from your task>"
curl -s "$BASE/api/feedback?limit=200&since=2026-01-01" | jq '{count, averageSentiment}'
```

## Endpoint

`GET /api/feedback?limit=<1-200>[&since=<ISO date>][&q=<text>]` returns posts newest first:

```json
{ "count": 2, "averageSentiment": 0.41,
  "posts": [{ "ts": "…", "author": "maya.k", "channel": "instagram", "text": "…", "sentiment": 0.8, "flags": { "<flag>": "on" } }] }
```

- `sentiment` runs from −1 (angry) to 1 (delighted).
- `channel` is where it was posted: `twitter`, `instagram`, `app-store`, `google-reviews`, …
- `flags` lists the feature flags that were on for the author when they posted. `{}` means none.
- `q` is a plain substring search over the text.

## Recipes

**Themes.** Pull a large sample and read it. Group posts into themes yourself (needs, complaints, praise); don't rely on
keyword counts alone.

```bash
curl -s "$BASE/api/feedback?limit=200&since=2026-01-01" | jq -r '.posts[] | "\(.sentiment | . * 100 | floor / 100)\t\(.channel)\t\(.text)"'
```

**Sentiment by channel:**

```bash
curl -s "$BASE/api/feedback?limit=200&since=2026-01-01" | jq '.posts | group_by(.channel) | map({channel: .[0].channel, posts: length, avg: ((map(.sentiment) | add) / length * 100 | floor / 100)})'
```

**Reception of a capability.** Compare authors who had its flag on with everyone else, and look for posts that name it:

```bash
F="<flag>"
curl -s "$BASE/api/feedback?limit=200&since=<rollout start ISO>" | jq --arg f "$F" '
  .posts | {withFlag: map(select(.flags[$f] != null)), without: map(select(.flags[$f] == null))} |
  map_values({posts: length, avg: (if length > 0 then (map(.sentiment) | add) / length * 100 | floor / 100 else null end)})'
curl -s "$BASE/api/feedback?limit=50&q=<feature name>" | jq -r '.posts[] | "\(.sentiment)\t\(.text)"'
```

## Reporting

- Quote real posts as evidence (author, channel, date, text). Use two or three per theme, not every post.
- Give the volume behind every claim ("11 of 65 posts mention reordering").
- Separate what people ask for from how they feel. A small number of loud posts is a signal, not a verdict.
- When there is too little feedback to say anything, say so.
