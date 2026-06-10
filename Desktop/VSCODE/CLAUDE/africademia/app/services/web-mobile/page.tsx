'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import ProcessSection from '@/components/home/ProcessSection'

const deliverables = [
  'Site vitrine professionnel (5-10 pages)',
  'Design responsive mobile / tablette / desktop',
  'SEO on-page configuré',
  'Formulaire de contact fonctionnel',
  'Intégration Google Analytics',
  '1 mois de support offert post-livraison',
]

const siteTypes = [
  {
    title: 'Site Vitrine',
    desc: 'Votre carte de visite en ligne. Design soigné, contenu optimisé, référencement Google.',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&auto=format&fit=crop',
  },
  {
    title: 'E-commerce',
    desc: 'Vendez en ligne 24h/24. Paiement sécurisé, gestion de stock, tableau de bord.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop',
  },
  {
    title: 'Application Mobile',
    desc: 'iOS & Android. Interface native, performances optimales, expérience utilisateur premium.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop',
  },
]

export default function WebMobilePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&auto=format&fit=crop"
            alt="Développement web"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4"
          >
            Service 01
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-display font-bold text-white mb-4 max-w-3xl"
          >
            Développement Web
            <span className="gradient-text-gold"> & Mobile</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl"
          >
            Votre business est réel. Mais pour vos clients potentiels, vous n'existez pas.
          </motion.p>
        </div>
      </section>

      {/* Pain section */}
      <section className="py-20 bg-[#0D1526]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#8A9BB5] text-lg leading-relaxed max-w-3xl mx-auto">
            En 2025, <span className="text-[#E8A020] font-semibold">82% des consommateurs africains</span> vérifient en ligne avant d'acheter.
            Si vous n'avez pas de site professionnel, vous perdez ces clients à chaque instant.
            Vos concurrents, eux, <span className="text-white font-medium">convertissent pendant que vous dormez.</span>
          </p>
        </div>
      </section>

      {/* Site types */}
      <section className="py-20 dark:bg-dark-bg bg-light-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display font-bold dark:text-dark-text text-light-text text-center mb-12">
            Quel type de{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>site vous faut-il ?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {siteTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden border dark:border-dark-border border-light-border dark:bg-dark-card bg-white hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="relative h-48">
                  <Image src={type.image} alt={type.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white font-display font-bold text-xl">{type.title}</h3>
                </div>
                <div className="p-5">
                  <p className="dark:text-dark-muted text-light-muted text-sm">{type.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSection />

      {/* Deliverables */}
      <section className="py-20 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text text-center mb-10">
            Ce que vous obtenez
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {deliverables.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl dark:bg-dark-card bg-white border dark:border-dark-border border-light-border"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isDark ? 'rgba(232,160,32,0.15)' : 'rgba(232,93,4,0.1)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: isDark ? '#E8A020' : '#E85D04' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm dark:text-dark-text text-light-text">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
          Prêt à avoir votre site ?
        </h2>
        <p className="dark:text-dark-muted text-light-muted mb-8">Maquette gratuite soumise avant tout paiement.</p>
        <Link
          href="/devis"
          className={`btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow' : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'}`}
        >
          Demander un devis pour mon site →
        </Link>
      </section>
    </div>
  )
}
