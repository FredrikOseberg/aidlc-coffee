// Prints SQL that seeds 60 days of believable history: daily aggregates plus social feedback.
// The data carries a few findings for product research to discover:
//  - ~45% of orders from returning customers are identical to their previous order
//  - ~38% of sessions that add to cart never check out, worst on weekday mornings
//  - feedback keeps asking for a quicker way to "reorder my usual"
const DAYS = 60;
let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const noise = (spread) => 1 + (rand() - 0.5) * spread;
const sql = (v) => (typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

const out = ['DELETE FROM daily_metrics;', 'DELETE FROM feedback;'];
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

for (let d = DAYS; d >= 1; d--) {
  const date = new Date(today.getTime() - d * 86_400_000);
  const day = date.toISOString().slice(0, 10);
  const weekend = [0, 6].includes(date.getUTCDay());
  const growth = 1 + (DAYS - d) * 0.004;
  const sessions = Math.round((weekend ? 1650 : 1280) * growth * noise(0.18));
  const addToCart = Math.round(sessions * 0.58 * noise(0.08));
  const checkoutsStarted = Math.round(addToCart * (weekend ? 0.7 : 0.64) * noise(0.06));
  const orders = Math.round(checkoutsStarted * 0.94 * noise(0.04));
  const returning = Math.round(orders * 0.62 * noise(0.06));
  const identicalReorders = Math.round(returning * 0.45 * noise(0.08));
  const metrics = {
    sessions,
    add_to_cart: addToCart,
    checkouts_started: checkoutsStarted,
    orders,
    revenue_cents: Math.round(orders * 740 * noise(0.06)),
    errors: Math.round(sessions * 0.004 * noise(0.5)),
    returning_customer_orders: returning,
    identical_reorders: identicalReorders,
    // Seconds from opening the menu to placing an order, for returning customers.
    avg_time_to_order_seconds: Math.round((weekend ? 95 : 118) * noise(0.1)),
    mobile_share: Math.round(0.71 * noise(0.04) * 1000) / 1000,
  };
  for (const [metric, value] of Object.entries(metrics)) out.push(`INSERT INTO daily_metrics (day, metric, value) VALUES (${sql(day)}, ${sql(metric)}, ${value});`);
}

const FEEDBACK = [
  ['I order the exact same oat latte every morning. Let me hit one button.', 0.1, 6],
  ['Love the cardamom buns but checkout takes forever on my phone.', -0.2, 4],
  ['Wish the app remembered my usual order.', -0.1, 7],
  ['Fastest pickup in the neighbourhood, staff are lovely.', 0.8, 5],
  ['Why do I have to rebuild my cart from scratch every single day?', -0.5, 5],
  ['Gave up ordering on the train, too many taps, just queued instead.', -0.6, 4],
  ['Cold brew is excellent this summer.', 0.7, 3],
  ['Any chance of a loyalty card in the app?', 0.0, 3],
  ['The flat white is the best in town.', 0.9, 4],
  ['Reorder button please, same thing every day 🙏', 0.0, 5],
  ['App crashed at checkout once, order went through though.', -0.4, 2],
  ['Banana bread sold out again by 10am.', -0.2, 2],
];
const AUTHORS = ['maya.k', 'jonas_runs', 'priya.codes', 'tomas', 'lena_reads', 'sam.on.bikes', 'noor', 'felix', 'ada_l', 'kofi', 'ines', 'mateo'];
const CHANNELS = ['twitter', 'instagram', 'app-store', 'google-reviews'];
let i = 0;
for (const [text, sentiment, copies] of FEEDBACK) {
  for (let c = 0; c < copies; c++) {
    const ts = new Date(today.getTime() - Math.floor(rand() * DAYS * 86_400_000)).toISOString();
    const author = AUTHORS[(i++ * 7 + c) % AUTHORS.length];
    const channel = CHANNELS[Math.floor(rand() * CHANNELS.length)];
    out.push(`INSERT INTO feedback (ts, author, channel, text, sentiment, flags) VALUES (${sql(ts)}, ${sql(author)}, ${sql(channel)}, ${sql(text)}, ${Math.round(sentiment * noise(0.3) * 100) / 100}, '{}');`);
  }
}

console.log(out.join('\n'));
