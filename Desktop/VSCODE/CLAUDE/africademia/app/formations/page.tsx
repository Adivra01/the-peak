'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { formations } from '@/lib/data'

const badgeColors: Record<string, string> = {
  'Best seller': '#E8A020', 'Populaire': '#2D9E6B', 'Nouveau': '#1A5CB5', 'Live': '#E85D04',
}

export default function FormationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&auto=format&fit=crop"
            alt="Formations Africademia"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080C14]/90 via-[#080C14]/70 to-[#080C14]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4"
          >
            Apprenez. Créez. Gagnez.
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display font-bold text-white mb-6"
          >
            Nos <span className="gradient-text-gold">formations</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto mb-10"
          >
            Des formations pratiques, accessibles immédiatement, conçues pour générer des revenus réels.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-6 justify-center text-white/60 text-sm"
          >
            {['PDF + Accès immédiat', 'Séances live', 'Application pratique', 'Communauté incluse'].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
                {f}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Formations grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation, i) => (
              <motion.div
                key={formation.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
              >
                <div className="group h-full rounded-2xl border overflow-hidden dark:bg-dark-card bg-white dark:border-dark-border border-light-border transition-all duration-500 hover:-translate-y-2 dark:hover:shadow-dark-card-hover hover:shadow-light-card-hover">
                  {/* Image */}
                  <div className="relative h-56">
                    <Image src={formation.image} alt={formation.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-pill text-xs font-bold text-white"
                        style={{ backgroundColor: badgeColors[formation.badge] }}
                      >
                        {formation.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3 py-1.5 rounded-pill bg-white/15 backdrop-blur-sm text-white text-xs font-medium border border-white/30">
                        {formation.format}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-green-300 font-medium">Accès immédiat</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-xl dark:text-dark-text text-light-text mb-2">{formation.title}</h3>

                    {/* Problem */}
                    <div className="p-3 rounded-xl dark:bg-dark-bg bg-light-bg2 mb-3">
                      <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>Le problème résolu :</p>
                      <p className="text-xs dark:text-dark-muted text-light-muted">{formation.problem}</p>
                    </div>

                    <p className="text-sm dark:text-dark-muted text-light-muted leading-relaxed mb-5">{formation.description}</p>

                    <div className="flex gap-2">
                      <Link
                        href={`/formations/${formation.slug}`}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
                        style={{ background: isDark ? 'linear-gradient(135deg, #E8A020, #F5C842)' : 'linear-gradient(135deg, #E85D04, #F5820A)' }}
                      >
                        S'inscrire
                      </Link>
                      <Link
                        href={`/formations/${formation.slug}`}
                        className="flex-1 py-3 rounded-xl text-sm font-medium dark:text-dark-muted text-light-muted dark:bg-dark-bg bg-light-bg2 hover:dark:text-dark-text hover:text-light-text transition-all text-center"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center dark:bg-dark-bg2 bg-light-bg2">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
          Besoin d'un accompagnement personnalisé ?
        </h2>
        <p className="dark:text-dark-muted text-light-muted mb-8">Notre incubateur vous accompagne de A à Z dans votre projet.</p>
        <Link href="/incubateur" className={`btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
          Découvrir l'incubateur
        </Link>
      </section>
    </div>
  )
}
