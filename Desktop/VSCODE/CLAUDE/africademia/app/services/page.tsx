'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { services } from '@/lib/data'

export default function ServicesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-20 dark:bg-dark-bg2 bg-light-bg2 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&auto=format&fit=crop" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
          >
            Ce qu'on fait
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display font-bold dark:text-dark-text text-light-text mb-6"
          >
            Nos{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl dark:text-dark-muted text-light-muted max-w-2xl mx-auto"
          >
            Des solutions digitales complètes pour les entrepreneurs africains — de la conception à la croissance.
          </motion.p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/services/${service.slug}`} className="group block">
                <div className="rounded-2xl border dark:bg-dark-card bg-white dark:border-dark-border border-light-border overflow-hidden transition-all duration-500 hover:-translate-y-2 dark:hover:shadow-dark-card-hover hover:shadow-light-card-hover">
                  <div className="relative h-64">
                    <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-2xl font-display font-bold text-white mb-2">{service.title}</h2>
                      <p className="text-white/70 text-sm">{service.shortDesc}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="dark:text-dark-muted text-light-muted text-sm leading-relaxed mb-4">{service.pain}</p>
                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: service.color }}>
                      Découvrir ce service
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
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">Vous ne savez pas par où commencer ?</h2>
        <p className="dark:text-dark-muted text-light-muted mb-8">Notre équipe analyse votre situation et vous propose la solution adaptée — gratuitement.</p>
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
          Consultation gratuite
        </Link>
      </section>
    </div>
  )
}
