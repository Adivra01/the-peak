import { NextRequest, NextResponse } from 'next/server'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'

type ChariowMoney = { value?: number; currency?: string }
type ChariowSalePayload = {
  event?: string
  sale?: {
    id?: string
    status?: string
    amount?: ChariowMoney
    custom_metadata?: Record<string, unknown> | null
  }
  product?: { id?: string; name?: string; url?: string }
  customer?: { id?: string; name?: string; first_name?: string; last_name?: string; email?: string }
  store?: { id?: string; name?: string }
  note?: string
}

function signaturesMatch(received: string, rawBody: string, secret: string) {
  if (!received.startsWith('sha256=')) return false
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function resolveFormation(payload: ChariowSalePayload) {
  const metadata = payload.sale?.custom_metadata || {}
  const metadataSlug = String(metadata.formation_slug || metadata.formationSlug || '').trim()
  if (metadataSlug) {
    const match = db.prepare('SELECT slug FROM formations WHERE slug = ?').get(metadataSlug) as { slug: string } | undefined
    if (match) return match.slug
  }

  const productId = payload.product?.id?.trim()
  if (productId) {
    const match = db.prepare('SELECT slug FROM formations WHERE chariow_product_id = ?').get(productId) as { slug: string } | undefined
    if (match) return match.slug
  }

  const productName = normalize(payload.product?.name || '')
  if (!productName) return null
  const formations = db.prepare('SELECT slug, title FROM formations').all() as Array<{ slug: string; title: string }>
  return formations.find(formation => normalize(formation.title) === productName)?.slug || null
}

export async function POST(request: NextRequest) {
  const secret = process.env.CHARIOW_PULSE_SECRET
  if (!secret || !secret.startsWith('whsec_')) {
    return NextResponse.json({ error: 'Pulse Chariow non configuré.' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-chariow-signature') || ''
  if (!signaturesMatch(signature, rawBody, secret)) {
    return NextResponse.json({ error: 'Signature Chariow invalide.' }, { status: 401 })
  }

  let payload: ChariowSalePayload
  try { payload = JSON.parse(rawBody) } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 })
  }

  const headerEvent = request.headers.get('x-pulse-event')
  if (payload.event !== 'successful.sale' || (headerEvent && headerEvent !== 'successful.sale')) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const configuredStore = process.env.CHARIOW_STORE_ID || 'store_itj9793a23b3'
  if (payload.store?.id && payload.store.id !== configuredStore) {
    return NextResponse.json({ error: 'Boutique Chariow inattendue.' }, { status: 403 })
  }

  const saleId = payload.sale?.id?.trim()
  const email = payload.customer?.email?.trim().toLowerCase()
  const formationSlug = resolveFormation(payload)
  const deliveryId = request.headers.get('x-pulse-delivery-id') || `test:${saleId || randomUUID()}`
  if (!saleId || !email || !formationSlug) {
    return NextResponse.json({ error: 'Vente, client ou formation introuvable dans le Pulse.' }, { status: 422 })
  }

  try {
    db.transaction(() => {
      db.prepare(`
        INSERT INTO webhook_events (id, provider, event_id, event_type, status, payload)
        VALUES (?, 'chariow', ?, 'successful.sale', 'processed', ?)
      `).run(randomUUID(), deliveryId, rawBody)

      let user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined
      if (!user) {
        const userId = randomUUID()
        const customerName = payload.customer?.name?.trim()
          || [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(' ').trim()
          || email.split('@')[0]
        db.prepare("INSERT INTO users (id, name, email, role, status) VALUES (?, ?, ?, 'client', 'invited')")
          .run(userId, customerName, email)
        user = { id: userId }
      }

      const amount = Math.max(0, Math.round(Number(payload.sale?.amount?.value || 0)))
      const currency = payload.sale?.amount?.currency || 'XOF'
      db.prepare(`
        INSERT INTO purchases (id, user_id, formation_slug, provider, provider_reference, amount, currency, status)
        VALUES (?, ?, ?, 'chariow', ?, ?, ?, 'paid')
        ON CONFLICT(provider_reference) DO UPDATE SET status = 'paid'
      `).run(randomUUID(), user.id, formationSlug, saleId, amount, currency)
    })()

    return NextResponse.json({ received: true, confirmed: true, formation: formationSlug })
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed: webhook_events')) {
      return NextResponse.json({ received: true, duplicate: true })
    }
    return NextResponse.json({ error: 'Traitement du Pulse impossible.' }, { status: 500 })
  }
}
