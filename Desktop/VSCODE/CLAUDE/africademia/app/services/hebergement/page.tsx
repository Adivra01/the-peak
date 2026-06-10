'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'

export default function HebergementPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&auto=format&fit=crop" alt="Hébergement" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-sm font-mono text-[#00D4FF] uppercase tracking-widest mb-4">Service 02</p>
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-4 max-w-3xl">
            Hébergement & <span className="gradient-text-cyan">Maintenance</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            Un site qui tombe, c'est un client perdu — pour toujours.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text text-center mb-12">
            Ce qu'on prend en charge
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Frais d\'agence mensuel', desc: 'Suivi régulier de votre site, mises à jour, monitoring de performance.' },
              { title: 'Hébergement Hostinger', desc: 'Partenaire certifié Hostinger. Serveurs rapides, uptime 99.9%, support prioritaire.' },
              { title: 'Maintenance Premium', desc: 'Mises à jour sécurité, backups automatiques, corrections de bugs sous 24h.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border dark:bg-dark-card bg-white dark:border-dark-border border-light-border"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <div className="w-5 h-5 rounded-full bg-cyan-400" />
                </div>
                <h3 className="font-display font-bold dark:text-dark-text text-light-text mb-2">{item.title}</h3>
                <p className="text-sm dark:text-dark-muted text-light-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <Link href="/devis" className="btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 transition-all hover:scale-105 hover:shadow-cyan-glow">
          Confier la gestion de mon site →
        </Link>
      </section>
    </div>
  )
}
