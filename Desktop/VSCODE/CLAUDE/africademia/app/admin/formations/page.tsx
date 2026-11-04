import FormationSettings from '@/components/admin/FormationSettings'
import { getFormationSettings } from '@/lib/formation-repository'

export default function AdminFormationsPage() {
  const formations = getFormationSettings()
  return <><header className="dashboard-heading"><div><span className="section-number">CATALOGUE</span><h1>Formations.</h1></div><p>Tarifs, workbooks et disponibilité. Les inscriptions passent par WhatsApp.</p></header><div className="settings-list">{formations.map(formation => <FormationSettings key={formation.slug} formation={formation} />)}</div></>
}
