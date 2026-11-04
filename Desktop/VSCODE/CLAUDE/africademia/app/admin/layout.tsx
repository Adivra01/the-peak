import DashboardNav from '@/components/dashboard/DashboardNav'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = requireUser('admin')
  return <section className="dashboard-shell admin-shell"><div className="shell dashboard-layout"><DashboardNav role="admin" name={user.name} /><div className="dashboard-main">{children}</div></div></section>
}
