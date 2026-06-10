'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { services } from '@/lib/data'

export default function ServicesPreview() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className="py-24 lg:py-32 dark:bg-dark-bg2 bg-light-bg2">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
            >
              Ce qu'on fait
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-display font-bold dark:text-dark-text text-light-text"
            >
              Nos services{' '}
              <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>digitaux</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/services"
              className={`group inline-flex items-center gap-2 px-6 py-3 rounded-pill border font-semibold text-sm transition-all hover:scale-105 ${
                isDark
                  ? 'border-dark-gold text-dark-gold hover:bg-dark-gold hover:text-dark-bg'
                  : 'border-light-orange text-light-orange hover:bg-light-orange hover:text-white'
              }`}
            >
              Voir tous les services
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Link href={`/services/${service.slug}`} className="group block h-full">
                <div className="h-full rounded-2xl border overflow-hidden dark:bg-dark-card bg-white dark:border-dark-border border-light-border transition-all duration-500 dark:hover:border-opacity-50 hover:-translate-y-2 dark:hover:shadow-dark-card-hover hover:shadow-light-card-hover"
                  style={{
                    '--hover-border': service.color,
                  } as React.CSSProperties}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Color accent */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all duration-300"
                      style={{ background: service.color }}
                    />

                    {/* Stat */}
                    <div className="absolute top-4 right-4">
                      <span
                        className="px-3 py-1 rounded-pill text-xs font-mono font-semibold text-white"
                        style={{ background: service.color + '33', border: `1px solid ${service.color}44` }}
                      >
                        {service.stats}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg dark:text-dark-text text-light-text mb-2 group-hover:transition-colors" style={{ '--hover-c': service.color } as React.CSSProperties}>
                      {service.title}
                    </h3>
                    <p className="text-sm dark:text-dark-muted text-light-muted leading-relaxed mb-4">
                      {service.shortDesc}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: service.color }}>
                      En savoir plus
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
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
