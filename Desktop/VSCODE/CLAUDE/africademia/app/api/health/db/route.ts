import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = db.prepare('SELECT 1 AS ok').get() as { ok: number }
    return NextResponse.json({ connected: result.ok === 1, engine: 'sqlite' })
  } catch {
    return NextResponse.json({ connected: false, engine: 'sqlite' }, { status: 503 })
  }
}
