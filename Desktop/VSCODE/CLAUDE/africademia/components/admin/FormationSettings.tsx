'use client'

import { FormEvent, useState } from 'react'

type Settings = { slug: string; title: string; chariow_product_id: string | null; workbook_url: string | null; price_label: string | null; enrollment_open: number }

export default function FormationSettings({ formation }: { formation: Settings }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('saving')
    const data = new FormData(event.currentTarget)
    const response = await fetch(`/api/admin/formations/${formation.slug}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chariowProductId: data.get('chariowProductId'), workbookUrl: data.get('workbookUrl'), priceLabel: data.get('priceLabel'), enrollmentOpen: data.get('enrollmentOpen') === 'on' }),
    })
    setState(response.ok ? 'saved' : 'error')
  }
  return (
    <form className="settings-card" onSubmit={save}>
      <div className="settings-heading"><div><span>{formation.slug}</span><h3>{formation.title}</h3></div><label className="toggle-label"><input type="checkbox" name="enrollmentOpen" defaultChecked={Boolean(formation.enrollment_open)} /><i /> Inscriptions</label></div>
      <div className="settings-grid">
        <label>Tarif affiché<input name="priceLabel" defaultValue={formation.price_label || ''} placeholder="35 000 FCFA" /></label>
        <label>ID produit Chariow<input name="chariowProductId" defaultValue={formation.chariow_product_id || ''} placeholder="prd_…" /></label>
        <label>Lien du workbook<input name="workbookUrl" type="url" defaultValue={formation.workbook_url || ''} placeholder="https://…" /></label>
      </div>
      <div className="settings-footer"><span className={`save-status ${state}`}>{state === 'saved' ? 'Modifications enregistrées.' : state === 'error' ? 'Impossible d’enregistrer.' : ''}</span><button disabled={state === 'saving'}>{state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </form>
  )
}
