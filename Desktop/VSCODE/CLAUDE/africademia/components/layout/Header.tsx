'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'

const serviceLinks = [
  { href: '/services/web-mobile', label: 'Développement Web & Mobile', desc: 'Sites, e-commerce, apps' },
  { href: '/services/hebergement', label: 'Hébergement & Maintenance', desc: 'Hosting premium, sécurité' },
  { href: '/services/marketing', label: 'Marketing Digital & Créatif', desc: 'Logos, visuels, branding' },
  { href: '/services/publicite', label: 'Campagnes Publicitaires', desc: 'Meta Ads & TikTok Ads' },
  { href: '/services/formation-web', label: 'Formation Création Sites', desc: 'Créez et revendez des sites' },
]

const formationLinks = [
  { href: '/formations/print-on-demand', label: 'Print On Demand' },
  { href: '/formations/immobilier', label: 'Business Immobilier' },
  { href: '/formations/produits-digitaux', label: 'Produits Digitaux' },
  { href: '/formations/musique-ia', label: 'Musique & IA' },
  { href: '/formations/creation-sites-premium', label: 'Création Sites Premium' },
]

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'dark:bg-dark-bg/90 bg-light-bg/90 backdrop-blur-xl border-b dark:border-dark-border border-light-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dark-gold to-dark-cyan dark:from-dark-gold dark:to-dark-cyan from-light-orange to-light-green flex items-center justify-center font-bold text-white text-lg font-display tracking-tight">
                A
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-dark-gold to-dark-cyan dark:from-dark-gold dark:to-dark-cyan from-light-orange to-light-green opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-300" />
            </div>
            <span className="font-display font-bold text-xl dark:text-dark-text text-light-text tracking-tight">
              Africademia
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('services')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text hover:bg-white/5 transition-all duration-200 font-medium text-sm">
                Services
                <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'services' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {activeDropdown === 'services' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-light-border shadow-xl dark:shadow-dark-card overflow-hidden"
                  >
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex flex-col px-5 py-3.5 dark:hover:bg-dark-bg2 hover:bg-light-bg2 transition-colors group/item"
                      >
                        <span className="font-medium text-sm dark:text-dark-text text-light-text group-hover/item:dark:text-dark-gold group-hover/item:text-light-orange transition-colors">{link.label}</span>
                        <span className="text-xs dark:text-dark-muted text-light-muted mt-0.5">{link.desc}</span>
                      </Link>
                    ))}
                    <div className="border-t dark:border-dark-border border-light-border">
                      <Link href="/services" className="block px-5 py-3 text-sm font-semibold dark:text-dark-gold text-light-orange dark:hover:bg-dark-bg2 hover:bg-light-bg2 transition-colors">
                        Voir tous les services →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Formations dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('formations')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text hover:bg-white/5 transition-all duration-200 font-medium text-sm">
                Formations
                <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'formations' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {activeDropdown === 'formations' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-light-border shadow-xl overflow-hidden"
                  >
                    {formationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-5 py-3 font-medium text-sm dark:text-dark-text text-light-text dark:hover:bg-dark-bg2 hover:bg-light-bg2 dark:hover:text-dark-gold hover:text-light-orange transition-all"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t dark:border-dark-border border-light-border">
                      <Link href="/formations" className="block px-5 py-3 text-sm font-semibold dark:text-dark-gold text-light-orange dark:hover:bg-dark-bg2 hover:bg-light-bg2 transition-colors">
                        Voir toutes les formations →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { href: '/incubateur', label: 'Incubateur' },
              { href: '/portfolio', label: 'Portfolio' },
              { href: '/a-propos', label: 'À propos' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text hover:bg-white/5 transition-all duration-200 font-medium text-sm animated-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full dark:bg-dark-card bg-light-bg2 dark:border-dark-border border-light-border border flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-dark-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-light-blue" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                )}
              </motion.div>
            </button>

            <Link
              href="/devis"
              className="btn-ripple px-5 py-2.5 rounded-pill bg-gradient-to-r from-dark-gold to-yellow-500 dark:from-dark-gold dark:to-yellow-500 from-light-orange to-orange-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-gold-glow hover:scale-105"
            >
              Devis gratuit
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 dark:bg-dark-text bg-light-text transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 dark:bg-dark-text bg-light-text transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 dark:bg-dark-text bg-light-text transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden dark:bg-dark-bg bg-light-bg border-t dark:border-dark-border border-light-border"
          >
            <div className="px-6 py-6 space-y-1">
              <Link href="/services" className="block px-4 py-3 font-semibold dark:text-dark-gold text-light-orange" onClick={() => setMobileOpen(false)}>Services</Link>
              {serviceLinks.map(l => (
                <Link key={l.href} href={l.href} className="block px-6 py-2 text-sm dark:text-dark-muted text-light-muted" onClick={() => setMobileOpen(false)}>{l.label}</Link>
              ))}
              <Link href="/formations" className="block px-4 py-3 font-semibold dark:text-dark-gold text-light-orange" onClick={() => setMobileOpen(false)}>Formations</Link>
              {formationLinks.map(l => (
                <Link key={l.href} href={l.href} className="block px-6 py-2 text-sm dark:text-dark-muted text-light-muted" onClick={() => setMobileOpen(false)}>{l.label}</Link>
              ))}
              <Link href="/incubateur" className="block px-4 py-3 dark:text-dark-text text-light-text" onClick={() => setMobileOpen(false)}>Incubateur</Link>
              <Link href="/portfolio" className="block px-4 py-3 dark:text-dark-text text-light-text" onClick={() => setMobileOpen(false)}>Portfolio</Link>
              <Link href="/a-propos" className="block px-4 py-3 dark:text-dark-text text-light-text" onClick={() => setMobileOpen(false)}>À propos</Link>
              <div className="pt-4 flex gap-3">
                <button onClick={toggleTheme} className="flex-1 py-3 rounded-lg dark:bg-dark-card bg-light-bg2 dark:text-dark-text text-light-text font-medium text-sm border dark:border-dark-border border-light-border">
                  {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
                </button>
                <Link href="/devis" className="flex-1 py-3 rounded-pill bg-gradient-to-r from-light-orange to-orange-500 dark:from-dark-gold dark:to-yellow-500 text-white font-semibold text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Devis gratuit
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
