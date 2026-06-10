'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'

const sessions = [
  {
    number: 'Séance 1',
    title: 'Fondamentaux + Outils IA',
    content: ['Introduction aux outils IA pour la création web', 'Prise en main des plateformes', 'Création de votre premier template', 'Bonnes pratiques design et UX'],
  },
  {
    number: 'Séance 2',
    title: 'Création du premier site complet',
    content: ['Développement d\'un site vitrine professionnel', 'Intégration des contenus et images', 'Optimisation mobile et desktop', 'Mise en ligne sur hébergement'],
  },
  {
    number: 'Séance 3',
    title: 'Déploiement + Comment trouver des clients',
    content: ['Stratégies pour trouver vos premiers clients', 'Pricing : comment fixer 200 000 FCFA et plus', 'Portfolio et présentation client', 'Outils de gestion de projets'],
  },
]

export default function FormationWebPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [openSession, setOpenSession] = useState<number | null>(0)

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&auto=format&fit=crop" alt="Formation Web" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4">Service 05 / Formation</p>
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-4 max-w-3xl">
            Créer des sites avec <span className="gradient-text-gold">l'IA</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            Et si vous pouviez créer des sites à 200 000 FCFA l'unité — même sans savoir coder ?
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#0D1526]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { label: '3 séances live', sublabel: 'd\'1h chacune' },
              { label: 'PDF inclus', sublabel: 'Ressources téléchargeables' },
              { label: 'Accès immédiat', sublabel: 'Démarrez aujourd\'hui' },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="font-display font-bold text-[#E8A020] text-lg">{f.label}</p>
                <p className="text-[#8A9BB5] text-sm mt-1">{f.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text text-center mb-10">
            Programme de la formation
          </h2>
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div key={i} className="rounded-xl border dark:border-dark-border border-light-border overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left dark:bg-dark-card bg-white"
                  onClick={() => setOpenSession(openSession === i ? null : i)}
                >
                  <div>
                    <span className={`text-xs font-mono font-semibold ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>{session.number}</span>
                    <h3 className="font-display font-semibold dark:text-dark-text text-light-text">{session.title}</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 dark:text-dark-muted text-light-muted transition-transform ${openSession === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSession === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="dark:bg-dark-bg bg-light-bg2 border-t dark:border-dark-border border-light-border"
                  >
                    <ul className="p-5 space-y-2">
                      {session.content.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm dark:text-dark-muted text-light-muted">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? '#E8A020' : '#E85D04' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center dark:bg-dark-bg2 bg-light-bg2">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
          Prêt à facturer 200 000 FCFA par site ?
        </h2>
        <p className="dark:text-dark-muted text-light-muted mb-8 max-w-md mx-auto">
          Places limitées — formation en live avec interaction directe.
        </p>
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow' : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'}`}>
          S'inscrire à la formation →
        </Link>
      </section>
    </div>
  )
}
