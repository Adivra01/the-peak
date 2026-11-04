'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Une erreur est survenue.'); setLoading(false); return }
    router.push(result.redirectTo); router.refresh()
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === 'register' && <label>Nom complet<input name="name" autoComplete="name" required minLength={2} placeholder="Votre nom" /></label>}
      <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" /></label>
      <label>Mot de passe<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} placeholder="8 caractères minimum" /></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button button-primary full-button" disabled={loading}>{loading ? 'Un instant…' : mode === 'login' ? 'Se connecter →' : 'Créer mon espace →'}</button>
      <p className="auth-switch">{mode === 'login' ? <>Nouveau sur Africademia ? <Link href="/inscription">Créer un compte</Link></> : <>Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link></>}</p>
    </form>
  )
}
