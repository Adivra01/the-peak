import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

function validOptionalUrl(value: unknown) {
  if (!value) return null
  try {
    const url = new URL(String(value))
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null
  } catch { return null }
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  const user = getCurrentUser()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  const workbookUrl = validOptionalUrl(body.workbookUrl)
  const chariowProductId = String(body.chariowProductId || '').trim().slice(0, 120) || null
  const priceLabel = String(body.priceLabel || '').trim().slice(0, 80) || null
  const enrollmentOpen = Boolean(body.enrollmentOpen)
  if (body.workbookUrl && !workbookUrl) {
    return NextResponse.json({ error: 'Les liens doivent commencer par http:// ou https://.' }, { status: 400 })
  }

  const result = db.prepare(`
    UPDATE formations SET payment_url = NULL, chariow_product_id = ?, workbook_url = ?, price_label = ?, enrollment_open = ?, updated_at = CURRENT_TIMESTAMP
    WHERE slug = ?
  `).run(chariowProductId, workbookUrl, priceLabel, enrollmentOpen ? 1 : 0, params.slug)
  if (!result.changes) return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
