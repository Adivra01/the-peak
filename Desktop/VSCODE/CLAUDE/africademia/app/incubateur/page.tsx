'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'

const domains = [
  {
    title: 'Musique & Arts',
    desc: 'Production musicale avec IA, distribution, monétisation. Devenez artiste indépendant.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop',
    color: '#E8A020',
  },
  {
    title: 'Startups & Digital',
    desc: 'Développez votre startup tech ou e-commerce avec un accompagnement expert.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&auto=format&fit=crop',
    color: '#00D4FF',
  },
  {
    title: 'Immobilier',
    desc: 'Investissement immobilier en Afrique et en diaspora. Stratégies concrètes.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop',
    color: '#2D9E6B',
  },
  {
    title: 'Business Innovants',
    desc: "E-commerce, print on demand, dropshipping, produits digitaux — lancez votre activité.",
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop',
    color: '#E85D04',
  },
]

export default function IncubateurPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&auto=format&fit=crop"
            alt="Incubateur Africademia"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20 pt-32">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4"
          >
            Africademia Incubateur
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-7xl font-display font-bold text-white mb-6 max-w-3xl"
          >
            Votre projet mérite
            <span className="gradient-text-gold"> d'être lancé.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mb-8"
          >
            Africademia vous accompagne de A à Z dans le lancement de votre business — de l'idée à la première vente.
          </motion.p>
        </div>
      </section>

      {/* Domains */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>
              4 domaines d'accompagnement
            </p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold dark:text-dark-text text-light-text">
              Dans quel domaine voulez-vous
              <span className={` ${isDark ? ' gradient-text-gold' : ' gradient-text-orange'}`}> exceller ?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {domains.map((domain, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl overflow-hidden border dark:border-dark-border border-light-border hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="relative h-56">
                  <Image src={domain.image} alt={domain.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="w-1 h-8 rounded-full mb-3" style={{ backgroundColor: domain.color }} />
                    <h3 className="text-2xl font-display font-bold text-white mb-2">{domain.title}</h3>
                    <p className="text-white/70 text-sm">{domain.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text text-center mb-8">
            Conditions d'accès
          </h2>
          <div className="rounded-2xl border dark:border-dark-gold/30 border-light-orange/30 dark:bg-dark-card bg-white p-8 space-y-4">
            {[
              { title: 'Passeport valide', desc: 'Document d\'identité en cours de validité requis.' },
              { title: 'Compte bancaire actif', desc: 'Pour recevoir vos revenus et payer vos outils.' },
              { title: 'Motivation & implication', desc: 'L\'incubateur demande de l\'engagement et du travail réel.' },
              { title: 'Entretien de sélection', desc: 'Nous sélectionnons les candidats les plus motivés via un entretien gratuit.' },
            ].map((cond, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl dark:bg-dark-bg bg-light-bg2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-dark-gold/20' : 'bg-light-orange/10'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: isDark ? '#E8A020' : '#E85D04' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold dark:text-dark-text text-light-text mb-1">{cond.title}</h4>
                  <p className="text-sm dark:text-dark-muted text-light-muted">{cond.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
          Prêt à rejoindre l'incubateur ?
        </h2>
        <p className="dark:text-dark-muted text-light-muted mb-8 max-w-md mx-auto">
          Entretien de sélection gratuit. Places limitées.
        </p>
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow' : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'}`}>
          Candidater maintenant
        </Link>
      </section>
    </div>
  )
}
