import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Connexion' }

export default function LoginPage() {
  const user = getCurrentUser()
  if (user) redirect(user.role === 'admin' ? '/admin' : '/espace')
  return (
    <section className="auth-page">
      <div className="auth-visual"><div><span className="eyebrow light-eyebrow"><i /> Votre espace</span><h1>Reprendre là où vous vous êtes arrêté.</h1><p>Vos formations, ressources et accès réunis dans un espace simple.</p></div></div>
      <div className="auth-panel"><div className="auth-panel-inner"><span className="section-number">CONNEXION</span><h2>Bienvenue.</h2><p>Accédez à votre espace Africademia.</p><AuthForm mode="login" />{process.env.NODE_ENV !== 'production' && <div className="demo-accounts"><strong>Comptes de démonstration</strong><span>Admin : admin@africademia.local · Africademia2026!</span><span>Client : client@africademia.local · Client2026!</span></div>}</div></div>
    </section>
  )
}
