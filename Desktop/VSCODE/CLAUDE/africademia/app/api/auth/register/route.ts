import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { name?: string; email?: string; password?: string } | null
  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password || ''
  if (!name || name.length < 2 || !email || !email.includes('@') || password.length < 8) {
    return NextResponse.json({ error: 'Nom, e-mail valide et mot de passe de 8 caractères minimum requis.' }, { status: 400 })
  }

  const existing = db.prepare('SELECT id, password_hash, status FROM users WHERE email = ?').get(email) as
    | { id: string; password_hash: string | null; status: string }
    | undefined
  if (existing?.password_hash) return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail.' }, { status: 409 })

  const passwordHash = await hash(password, 12)
  let userId = existing?.id
  if (userId) {
    db.prepare("UPDATE users SET name = ?, password_hash = ?, status = 'active' WHERE id = ?").run(name, passwordHash, userId)
  } else {
    userId = randomUUID()
    db.prepare("INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'client', 'active')")
      .run(userId, name, email, passwordHash)
  }
  createSession(userId)
  return NextResponse.json({ ok: true, redirectTo: '/espace' })
}
