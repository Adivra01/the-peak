import 'server-only'
import { db } from './db'
import { Formation, getFormation } from './data'

type FormationSettings = {
  chariow_product_id: string | null
  workbook_url: string | null
  price_label: string | null
  enrollment_open: number
}

export async function getFormationWithDatabase(slug: string): Promise<Formation | undefined> {
  const formation = getFormation(slug)
  if (!formation) return undefined
  const settings = db.prepare(`
    SELECT chariow_product_id, workbook_url, price_label, enrollment_open
    FROM formations WHERE slug = ?
  `).get(slug) as FormationSettings | undefined
  return settings ? {
    ...formation,
    price: settings.price_label || undefined,
    enrollmentOpen: Boolean(settings.enrollment_open),
    workbookUrl: settings.workbook_url || undefined,
  } as Formation & { workbookUrl?: string } : formation
}

export function getFormationSettings() {
  return db.prepare(`
    SELECT slug, title, chariow_product_id, workbook_url, price_label, enrollment_open, updated_at
    FROM formations ORDER BY title
  `).all() as Array<{
    slug: string; title: string; chariow_product_id: string | null; workbook_url: string | null;
    price_label: string | null; enrollment_open: number; updated_at: string
  }>
}
