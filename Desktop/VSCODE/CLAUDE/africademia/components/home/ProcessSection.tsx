'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { processSteps } from '@/lib/data'

export default function ProcessSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [active, setActive] = useState(0)
  const [lineProgress, setLineProgress] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.4 })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isInView) return

    const cycleDuration = 2500
    let start: number | null = null

    const tick = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start

      if (elapsed < cycleDuration) {
        setLineProgress(elapsed / cycleDuration)
        requestAnimationFrame(tick)
      } else {
        setActive(prev => (prev + 1) % processSteps.length)
        setLineProgress(0)
        start = null
        requestAnimationFrame(tick)
      }
    }

    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, active])

  return (
    <section ref={ref} className="py-24 lg:py-32 dark:bg-dark-bg bg-light-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
          >
            Comment ça marche
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-display font-bold dark:text-dark-text text-light-text"
          >
            Notre processus en{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>4 étapes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg dark:text-dark-muted text-light-muted mt-4 max-w-xl mx-auto"
          >
            De votre idée à votre présence en ligne — simple, transparent, efficace.
          </motion.p>
        </div>

        {/* Steps — Desktop horizontal */}
        <div className="hidden lg:block relative">
          {/* Connection line */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-0.5 dark:bg-dark-border bg-light-border" />

          {/* Animated progress line */}
          <div
            className="absolute top-12 h-0.5 transition-none"
            style={{
              left: `${12.5 + (active * 25)}%`,
              width: `${lineProgress * 25}%`,
              background: isDark
                ? 'linear-gradient(90deg, #E8A020, #00D4FF)'
                : 'linear-gradient(90deg, #E85D04, #2D9E6B)',
            }}
          />

          <div className="grid grid-cols-4 gap-4">
            {processSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                {/* Node */}
                <div className="relative mb-8">
                  <div
                    className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border-2 ${
                      i === active
                        ? isDark
                          ? 'bg-dark-gold/20 border-dark-gold scale-110'
                          : 'bg-light-orange/15 border-light-orange scale-110'
                        : i < active
                        ? isDark
                          ? 'bg-dark-card border-dark-gold/40'
                          : 'bg-white border-light-orange/40'
                        : 'dark:bg-dark-card bg-light-card dark:border-dark-border border-light-border'
                    }`}
                  >
                    <span className={`font-mono text-xs mb-1 ${i === active ? isDark ? 'text-dark-gold' : 'text-light-orange' : 'dark:text-dark-muted text-light-muted'}`}>
                      {step.number}
                    </span>
                    <span className={`font-display font-bold text-xs ${i === active ? 'dark:text-dark-text text-light-text' : 'dark:text-dark-muted text-light-muted'}`}>
                      {step.title}
                    </span>
                  </div>

                  {/* Pulse on active */}
                  {i === active && (
                    <div
                      className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${isDark ? 'bg-dark-gold' : 'bg-light-orange'}`}
                    />
                  )}
                </div>

                {/* Description */}
                <div className={`transition-all duration-500 ${i === active ? 'opacity-100' : 'opacity-40'}`}>
                  <p className="text-sm dark:text-dark-muted text-light-muted leading-relaxed">
                    {step.description}
                  </p>
                  {i === active && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs dark:text-dark-muted/70 text-light-muted/70 mt-2 leading-relaxed"
                    >
                      {step.detail}
                    </motion.p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile — vertical */}
        <div className="lg:hidden space-y-6">
          {processSteps.map((step, i) => (
            <motion.div
              key={i}
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -30 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-4 p-5 rounded-xl border transition-all duration-300 ${
                i === active
                  ? isDark
                    ? 'bg-dark-card border-dark-gold/30'
                    : 'bg-white border-light-orange/30 shadow-light-card-hover'
                  : 'dark:bg-dark-card bg-light-card dark:border-dark-border border-light-border'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-mono font-bold text-sm ${
                i === active
                  ? isDark ? 'bg-dark-gold text-dark-bg' : 'bg-light-orange text-white'
                  : 'dark:bg-dark-bg bg-light-bg2 dark:text-dark-muted text-light-muted'
              }`}>
                {step.number}
              </div>
              <div>
                <h3 className="font-display font-semibold dark:text-dark-text text-light-text mb-1">{step.title}</h3>
                <p className="text-sm dark:text-dark-muted text-light-muted">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="dark:text-dark-muted text-light-muted text-sm mb-4">
            Consultation offerte — sans engagement — réponse sous 24h
          </p>
          <a
            href="/devis"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-pill font-semibold text-sm text-white transition-all hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow'
                : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'
            }`}
          >
            Démarrer mon projet
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
