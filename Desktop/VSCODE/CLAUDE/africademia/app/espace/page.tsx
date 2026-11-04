import type { Metadata } from 'next'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Mon espace' }
export const dynamic = 'force-dynamic'

export default function ClientSpace() {
  const user = requireUser()
  const purchases = db.prepare(`
    SELECT p.id, p.status, p.purchased_at, p.amount, p.currency, f.slug, f.title, f.workbook_url
    FROM purchases p JOIN formations f ON f.slug = p.formation_slug
    WHERE p.user_id = ? AND p.status = 'paid' ORDER BY p.purchased_at DESC
  `).all(user.id) as Array<{ id: string; status: string; purchased_at: string; amount: number; currency: string; slug: string; title: string; workbook_url: string | null }>

  const formatDate = (date: string) => new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}Z`))

  const formatAmount = (amount: number, currency: string) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <section className="client-history-page">
      <div className="shell client-history-shell">
        <header className="client-history-header">
          <div>
            <span className="section-number">ESPACE CLIENT</span>
            <h1>Historique de vos formations.</h1>
            <p>{user.name} · {user.email}</p>
          </div>
          <LogoutButton />
        </header>

        <div className="client-history-intro">
          <span>{String(purchases.length).padStart(2, '0')} formation{purchases.length > 1 ? 's' : ''}</span>
          <p>Retrouvez ici uniquement les formations que vous avez achetées.</p>
        </div>

        {purchases.length ? (
          <div className="purchase-history">
            {purchases.map((purchase, index) => (
              <article className="purchase-history-card" style={{ '--card-index': index } as React.CSSProperties} key={purchase.id}>
                <span className="purchase-history-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="purchase-history-title">
                  <small>Formation achetée</small>
                  <h2>{purchase.title}</h2>
                </div>
                <div className="purchase-history-meta">
                  <span><small>Date d’achat</small>{formatDate(purchase.purchased_at)}</span>
                  <span><small>Montant</small>{formatAmount(purchase.amount, purchase.currency)}</span>
                  <span><small>Statut</small><b>Payée</b></span>
                </div>
                <div className="purchase-history-actions">
                  <Link href={`/formations/${purchase.slug}`}>Voir la formation <span>↗</span></Link>
                  {purchase.workbook_url && <a href={purchase.workbook_url} target="_blank" rel="noreferrer">Workbook <span>↗</span></a>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="client-history-empty">
            <span>00</span>
            <h2>Aucune formation achetée.</h2>
            <p>Vos futurs achats apparaîtront automatiquement dans cet historique.</p>
          </div>
        )}
      </div>
    </section>
  )
}
