'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import Image from 'next/image'
import Link from 'next/link'

const serviceOptions = [
  'Développement Web', 'Application Mobile', 'E-commerce',
  'Logo & Identité', 'Visuels réseaux sociaux', 'Vidéo IA',
  'Campagne Meta Ads', 'Campagne TikTok Ads', 'Formation',
  'Hébergement & Maintenance', 'Autre',
]

const countries = [
  'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso', 'Guinée',
  'Cameroun', 'Congo', 'France', 'Belgique', 'Canada', 'Autre',
]

const budgets = [
  'Moins de 150 000 FCFA', '150 000 – 300 000 FCFA',
  '300 000 – 600 000 FCFA', '600 000 FCFA – 1 000 000 FCFA',
  'Plus de 1 000 000 FCFA', 'Je ne sais pas encore',
]

const delays = ['Urgent (moins de 2 semaines)', '2-4 semaines', '1-2 mois', 'Plus de 2 mois', 'Pas de contrainte']

const sources = ['Réseaux sociaux', 'Bouche à oreille', 'Google', 'WhatsApp', 'Publication TikTok', 'Autre']

interface FormData {
  prenom: string; nom: string; email: string; whatsapp: string; pays: string
  services: string[]; description: string; budget: string; delai: string; source: string
}

export default function DevisPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormData>({
    prenom: '', nom: '', email: '', whatsapp: '', pays: '',
    services: [], description: '', budget: '', delai: '', source: '',
  })

  const progress = (step / 4) * 100

  const handleServiceToggle = (s: string) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter(x => x !== s)
        : [...f.services, s],
    }))
  }

  const canNext = () => {
    if (step === 1) return form.prenom && form.nom && form.email && form.whatsapp && form.pays
    if (step === 2) return form.services.length > 0
    if (step === 3) return form.description
    return true
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen dark:bg-dark-bg bg-light-bg flex items-center justify-center pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
            Demande envoyée !
          </h1>
          <p className="dark:text-dark-muted text-light-muted mb-8">
            Merci {form.prenom} ! Notre équipe va analyser votre projet et vous recontacter sous 24h via WhatsApp ou email.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href={`https://wa.me/221781234567?text=Bonjour%2C%20j'ai%20soumis%20un%20devis%20pour%20${encodeURIComponent(form.services.join(', '))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ripple inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#20BC5B] transition-all"
            >
              Nous écrire sur WhatsApp
            </a>
            <Link href="/" className="px-6 py-3 rounded-xl border dark:border-dark-border border-light-border dark:text-dark-text text-light-text font-medium transition-all dark:hover:border-dark-gold hover:border-light-orange">
              Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-16 dark:bg-dark-bg2 bg-light-bg2">
        <div className="absolute inset-0 opacity-5">
          <Image src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&auto=format&fit=crop" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>
            Sans engagement
          </p>
          <h1 className="text-4xl lg:text-6xl font-display font-bold dark:text-dark-text text-light-text mb-4">
            Demandez votre{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>devis gratuit</span>
          </h1>
          <p className="dark:text-dark-muted text-light-muted text-lg">
            Remplissez ce formulaire en 2 minutes. Réponse sous 24h.
            <span className="block text-sm mt-2 font-medium dark:text-dark-gold text-light-orange">
              Aucun prix affiché — les tarifs sont partagés en consultation personnalisée.
            </span>
          </p>
        </div>
      </section>

      {/* Form wizard */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between mb-3">
              {['Contact', 'Services', 'Détails', 'Confirmation'].map((label, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium transition-colors ${
                    i + 1 <= step
                      ? isDark ? 'text-dark-gold' : 'text-light-orange'
                      : 'dark:text-dark-muted text-light-muted'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="h-1.5 dark:bg-dark-card bg-light-bg2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isDark ? 'linear-gradient(90deg, #E8A020, #F5C842)' : 'linear-gradient(90deg, #E85D04, #F5820A)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-5"
              >
                <h2 className="text-2xl font-display font-bold dark:text-dark-text text-light-text mb-6">Vos informations</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Prénom *</label>
                    <input
                      className="form-input"
                      value={form.prenom}
                      onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                      placeholder="Aminata"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Nom *</label>
                    <input
                      className="form-input"
                      value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Kouyaté"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Email professionnel *</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="aminata@votre-business.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">WhatsApp *</label>
                  <input
                    className="form-input"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="+221 77 000 00 00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Pays *</label>
                  <select
                    className="form-input"
                    value={form.pays}
                    onChange={e => setForm(f => ({ ...f, pays: e.target.value }))}
                  >
                    <option value="">Sélectionnez votre pays</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className="text-2xl font-display font-bold dark:text-dark-text text-light-text mb-2">Type de projet</h2>
                <p className="dark:text-dark-muted text-light-muted text-sm mb-6">Sélectionnez tout ce qui s'applique</p>
                <div className="flex flex-wrap gap-2.5">
                  {serviceOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleServiceToggle(s)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        form.services.includes(s)
                          ? isDark
                            ? 'bg-dark-gold/20 border-dark-gold text-dark-gold'
                            : 'bg-light-orange/15 border-light-orange text-light-orange'
                          : 'dark:bg-dark-card bg-white dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-5"
              >
                <h2 className="text-2xl font-display font-bold dark:text-dark-text text-light-text mb-6">Détails du projet</h2>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Décrivez votre projet *</label>
                  <textarea
                    className="form-input min-h-32 resize-y"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Parlez-nous de votre activité, de vos objectifs, de ce que vous souhaitez créer..."
                    rows={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Budget approximatif (optionnel)</label>
                  <select className="form-input" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Délai souhaité</label>
                  <select className="form-input" value={form.delai} onChange={e => setForm(f => ({ ...f, delai: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {delays.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Comment avez-vous entendu parler de nous ?</label>
                  <select className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <h2 className="text-2xl font-display font-bold dark:text-dark-text text-light-text mb-6">Récapitulatif</h2>
                <div className="rounded-2xl border dark:border-dark-border border-light-border dark:bg-dark-card bg-white p-6 space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="dark:text-dark-muted text-light-muted">Nom</span>
                    <span className="dark:text-dark-text text-light-text font-medium">{form.prenom} {form.nom}</span>
                    <span className="dark:text-dark-muted text-light-muted">Email</span>
                    <span className="dark:text-dark-text text-light-text font-medium">{form.email}</span>
                    <span className="dark:text-dark-muted text-light-muted">WhatsApp</span>
                    <span className="dark:text-dark-text text-light-text font-medium">{form.whatsapp}</span>
                    <span className="dark:text-dark-muted text-light-muted">Pays</span>
                    <span className="dark:text-dark-text text-light-text font-medium">{form.pays}</span>
                  </div>
                  <div className="border-t dark:border-dark-border border-light-border pt-4">
                    <p className="text-sm dark:text-dark-muted text-light-muted mb-2">Services sélectionnés :</p>
                    <div className="flex flex-wrap gap-2">
                      {form.services.map(s => (
                        <span key={s} className={`px-3 py-1 rounded-pill text-xs font-medium ${isDark ? 'bg-dark-gold/10 text-dark-gold border border-dark-gold/20' : 'bg-light-orange/10 text-light-orange border border-light-orange/20'}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {form.description && (
                    <div className="border-t dark:border-dark-border border-light-border pt-4">
                      <p className="text-sm dark:text-dark-muted text-light-muted mb-1">Description :</p>
                      <p className="text-sm dark:text-dark-text text-light-text">{form.description}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs dark:text-dark-muted text-light-muted text-center mb-6">
                  En soumettant ce formulaire, vous acceptez d'être contacté(e) par notre équipe via email ou WhatsApp.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t dark:border-dark-border border-light-border">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted hover:dark:text-dark-text hover:text-light-text transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Retour
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className={`btn-ripple flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all ${
                  canNext()
                    ? isDark
                      ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:scale-105'
                      : 'bg-gradient-to-r from-light-orange to-orange-500 hover:scale-105'
                    : 'opacity-50 cursor-not-allowed dark:bg-dark-card bg-light-bg2'
                }`}
              >
                Continuer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`btn-ripple flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow'
                    : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'
                }`}
              >
                Soumettre ma demande
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
