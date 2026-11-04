-- Documentation du schéma. La base est initialisée automatiquement par lib/db.ts.
CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT, role TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE formations (slug TEXT PRIMARY KEY, title TEXT NOT NULL, payment_url TEXT, chariow_product_id TEXT UNIQUE, workbook_url TEXT, price_label TEXT, enrollment_open INTEGER NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE purchases (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, formation_slug TEXT NOT NULL, provider TEXT NOT NULL, provider_reference TEXT UNIQUE NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL, purchased_at TEXT NOT NULL);
CREATE TABLE webhook_events (id TEXT PRIMARY KEY, provider TEXT NOT NULL, event_id TEXT NOT NULL, event_type TEXT NOT NULL, status TEXT NOT NULL, payload TEXT NOT NULL, received_at TEXT NOT NULL, UNIQUE(provider, event_id));
