'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'

const catalog = [
  { name: 'Logo Starter', desc: '1 concept + 2 révisions' },
  { name: 'Logo Business', desc: '3 concepts + révisions illimitées + charte couleurs' },
  { name: 'Logo Premium', desc: 'Branding complet : logo, typographie, guide de marque' },
  { name: 'Pack visuel x5', desc: '5 visuels réseaux sociaux personnalisés' },
  { name: 'Pack visuel x10', desc: '10 visuels + templates réutilisables' },
  { name: 'Pack visuel x20', desc: '20 visuels + stratégie de publication offerte' },
  { name: 'Vidéo IA Simple', desc: 'Vidéo 60s avec voix, texte animé, musique' },
  { name: 'Vidéo IA Premium', desc: 'Montage complet, transitions pro, musique licenciée' },
]

export default function MarketingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&auto=format&fit=crop" alt="Marketing" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <p className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4">Service 03</p>
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-4 max-w-3xl">
            Marketing Digital <span className="gradient-text-gold">& Pôle Créatif</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            Vous publiez. Vous publiez. Vous publiez. Et personne ne réagit.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#0D1526]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#8A9BB5] text-lg leading-relaxed">
            Sans stratégie visuelle cohérente, sans branding professionnel, vos posts se noient dans le flux.
            Vos concurrents, avec un <span className="text-white font-semibold">logo propre et des visuels forts</span>, paraissent 10x plus crédibles.
          </p>
        </div>
      </section>

      <section className="py-20 dark:bg-dark-bg bg-light-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text text-center mb-12">
            Catalogue services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {catalog.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border dark:bg-dark-card bg-white dark:border-dark-border border-light-border hover:-translate-y-1 transition-transform"
              >
                <h3 className="font-display font-semibold dark:text-dark-text text-light-text mb-2">{item.name}</h3>
                <p className="text-sm dark:text-dark-muted text-light-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
          Commander mes visuels →
        </Link>
      </section>
    </div>
  )
}
