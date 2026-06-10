'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from '@/components/layout/ThemeProvider'
import { testimonials } from '@/lib/data'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCardA({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-card-inner">
        {/* Client info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-dark-gold/30">
            <Image src={t.avatar} alt={t.name} fill className="object-cover" />
          </div>
          <div>
            <p className="font-display font-semibold dark:text-dark-text text-light-text text-sm">{t.name}</p>
            <p className="text-xs dark:text-dark-muted text-light-muted">{t.city}, {t.country}</p>
          </div>
          <div className="ml-auto">
            <StarRating rating={t.rating} />
          </div>
        </div>

        {/* Quote */}
        <blockquote className="text-sm dark:text-dark-muted text-light-muted leading-relaxed mb-4 italic">
          "{t.text}"
        </blockquote>

        {/* Service tag */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-pill text-xs font-medium dark:bg-dark-bg dark:text-dark-gold bg-light-bg2 text-light-orange border dark:border-dark-gold/30 border-light-orange/30">
            {t.service}
          </span>
        </div>

        {/* Reply */}
        {t.reply && (
          <div className="mt-4 pt-4 border-t dark:border-dark-border border-light-border">
            <p className="text-xs font-semibold dark:text-dark-gold text-light-orange mb-1">Africademia :</p>
            <p className="text-xs dark:text-dark-muted text-light-muted italic">"{t.reply}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TestimonialCardB({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="rounded-2xl border dark:bg-dark-card bg-white dark:border-dark-border border-light-border p-6 h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image src={t.avatar} alt={t.name} fill className="object-cover" />
        </div>
        <div>
          <p className="font-display font-semibold dark:text-dark-text text-light-text text-sm">{t.name}</p>
          <p className="text-xs dark:text-dark-muted text-light-muted">{t.city}</p>
        </div>
      </div>
      <StarRating rating={t.rating} />
      <blockquote className="text-sm dark:text-dark-muted text-light-muted leading-relaxed mt-3 italic">
        "{t.text}"
      </blockquote>
      <span className="mt-3 inline-block px-3 py-1 rounded-pill text-xs font-medium dark:bg-dark-bg dark:text-dark-cyan bg-light-bg2 text-light-blue border dark:border-dark-cyan/20 border-light-blue/20">
        {t.service}
      </span>
    </div>
  )
}

function TestimonialCardC({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="relative rounded-2xl overflow-hidden h-full" style={{
      background: 'linear-gradient(135deg, #0D1526 0%, #111C30 100%)'
    }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
        style={{ background: 'radial-gradient(circle, #E8A020, transparent)' }}
      />
      <div className="p-6 relative z-10 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-yellow-500/40">
            <Image src={t.avatar} alt={t.name} fill className="object-cover" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">{t.name}</p>
          </div>
        </div>

        {t.metric && (
          <div className="mb-3">
            <span className="text-4xl font-display font-bold gradient-text-gold">{t.metric}</span>
          </div>
        )}

        <blockquote className="text-sm text-[#8A9BB5] leading-relaxed italic flex-1">
          "{t.text}"
        </blockquote>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <StarRating rating={t.rating} />
          <span className="text-xs text-[#8A9BB5]">{t.service}</span>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [currentPage, setCurrentPage] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const perPage = 3
  const totalPages = Math.ceil(testimonials.length / perPage)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrentPage(p => (p + 1) % totalPages)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoPlay, totalPages])

  const visible = testimonials.slice(currentPage * perPage, currentPage * perPage + perPage)

  return (
    <section className="py-24 lg:py-32 dark:bg-dark-bg2 bg-light-bg2">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-sm font-mono uppercase tracking-widest mb-3 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}
          >
            Témoignages
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-display font-bold dark:text-dark-text text-light-text"
          >
            Ils ont fait{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>confiance</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-4"
          >
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="text-sm dark:text-dark-muted text-light-muted ml-2">20+ avis 5 étoiles</span>
          </motion.div>
        </div>

        {/* Cards carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
          >
            {visible.map((t, i) => (
              <div key={`${currentPage}-${i}`}>
                {t.type === 'A' ? (
                  <TestimonialCardA t={t} />
                ) : t.type === 'C' ? (
                  <TestimonialCardC t={t} />
                ) : (
                  <TestimonialCardB t={t} />
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentPage(i); setAutoPlay(false) }}
              className={`rounded-full transition-all duration-300 ${
                i === currentPage
                  ? `w-8 h-2.5 ${isDark ? 'bg-dark-gold' : 'bg-light-orange'}`
                  : `w-2.5 h-2.5 dark:bg-dark-border bg-light-border`
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
