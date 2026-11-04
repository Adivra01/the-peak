import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Créer un compte' }

export default function RegisterPage() {
  const user = getCurrentUser()
  if (user) redirect(user.role === 'admin' ? '/admin' : '/espace')
  return (
    <section className="auth-page">
      <div className="auth-visual register-visual"><div><span className="eyebrow light-eyebrow"><i /> Rejoindre Africademia</span><h1>Votre progression commence ici.</h1><p>Créez votre espace pour retrouver vos achats et ressources.</p></div></div>
      <div className="auth-panel"><div className="auth-panel-inner"><span className="section-number">INSCRIPTION</span><h2>Créer mon espace.</h2><p>Quelques secondes suffisent.</p><AuthForm mode="register" /></div></div>
    </section>
  )
}
