'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import dynamic from 'next/dynamic'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

const Globe = dynamic(() => import('@/components/three/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-64 h-64 rounded-full dark:bg-dark-bg2 bg-light-bg2 animate-pulse opacity-50" />
    </div>
  ),
})

const words = ['Votre', 'Business', 'Mérite', "d'Exister", 'en', 'Ligne.']

const stats = [
  { value: 150, suffix: '+', label: 'Projets réalisés' },
  { value: 98, suffix: '%', label: 'Satisfaction client' },
  { value: 5, suffix: '+', label: 'Services digitaux' },
  { value: 100, suffix: '%', label: 'Accompagnement' },
]

export default function HeroSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number; y: number; vx: number; vy: number
      size: number; opacity: number; color: string
    }> = []

    const colors = isDark
      ? ['rgba(232,160,32,', 'rgba(0,212,255,']
      : ['rgba(232,93,4,', 'rgba(45,158,107,']

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    let raf: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + p.opacity + ')'
        ctx.fill()
      })
      raf = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDark])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden dark:bg-gradient-dark bg-gradient-light">
      {/* Particle canvas */}
      <canvas ref={canvasRef} id="particles-canvas" />

      {/* Gradient mesh (light theme) */}
      {!isDark && (
        <div
          className="absolute inset-0 opacity-40 kente-overlay"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(232,93,4,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45,158,107,0.1) 0%, transparent 40%)',
          }}
        />
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-112px)]">
          {/* Left — Text */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 self-start mb-8"
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-pill border text-sm font-medium ${
                isDark
                  ? 'bg-dark-gold/10 border-dark-gold/30 text-dark-gold'
                  : 'bg-light-orange/10 border-light-orange/30 text-light-orange'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                Agence Digitale Premium — Afrique & Monde
              </div>
            </motion.div>

            {/* Main headline */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`text-5xl lg:text-7xl font-display font-bold leading-none tracking-tight ${
                      i === 1 || i === 2
                        ? isDark ? 'gradient-text-gold' : 'gradient-text-orange'
                        : 'dark:text-dark-text text-light-text'
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-lg lg:text-xl dark:text-dark-muted text-light-muted mb-10 max-w-lg leading-relaxed"
            >
              Nous transformons vos idées en présence digitale puissante.{' '}
              <span className="dark:text-dark-text text-light-text font-medium">Web, Marketing, IA</span>{' '}
              — Des résultats concrets, pas des promesses.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-16"
            >
              <Link
                href="/devis"
                className="btn-ripple group inline-flex items-center gap-2 px-8 py-4 rounded-pill font-semibold text-base text-white transition-all duration-300 hover:scale-105 hover:shadow-gold-glow"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #E8A020, #F5C842)'
                    : 'linear-gradient(135deg, #E85D04, #F5820A)',
                }}
              >
                Demander un devis gratuit
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-pill font-semibold text-base transition-all duration-300 hover:scale-105 dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:hover:border-dark-gold bg-white border-light-border text-light-text border hover:border-light-orange hover:shadow-orange-glow"
              >
                Voir nos services
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t dark:border-dark-border border-light-border"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className={`text-3xl font-display font-bold ${isDark ? 'gradient-text-gold' : 'gradient-text-orange'}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-xs dark:text-dark-muted text-light-muted font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full aspect-square max-w-xl">
              {/* Glow behind globe */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle, #E8A020 0%, #00D4FF 50%, transparent 70%)'
                    : 'radial-gradient(circle, #E85D04 0%, #1A5CB5 50%, transparent 70%)',
                }}
              />
              <Globe isDark={isDark} />
            </div>

            {/* City labels */}
            {[
              { name: 'Dakar', x: '20%', y: '50%' },
              { name: 'Abidjan', x: '28%', y: '62%' },
              { name: 'Paris', x: '58%', y: '22%' },
              { name: 'Montréal', x: '12%', y: '28%' },
            ].map((city) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className={`absolute text-xs font-mono font-medium px-2 py-1 rounded-md pointer-events-none ${
                  isDark ? 'bg-dark-card/80 text-dark-gold border-dark-border' : 'bg-white/80 text-light-orange border-light-border'
                } border backdrop-blur-sm`}
                style={{ left: city.x, top: city.y }}
              >
                {city.name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs dark:text-dark-muted text-light-muted font-medium tracking-wider uppercase">Scroll</span>
        <div className="w-px h-12 dark:bg-gradient-to-b from-dark-muted to-transparent bg-gradient-to-b from-light-muted to-transparent animate-bounce" />
      </motion.div>
    </section>
  )
}
