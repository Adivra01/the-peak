import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'node:crypto'
import { db, DatabaseUser, UserRole } from './db'

const COOKIE_NAME = 'africademia_session'
const SESSION_DURATION = 60 * 60 * 24 * 14

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Math.floor(Date.now() / 1000))
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(tokenHash(token), userId, expiresAt)
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION,
  })
}

export function destroySession() {
  const token = cookies().get(COOKIE_NAME)?.value
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token))
  cookies().set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 })
}

export function getCurrentUser(): DatabaseUser | null {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  const row = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.status, u.created_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.status = 'active'
  `).get(tokenHash(token), Math.floor(Date.now() / 1000)) as DatabaseUser | undefined
  return row || null
}

export function requireUser(role?: UserRole) {
  const user = getCurrentUser()
  if (!user) redirect('/connexion')
  if (role && user.role !== role) redirect(user.role === 'admin' ? '/admin' : '/espace')
  return user
}
