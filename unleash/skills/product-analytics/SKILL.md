---
name: product-analytics
description: Use when you need numbers about how customers use the product, e.g. researching an opportunity, setting success criteria, or checking whether a released capability moved a metric for the users who have its feature flag on.
allowed-tools: Bash
---

# Product analytics

The product's analytics service lives on its production deployment. Take the base URL from the **Production** line in
your task (for example `https://aidlc-coffee.pages.dev`) and query it with `curl -s`, using `jq` to cut the JSON down.
All endpoints are read-only GETs and need no credentials.

```bash
BASE="<production url from your task>"
```

## Endpoints

| Endpoint | What it returns |
|---|---|
| `/api/analytics/daily?days=60[&metric=orders]` | One row per day. History for the last 60+ days, including research metrics that are only kept as daily aggregates. |
| `/api/analytics?minutes=60[&flag=<flag>]` | Funnel summary for a time window. With `flag`, also `on` and `off`: the same summary for users who had the flag on vs off. |
| `/api/analytics/metric?name=<metric>&minutes=60[&flag=<flag>&cohort=on\|off]` | One number, or `null` when fewer than `minSessions` (default 5) sessions are in the window. |

Windows: `minutes=N` ends now. Use `from=<ISO>&to=<ISO>` for an exact window (for example the time since a rollout started).

### Summary fields (`/api/analytics`, `/api/analytics/metric`)

`sessions`, `users`, `addToCart`, `checkoutsStarted`, `orders`, `revenueCents`, `errors`, `conversionRate` (orders /
sessions, 0–1), `checkoutCompletion` (orders / checkouts started, 0–1), `cartAbandonment` (1 − orders / sessions that
added to cart, 0–1), `errorRate` (errors / sessions, 0–1), `avgOrderCents`, `checkoutLatencyP50Ms`, `checkoutLatencyP95Ms`.

### Daily fields (`/api/analytics/daily`)

Live counters (`sessions`, `add_to_cart`, `checkouts_started`, `orders`, `revenue_cents`, `errors`) plus research
aggregates where they exist (for example `returning_customer_orders`, `identical_reorders`, `mobile_share`,
`avg_time_to_order_seconds`). List what a row actually contains before relying on a field:

```bash
curl -s "$BASE/api/analytics/daily?days=1" | jq '.rows[-1] | keys'
```

## Recipes

**Trend over time** (weekly averages read better than 60 noisy days):

```bash
curl -s "$BASE/api/analytics/daily?days=56" | jq -r '
  .rows | to_entries | group_by(.key / 7 | floor) | map(map(.value)) | .[] |
  "\(.[0].day)  sessions/day \((map(.sessions // 0) | add) / length | floor)  orders/day \((map(.orders // 0) | add) / length | floor)"'
```

**Derived ratios.** Compute them yourself from daily counts, e.g. share of orders that are identical reorders:
`identical_reorders / orders`, cart abandonment `1 - orders / add_to_cart`.

**Funnel right now:**

```bash
curl -s "$BASE/api/analytics?minutes=1440" | jq '.all | {sessions, addToCart, checkoutsStarted, orders, conversionRate, cartAbandonment, errorRate}'
```

**Flag cohorts: did the capability move the metric?**

```bash
curl -s "$BASE/api/analytics?minutes=60&flag=<flag>" | jq '{on: .on, off: .off} | map_values({sessions, conversionRate, checkoutCompletion, errorRate, checkoutLatencyP95Ms, avgOrderCents})'
```

## Reading the numbers honestly

- Always report the sample size (`sessions`) next to a rate. Under ~30 sessions per cohort, call the result inconclusive.
- Compare cohorts over the **same window**. Comparing today's "on" with last month's baseline mixes in seasonality.
- Report absolute and relative differences: "conversion 0.41 vs 0.36 (+0.05, +14%)".
- Rates are fractions from 0 to 1. Write them as percentages for humans, but keep thresholds on the 0–1 scale.
- Say which numbers are traffic from simulated users when the task tells you so; don't dress them up as real customers.
- Prefer a small markdown table over prose for any comparison.
