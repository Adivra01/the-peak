'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const problems = [
  {
    title: 'Pas de site professionnel',
    text: 'Vos concurrents ont une vitrine digitale. Vous perdez des clients avant même qu\'ils vous appellent.',
    image: 'https://images.unsplash.com/photo-1616469832301-3e7889f1e3ac?w=400&auto=format&fit=crop',
    stat: '82%',
    statLabel: 'des clients vérifient en ligne avant d\'acheter',
  },
  {
    title: 'Pas de stratégie marketing',
    text: 'Vous postez, mais personne ne vous voit. L\'algorithme travaille contre vous — pas pour vous.',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop',
    stat: '3x',
    statLabel: 'plus de visibilité avec une vraie stratégie',
  },
  {
    title: 'Pas de temps ni d\'expertise',
    text: 'Le digital évolue trop vite. Vous ne savez pas par où commencer.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop',
    stat: '5+',
    statLabel: 'services pour couvrir tous vos besoins',
  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-24 lg:py-32 bg-[#080C14] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&auto=format&fit=crop"
          alt="African city at night"
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C14] via-transparent to-[#080C14]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-sm font-mono text-[#E8A020] uppercase tracking-widest mb-4"
          >
            La réalité des entrepreneurs africains
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-display font-bold text-white leading-tight"
          >
            Vous avez le talent.
            <br />
            <span className="gradient-text-gold">Mais en ligne, vous êtes invisible.</span>
          </motion.h2>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#E8A020]/30 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={problem.image}
                  alt={problem.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/50 to-transparent" />

                {/* Stat badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-3xl font-display font-bold text-[#E8A020] font-mono">{problem.stat}</span>
                  <p className="text-xs text-[#8A9BB5] mt-0.5 max-w-[140px] leading-tight">{problem.statLabel}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg">{problem.title}</h3>
                </div>
                <p className="text-[#8A9BB5] text-sm leading-relaxed">{problem.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transition line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-[#E8A020]/40" />
            <svg className="w-6 h-6 text-[#E8A020]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-[#E8A020]/40" />
          </div>
          <p className="text-xl lg:text-2xl font-display font-semibold text-white">
            C'est exactement pour ça qu'
            <span className="gradient-text-gold">Africademia existe.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
