/**
 * Simulated signals from the tools around the shop: support tickets (Zendesk), team chat (Slack), Reddit threads and the
 * internal ideas board. Dates are relative to the request, so the history always looks current.
 */
export type SignalSource = 'zendesk' | 'slack' | 'reddit' | 'internal';

type Seed = {
  source: SignalSource;
  daysAgo: number;
  author: string;
  title?: string;
  text: string;
  /** Zendesk: priority and status. Slack: channel. Reddit: subreddit, upvotes, comments. Internal: team and votes. */
  meta: Record<string, string | number>;
};

export type Signal = Omit<Seed, 'daysAgo'> & { id: string; ts: string; url: string };

const SEEDS: Seed[] = [
  // Zendesk: support tickets
  { source: 'zendesk', daysAgo: 2, author: 'Hannah W.', title: 'Can I order for a later time?', text: 'I want to order on my way to the station and pick up at 8:15, not as soon as I pay. My latte was cold by the time I arrived.', meta: { priority: 'normal', status: 'solved', tags: 'pickup-time,ordering' } },
  { source: 'zendesk', daysAgo: 5, author: 'Rob M.', title: 'Coffee waiting 20 minutes', text: 'Ordered at 7:40 for an 8:00 train, coffee sat on the counter for ages. Please let me choose a pickup slot.', meta: { priority: 'normal', status: 'solved', tags: 'pickup-time' } },
  { source: 'zendesk', daysAgo: 9, author: 'Aisha K.', title: 'Schedule an order for tomorrow morning?', text: 'Is there a way to place tomorrow\'s order tonight? I am always rushing in the morning.', meta: { priority: 'low', status: 'solved', tags: 'pickup-time,ordering' } },
  { source: 'zendesk', daysAgo: 16, author: 'Dan P.', title: 'Order ready too early', text: 'App says ready in 4 minutes but I am 15 minutes away. Can I tell you when I will arrive?', meta: { priority: 'low', status: 'closed', tags: 'pickup-time' } },
  { source: 'zendesk', daysAgo: 1, author: 'Lucy F.', title: 'Nut allergy: which pastries are safe?', text: 'My son has a severe nut allergy. The app does not list allergens for the pastries so we could not order. Please add this.', meta: { priority: 'high', status: 'open', tags: 'allergens,menu' } },
  { source: 'zendesk', daysAgo: 7, author: 'Marco S.', title: 'Gluten free options?', text: 'Is the banana bread gluten free? Could not find ingredient info anywhere in the app.', meta: { priority: 'normal', status: 'solved', tags: 'allergens,menu' } },
  { source: 'zendesk', daysAgo: 21, author: 'Priya D.', title: 'Dairy in the cardamom bun?', text: 'Need to know which buns contain dairy before ordering. Staff were helpful but I would like to see it in the app.', meta: { priority: 'normal', status: 'closed', tags: 'allergens' } },
  { source: 'zendesk', daysAgo: 3, author: 'Tom H.', title: 'Typing my card every time', text: 'Checkout makes me type my card number every single order. Can you add Apple Pay?', meta: { priority: 'normal', status: 'open', tags: 'checkout,payments' } },
  { source: 'zendesk', daysAgo: 12, author: 'Grace L.', title: 'Payment failed on mobile', text: 'Card form keeps zooming on my phone and I mistyped the expiry twice. Gave up and queued.', meta: { priority: 'normal', status: 'solved', tags: 'checkout,payments,mobile' } },
  { source: 'zendesk', daysAgo: 4, author: 'Omar B.', title: 'Oat milk marked unavailable', text: 'App said oat milk was unavailable so I switched drinks, then saw it on the counter. Very confusing.', meta: { priority: 'normal', status: 'solved', tags: 'stock,menu' } },
  { source: 'zendesk', daysAgo: 18, author: 'Nina R.', title: 'Item sold out after paying', text: 'Paid for banana bread, got told at pickup it was sold out. Refund took 3 days.', meta: { priority: 'high', status: 'closed', tags: 'stock,refunds' } },
  { source: 'zendesk', daysAgo: 10, author: 'Ben C.', title: 'Stamp card?', text: 'I used to have a paper stamp card. Is there a loyalty scheme in the app?', meta: { priority: 'low', status: 'solved', tags: 'loyalty' } },

  // Slack: the team's own channels
  { source: 'slack', daysAgo: 1, author: 'jess (Shoreditch store)', text: '8:00–8:30 is chaos again, 30+ app orders land at once and half the people turn up 15 min later. If people could pick a slot we could spread the bar.', meta: { channel: '#store-ops' } },
  { source: 'slack', daysAgo: 6, author: 'kwame (King\'s Cross store)', text: 'Remaking a lot of cold lattes for people who ordered too early. Pickup times would save us milk and a lot of grumpy faces.', meta: { channel: '#store-ops' } },
  { source: 'slack', daysAgo: 3, author: 'ollie (ops)', text: 'Stock toggles are manual and stores forget to flip oat milk back on. We lose orders every week to "unavailable" items that are actually there.', meta: { channel: '#store-ops' } },
  { source: 'slack', daysAgo: 8, author: 'sara (legal)', text: 'Reminder: allergen info must be available for pre-packed and made-to-order items. Online ordering should show the 14 allergens, at least on request.', meta: { channel: '#legal' } },
  { source: 'slack', daysAgo: 5, author: 'dev (sales)', text: 'Two offices asked again about ordering for the whole team in one go, with one payment. One of them orders 25 coffees every Friday by phone.', meta: { channel: '#sales' } },
  { source: 'slack', daysAgo: 14, author: 'dev (sales)', text: 'Lost a corporate account to Pret: their team orders were easier. Group ordering keeps coming up.', meta: { channel: '#sales' } },
  { source: 'slack', daysAgo: 2, author: 'mia (marketing)', text: 'Blank Street\'s new loyalty scheme is everywhere on Instagram. Our regulars keep asking when we get one.', meta: { channel: '#marketing' } },

  // Reddit
  { source: 'reddit', daysAgo: 4, author: 'u/commuter_bean', title: 'Kettle & Crane app: great coffee, but let me pick a pickup time', text: 'Best flat white near Liverpool St, but my order is always ready way before I get there. Starbucks lets you schedule, why can\'t they?', meta: { subreddit: 'r/london', upvotes: 214, comments: 47 } },
  { source: 'reddit', daysAgo: 11, author: 'u/oatmilkonly', title: 'Ordering ahead at coffee shops that actually works?', text: 'Kettle & Crane is fast but no scheduling. Costa\'s app at least lets me set a time.', meta: { subreddit: 'r/CasualUK', upvotes: 88, comments: 31 } },
  { source: 'reddit', daysAgo: 6, author: 'u/stampcollector', title: 'Which London coffee chains have the best loyalty?', text: 'Pret has the subscription, Blank Street has the app points, Kettle & Crane has... nothing? Love their buns though.', meta: { subreddit: 'r/london', upvotes: 132, comments: 64 } },
  { source: 'reddit', daysAgo: 20, author: 'u/allergymum', title: 'Coffee shops with proper allergen info online', text: 'Kettle & Crane staff are great about allergies in store but nothing in the app. Pret shows full allergens per item.', meta: { subreddit: 'r/Allergies', upvotes: 41, comments: 12 } },
  { source: 'reddit', daysAgo: 9, author: 'u/teamlunch', title: 'Ordering coffee for 20 people', text: 'Anyone know a London chain that does team orders through an app? Kettle & Crane would be ideal but I have to phone it in.', meta: { subreddit: 'r/london', upvotes: 23, comments: 9 } },
  { source: 'reddit', daysAgo: 25, author: 'u/nightowl', title: 'Coffee apps without dark mode', text: 'Ordering at 6am with a blinding white screen. Minor gripe.', meta: { subreddit: 'r/london', upvotes: 6, comments: 2 } },
  { source: 'reddit', daysAgo: 13, author: 'u/fav_flatwhite', title: 'Small wish for the K&C app', text: 'Would be nice to star a couple of favourite drinks.', meta: { subreddit: 'r/london', upvotes: 9, comments: 3 } },

  // Internal ideas board
  { source: 'internal', daysAgo: 30, author: 'Product', title: 'Loyalty stamps', text: 'Digital stamp card: every ninth drink free. Brings back the paper card regulars miss.', meta: { team: 'product', votes: 18 } },
  { source: 'internal', daysAgo: 12, author: 'Store ops', title: 'Pickup slots at peak', text: 'Let customers choose a 10-minute pickup slot so the bar can pace the 8am rush.', meta: { team: 'operations', votes: 24 } },
  { source: 'internal', daysAgo: 19, author: 'Sales', title: 'Team orders', text: 'One order, many drinks, one payment, for offices. Optional invoice.', meta: { team: 'sales', votes: 11 } },
  { source: 'internal', daysAgo: 40, author: 'Product', title: 'Favourite drinks', text: 'Let customers star drinks so their favourites show first.', meta: { team: 'product', votes: 4 } },
  { source: 'internal', daysAgo: 8, author: 'Ops', title: 'Live stock from the POS', text: 'Sync availability from the till so the app never shows sold-out or wrongly unavailable items.', meta: { team: 'operations', votes: 9 } },
];

const ORIGINS: Record<SignalSource, string> = {
  zendesk: 'https://kettleandcrane.zendesk.example/agent/tickets/',
  slack: 'https://kettleandcrane.slack.example/archives/',
  reddit: 'https://www.reddit.example/',
  internal: 'https://ideas.kettleandcrane.example/ideas/',
};

/** Signals newest first, with timestamps relative to `now`. */
export function signals(now: Date): Signal[] {
  return SEEDS.map((s, i) => {
    const ts = new Date(now.getTime() - s.daysAgo * 86_400_000 - ((i * 37) % 600) * 60_000);
    const { daysAgo: _d, ...rest } = s;
    return { ...rest, id: `${s.source}-${1000 + i}`, ts: ts.toISOString(), url: `${ORIGINS[s.source]}${1000 + i}` };
  }).sort((a, b) => b.ts.localeCompare(a.ts));
}
