import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

export default function DashboardNav({ role, name }: { role: 'admin' | 'client'; name: string }) {
  const links = role === 'admin'
    ? [['/admin', 'Vue d’ensemble'], ['/admin/achats', 'Achats'], ['/admin/clients', 'Clients'], ['/admin/formations', 'Formations']]
    : [['/espace', 'Mon espace'], ['/formations', 'Catalogue']]
  return (
    <aside className="dashboard-nav">
      <div><span className="dashboard-avatar">{name.charAt(0).toUpperCase()}</span><small>{role === 'admin' ? 'Administrateur' : 'Apprenant'}</small><strong>{name}</strong></div>
      <nav>{links.map(([href, label]) => <Link href={href} key={href}>{label}<span>↗</span></Link>)}</nav>
      <LogoutButton />
    </aside>
  )
}
