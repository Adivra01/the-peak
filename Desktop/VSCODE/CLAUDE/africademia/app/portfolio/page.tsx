'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { portfolioProjects } from '@/lib/data'
import Link from 'next/link'

const categories = ['Tous', 'Sites', 'E-commerce', 'Applications', 'Visuels', 'Campagnes']

export default function PortfolioPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [lightbox, setLightbox] = useState<typeof portfolioProjects[0] | null>(null)

  const filtered = activeFilter === 'Tous'
    ? portfolioProjects
    : portfolioProjects.filter(p => p.category === activeFilter)

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-20 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
          >
            Nos réalisations
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display font-bold dark:text-dark-text text-light-text mb-6"
          >
            Notre{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>Portfolio</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl dark:text-dark-muted text-light-muted max-w-2xl mx-auto"
          >
            150+ projets réalisés pour des entrepreneurs africains et de la diaspora.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-pill text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? isDark
                      ? 'bg-dark-gold text-dark-bg'
                      : 'bg-light-orange text-white'
                    : 'dark:bg-dark-card bg-white dark:border-dark-border border-light-border border dark:text-dark-muted text-light-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((project, i) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => setLightbox(project)}
                >
                  <div className="rounded-2xl overflow-hidden border dark:border-dark-border border-light-border hover:-translate-y-2 transition-transform duration-300">
                    <div className="relative h-56">
                      <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Voir le projet
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <span className="px-2.5 py-1 rounded-pill bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                          {project.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 dark:bg-dark-card bg-white">
                      <h3 className="font-display font-bold dark:text-dark-text text-light-text mb-2">{project.title}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded text-xs dark:bg-dark-bg dark:text-dark-muted bg-light-bg2 text-light-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-2xl w-full dark:bg-dark-card bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-72">
                <Image src={lightbox.image} alt={lightbox.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-display font-bold dark:text-dark-text text-light-text">{lightbox.title}</h3>
                  <span className={`px-3 py-1 rounded-pill text-xs font-medium ${isDark ? 'bg-dark-gold/10 text-dark-gold border border-dark-gold/20' : 'bg-light-orange/10 text-light-orange border border-light-orange/20'}`}>
                    {lightbox.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {lightbox.tech.map(t => (
                    <span key={t} className="px-3 py-1 rounded-lg text-sm dark:bg-dark-bg dark:text-dark-muted bg-light-bg2 text-light-muted">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href="/devis" className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white text-center transition-all hover:opacity-90 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
                    Projet similaire
                  </Link>
                  <button onClick={() => setLightbox(null)} className="px-4 py-3 rounded-xl border dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted text-sm">
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section className="py-16 text-center border-t dark:border-dark-border border-light-border">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
          Votre projet, notre prochain succès
        </h2>
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 mt-4 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
          Démarrer mon projet
        </Link>
      </section>
    </div>
  )
}
