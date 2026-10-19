-- Raw events from the shop (browser) and from simulated users.
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  value REAL,
  flags TEXT NOT NULL DEFAULT '{}',
  props TEXT,
  source TEXT NOT NULL DEFAULT 'web'
);
CREATE INDEX events_ts ON events (ts);
CREATE INDEX events_type_ts ON events (type, ts);

-- Pre-aggregated history (seeded), so research has months of data without millions of rows.
CREATE TABLE daily_metrics (
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  value REAL NOT NULL,
  PRIMARY KEY (day, metric)
);

-- A stand-in for social media and app-store feedback about the shop.
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  author TEXT NOT NULL,
  channel TEXT NOT NULL,
  text TEXT NOT NULL,
  sentiment REAL NOT NULL,
  flags TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX feedback_ts ON feedback (ts);
