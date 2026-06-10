'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from '@/components/layout/ThemeProvider'

const comparisons = [
  { before: 'Envoyez le prix en MP', after: 'Un site qui vend 24h/24' },
  { before: 'Invisible sur Google', after: 'Visible sur 3 marchés' },
  { before: 'Zéro crédibilité', after: 'Marque professionnelle' },
  { before: '0 leads par mois', after: '50+ leads qualifiés/mois' },
]

export default function BeforeAfterSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(5, Math.min(95, pos)))
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) updateSlider(e.clientX)
  }, [isDragging, updateSlider])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    updateSlider(e.touches[0].clientX)
  }, [updateSlider])

  return (
    <section className="py-24 lg:py-32 dark:bg-dark-bg bg-light-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
          >
            La transformation
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-display font-bold dark:text-dark-text text-light-text"
          >
            Avant & Après{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>Africademia</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image comparison slider */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              ref={containerRef}
              className="relative h-80 rounded-2xl overflow-hidden cursor-ew-resize select-none border dark:border-dark-border border-light-border shadow-xl"
              onMouseMove={handleMouseMove}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={handleTouchMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* BEFORE (full width behind) */}
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop"
                  alt="Avant Africademia"
                  fill
                  className="object-cover grayscale"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider">
                    Avant
                  </span>
                </div>
              </div>

              {/* AFTER (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop"
                  alt="Après Africademia"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                <div className="absolute bottom-6 right-6">
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-white"
                    style={{ background: isDark ? 'rgba(232,160,32,0.3)' : 'rgba(232,93,4,0.3)', border: `1px solid ${isDark ? 'rgba(232,160,32,0.5)' : 'rgba(232,93,4,0.5)'}` }}
                  >
                    Après
                  </span>
                </div>
              </div>

              {/* Slider handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-center text-xs dark:text-dark-muted text-light-muted mt-3">
              Glissez le curseur pour comparer
            </p>
          </motion.div>

          {/* Comparison list */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-4"
          >
            {comparisons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center p-4 rounded-xl dark:bg-dark-card bg-white border dark:border-dark-border border-light-border"
              >
                {/* Before */}
                <div className="text-right">
                  <span className="text-sm dark:text-dark-muted/70 text-light-muted line-through">{item.before}</span>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                  style={{ background: isDark ? 'rgba(232,160,32,0.15)' : 'rgba(232,93,4,0.1)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: isDark ? '#E8A020' : '#E85D04' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* After */}
                <div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isDark ? '#E8A020' : '#E85D04' }}
                  >
                    {item.after}
                  </span>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <a
                href="/devis"
                className={`btn-ripple inline-flex items-center gap-2 w-full justify-center px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow'
                    : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'
                }`}
              >
                Je veux cette transformation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
