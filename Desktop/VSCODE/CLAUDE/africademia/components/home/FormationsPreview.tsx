'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { formations } from '@/lib/data'

const badgeColors: Record<string, string> = {
  'Best seller': '#E8A020',
  'Populaire': '#2D9E6B',
  'Nouveau': '#1A5CB5',
  'Live': '#E85D04',
}

export default function FormationsPreview() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className="py-24 lg:py-32 dark:bg-dark-bg bg-light-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
            >
              Apprenez & Gagnez
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-display font-bold dark:text-dark-text text-light-text"
            >
              Nos{' '}
              <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>formations</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/formations"
              className={`group inline-flex items-center gap-2 px-6 py-3 rounded-pill border font-semibold text-sm transition-all hover:scale-105 ${
                isDark
                  ? 'border-dark-gold text-dark-gold hover:bg-dark-gold hover:text-dark-bg'
                  : 'border-light-orange text-light-orange hover:bg-light-orange hover:text-white'
              }`}
            >
              Voir toutes les formations
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-5 gap-5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-6 lg:mx-0 px-6 lg:px-0">
          {formations.map((formation, i) => (
            <motion.div
              key={formation.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="flex-shrink-0 w-64 lg:w-auto"
            >
              <Link href={`/formations/${formation.slug}`} className="group block h-full">
                <div className="h-full rounded-2xl border overflow-hidden dark:bg-dark-card bg-white dark:border-dark-border border-light-border transition-all duration-500 hover:-translate-y-2 dark:hover:shadow-dark-card-hover hover:shadow-light-card-hover">
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={formation.image}
                      alt={formation.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-2.5 py-1 rounded-pill text-xs font-bold text-white"
                        style={{ backgroundColor: badgeColors[formation.badge] || '#E8A020' }}
                      >
                        {formation.badge}
                      </span>
                    </div>

                    {/* Format badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 rounded-pill text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        {formation.format}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display font-bold text-base dark:text-dark-text text-light-text mb-2 line-clamp-1">
                      {formation.title}
                    </h3>
                    <p className="text-xs dark:text-dark-muted text-light-muted leading-relaxed mb-4 line-clamp-2">
                      {formation.description}
                    </p>

                    {/* Access badge */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs text-green-400 font-medium">Accès immédiat</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, #E8A020, #F5C842)'
                            : 'linear-gradient(135deg, #E85D04, #F5820A)',
                        }}
                      >
                        S'inscrire
                      </button>
                      <button className="flex-1 py-2.5 rounded-lg text-xs font-medium dark:text-dark-muted text-light-muted dark:bg-dark-bg bg-light-bg2 transition-all hover:dark:text-dark-text hover:text-light-text">
                        En savoir +
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
