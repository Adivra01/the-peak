import 'server-only'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { hashSync } from 'bcryptjs'
import { formations } from './data'

const databasePath = process.env.SQLITE_PATH || join(process.cwd(), 'data', 'africademia.db')
if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true })

const globalDatabase = globalThis as typeof globalThis & { africademiaDb?: Database.Database }
export const db = globalDatabase.africademiaDb || new Database(databasePath)
if (process.env.NODE_ENV !== 'production') globalDatabase.africademiaDb = db

db.pragma('foreign_keys = ON')
db.pragma('busy_timeout = 5000')
if (databasePath !== ':memory:') db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'invited', 'suspended')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS sessions_user_index ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS sessions_expiry_index ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS formations (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    payment_url TEXT,
    chariow_product_id TEXT,
    workbook_url TEXT,
    price_label TEXT,
    enrollment_open INTEGER NOT NULL DEFAULT 0 CHECK(enrollment_open IN (0, 1)),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    formation_slug TEXT NOT NULL REFERENCES formations(slug) ON DELETE RESTRICT,
    provider TEXT NOT NULL DEFAULT 'manual',
    provider_reference TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'XOF',
    status TEXT NOT NULL DEFAULT 'paid' CHECK(status IN ('pending', 'paid', 'refunded', 'cancelled')),
    purchased_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS purchases_user_index ON purchases(user_id);
  CREATE INDEX IF NOT EXISTS purchases_formation_index ON purchases(formation_slug);

  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    payload TEXT NOT NULL,
    received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, event_id)
  );
`)

const formationColumns = db.prepare('PRAGMA table_info(formations)').all() as Array<{ name: string }>
if (!formationColumns.some(column => column.name === 'chariow_product_id')) {
  db.exec('ALTER TABLE formations ADD COLUMN chariow_product_id TEXT')
}
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS formations_chariow_product_index ON formations(chariow_product_id) WHERE chariow_product_id IS NOT NULL')

const upsertFormation = db.prepare(`
  INSERT INTO formations (slug, title, price_label, enrollment_open)
  VALUES (@slug, @title, @price, @enrollmentOpen)
  ON CONFLICT(slug) DO UPDATE SET title = excluded.title
`)
db.transaction(() => formations.forEach(({ slug, title, price, enrollmentOpen }) => upsertFormation.run({
  slug,
  title,
  price: price || null,
  enrollmentOpen: enrollmentOpen ? 1 : 0,
})))()

function seedUser(email: string | undefined, password: string | undefined, name: string, role: 'admin' | 'client') {
  if (!email || !password) return
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
    ON CONFLICT(email) DO NOTHING
  `).run(randomUUID(), name, email.toLowerCase(), hashSync(password, 12), role)
}

seedUser(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, process.env.ADMIN_NAME || 'Administrateur', 'admin')

if (process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO_ACCOUNTS !== 'false') {
  seedUser('admin@africademia.local', 'Africademia2026!', 'Admin Africademia', 'admin')
  seedUser('client@africademia.local', 'Client2026!', 'Client Démo', 'client')

  const demoClient = db.prepare("SELECT id FROM users WHERE email = 'client@africademia.local'").get() as { id: string } | undefined
  if (demoClient) {
    db.prepare(`
      INSERT INTO purchases (id, user_id, formation_slug, provider, provider_reference, amount, currency, status)
      VALUES (?, ?, 'musique-ia', 'demo', 'DEMO-MUSIQUE-001', 35000, 'XOF', 'paid')
      ON CONFLICT(provider_reference) DO NOTHING
    `).run(randomUUID(), demoClient.id)
  }
}

export type UserRole = 'admin' | 'client'
export type DatabaseUser = { id: string; name: string; email: string; role: UserRole; status: string; created_at: string }
