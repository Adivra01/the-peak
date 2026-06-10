'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

export default function PublicitePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&auto=format&fit=crop" alt="Publicité" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4">Service 04</p>
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-4 max-w-3xl">
            Campagnes Publicitaires <span className="gradient-text-gold">Meta & TikTok</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            Booster un post ne suffit pas. C'est de l'argent jeté sans stratégie.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#0D1526]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { v: 340, s: '%', l: 'Leads en plus en moyenne' },
              { v: 3, s: 'x', l: 'Retour sur investissement' },
              { v: 50, s: '+', l: 'Campagnes gérées' },
              { v: 6, s: 'sem', l: 'Pour voir les premiers résultats' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl font-display font-bold gradient-text-gold mb-1 font-mono">
                  <AnimatedCounter value={s.v} suffix={s.s} />
                </div>
                <p className="text-[#8A9BB5] text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text text-center mb-10">
            Nos offres campagnes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Paramétrage Campagne',
                desc: 'Pour les comptes existants. Nous configurons et optimisons vos campagnes Meta ou TikTok Ads pour maximiser vos leads.',
                features: ['Audit de votre compte', 'Configuration ciblage', 'Créatifs optimisés', 'Rapport de performance'],
              },
              {
                title: 'Création + Paramétrage Complet',
                desc: 'Création de vos pages pro, Business Manager, Pixel, et lancement de vos premières campagnes.',
                features: ['Création Business Manager', 'Installation Pixel Meta', 'Pages pro configurées', 'Campagnes lancées'],
              },
            ].map((offer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 border dark:bg-dark-card bg-white dark:border-dark-border border-light-border"
              >
                <h3 className="font-display font-bold text-xl dark:text-dark-text text-light-text mb-3">{offer.title}</h3>
                <p className="dark:text-dark-muted text-light-muted text-sm mb-5">{offer.desc}</p>
                <ul className="space-y-2">
                  {offer.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm dark:text-dark-text text-light-text">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? '#E8A020' : '#E85D04' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm text-center">
            ⚠️ Le budget publicitaire (Meta/TikTok) reste à la charge du client.
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
          Lancer ma campagne →
        </Link>
      </section>
    </div>
  )
}
