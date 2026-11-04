import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password || ''
  if (!email || !password) return NextResponse.json({ error: 'E-mail et mot de passe requis.' }, { status: 400 })

  const user = db.prepare('SELECT id, password_hash, role, status FROM users WHERE email = ?').get(email) as
    | { id: string; password_hash: string | null; role: 'admin' | 'client'; status: string }
    | undefined
  if (!user?.password_hash || user.status !== 'active' || !(await compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
  }
  createSession(user.id)
  return NextResponse.json({ ok: true, redirectTo: user.role === 'admin' ? '/admin' : '/espace' })
}
