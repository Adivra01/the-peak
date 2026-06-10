'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import Link from 'next/link'

const values = [
  {
    title: 'Excellence',
    desc: 'Chaque projet est livré avec le plus haut niveau de qualité. Aucun compromis sur les standards.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop',
  },
  {
    title: 'Transparence',
    desc: 'Maquette gratuite avant paiement. Processus clair. Prix communiqués en consultation.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&auto=format&fit=crop',
  },
  {
    title: 'Impact',
    desc: "Nous ne créons pas des sites beaux — nous créons des outils qui génèrent des résultats concrets.",
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop',
  },
  {
    title: 'Communauté',
    desc: 'Africademia est né pour l\'entrepreneur africain. Nous comprenons votre marché, votre réalité.',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop',
  },
]

const team = [
  {
    name: 'Fondatrice',
    role: 'CEO & Digital Strategist',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop',
    bio: 'Fondatrice d\'Africademia avec une vision : donner aux entrepreneurs africains les outils digitaux qu\'ils méritent.',
  },
  {
    name: 'Lead Developer',
    role: 'Développeur Full Stack',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    bio: "Expert Next.js, React Native et architectures cloud. Spécialiste des performances Web pour l'Afrique.",
  },
  {
    name: 'Creative Director',
    role: 'Design & Branding',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop',
    bio: 'Designer UI/UX passionné par l\'identité africaine moderne. Créateur de marques mémorables.',
  },
  {
    name: 'Growth Manager',
    role: 'Marketing & Ads',
    image: 'https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400&auto=format&fit=crop',
    bio: 'Certifié Meta Blueprint. Gestionnaire de campagnes ayant généré 10M+ FCFA de leads pour nos clients.',
  },
]

const partners = [
  { name: 'Meta', logo: '🔵' },
  { name: 'Google', logo: '🟡' },
  { name: 'Hostinger', logo: '🟣' },
  { name: 'Vercel', logo: '⚫' },
  { name: 'Supabase', logo: '🟢' },
  { name: 'Brevo', logo: '🔵' },
]

export default function AboutPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1920&auto=format&fit=crop"
            alt="Équipe Africademia"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4"
          >
            Notre histoire
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-7xl font-display font-bold text-white mb-6 max-w-3xl"
          >
            L'agence digitale
            <span className="gradient-text-gold"> pour l'Afrique.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl"
          >
            Africademia est née d'un constat simple : les entrepreneurs africains méritent des solutions digitales à la hauteur de leur ambition.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: 150, suffix: '+', label: 'Projets réalisés' },
              { value: 5, suffix: '+', label: 'Services proposés' },
              { value: 5, suffix: '', label: 'Formations disponibles' },
              { value: 100, suffix: '%', label: 'Satisfaction client' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`text-5xl font-display font-bold mb-2 ${isDark ? 'gradient-text-gold' : 'gradient-text-orange'}`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="dark:text-dark-muted text-light-muted text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>
                Notre mission
              </p>
              <h2 className="text-3xl lg:text-4xl font-display font-bold dark:text-dark-text text-light-text mb-6">
                Donner à chaque entrepreneur africain une{' '}
                <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>présence digitale</span>{' '}
                à la hauteur de son ambition.
              </h2>
              <p className="dark:text-dark-muted text-light-muted leading-relaxed mb-4">
                En Afrique de l'Ouest et Centrale, des millions d'entrepreneurs ont du talent, des produits de qualité et une vision claire. Mais leur absence en ligne les rend invisibles face à une concurrence qui se digitalise chaque jour.
              </p>
              <p className="dark:text-dark-muted text-light-muted leading-relaxed">
                Africademia comble ce fossé avec des solutions premium, accessibles, adaptées aux réalités du marché africain — pour les entrepreneurs locaux comme pour la diaspora.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative h-80 rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop"
                alt="Mission Africademia"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>
              Ce qui nous guide
            </p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold dark:text-dark-text text-light-text">
              Nos valeurs fondamentales
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden border dark:border-dark-border border-light-border hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="relative h-40">
                  <Image src={value.image} alt={value.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white font-display font-bold text-lg">{value.title}</h3>
                </div>
                <div className="p-5 dark:bg-dark-card bg-white">
                  <p className="dark:text-dark-muted text-light-muted text-sm leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>
              L'équipe
            </p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold dark:text-dark-text text-light-text">
              Des experts à votre service
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center rounded-2xl p-6 dark:bg-dark-card bg-white border dark:border-dark-border border-light-border hover:-translate-y-2 transition-transform duration-300"
              >
                <div className={`relative w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 ring-4 ring-offset-2 ${isDark ? 'ring-dark-gold ring-offset-dark-card' : 'ring-light-orange ring-offset-white'}`}
                >
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-display font-bold dark:text-dark-text text-light-text mb-0.5">{member.name}</h3>
                <p className={`text-xs font-medium mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>{member.role}</p>
                <p className="text-xs dark:text-dark-muted text-light-muted leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm dark:text-dark-muted text-light-muted uppercase tracking-wider mb-8">
            Nos partenaires & outils
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {partners.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-xl dark:bg-dark-card bg-white border dark:border-dark-border border-light-border">
                <span className="text-xl">{p.logo}</span>
                <span className="font-display font-semibold dark:text-dark-muted text-light-muted text-sm">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-display font-bold dark:text-dark-text text-light-text mb-4">
          Prêt à travailler avec nous ?
        </h2>
        <p className="dark:text-dark-muted text-light-muted mb-8 max-w-md mx-auto">
          Rejoignez 150+ entrepreneurs qui font confiance à Africademia pour leur présence digitale.
        </p>
        <Link href="/devis" className={`btn-ripple inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow' : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'}`}>
          Démarrer mon projet
        </Link>
      </section>
    </div>
  )
}
