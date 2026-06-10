'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import { motion } from 'framer-motion'

export default function Footer() {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <footer className="dark:bg-dark-bg2 bg-light-bg2 border-t dark:border-dark-border border-light-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dark-gold to-dark-cyan dark:from-dark-gold dark:to-dark-cyan from-light-orange to-light-green flex items-center justify-center font-bold text-white text-lg font-display">
                A
              </div>
              <span className="font-display font-bold text-xl dark:text-dark-text text-light-text">Africademia</span>
            </Link>
            <p className="dark:text-dark-muted text-light-muted text-sm leading-relaxed mb-6 max-w-xs">
              Agence digitale panafricaine. Nous transformons vos idées en présence digitale puissante — Web, Marketing, IA.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                {
                  label: 'WhatsApp', href: 'https://wa.me/message/africademia',
                  icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                },
                {
                  label: 'Instagram', href: 'https://instagram.com/africademia',
                  icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                },
                {
                  label: 'TikTok', href: 'https://tiktok.com/@africademia',
                  icon: <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg dark:bg-dark-card bg-light-card dark:border-dark-border border-light-border border flex items-center justify-center dark:text-dark-muted text-light-muted dark:hover:text-dark-gold hover:text-light-orange dark:hover:border-dark-gold hover:border-light-orange transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">{social.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold dark:text-dark-text text-light-text mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/services/web-mobile', label: 'Développement Web' },
                { href: '/services/hebergement', label: 'Hébergement' },
                { href: '/services/marketing', label: 'Marketing Digital' },
                { href: '/services/publicite', label: 'Publicité Ads' },
                { href: '/services/formation-web', label: 'Formation Sites' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm dark:text-dark-muted text-light-muted dark:hover:text-dark-gold hover:text-light-orange transition-colors animated-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Formations */}
          <div>
            <h4 className="font-display font-semibold dark:text-dark-text text-light-text mb-4 text-sm uppercase tracking-wider">Formations</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/formations/print-on-demand', label: 'Print On Demand' },
                { href: '/formations/immobilier', label: 'Business Immobilier' },
                { href: '/formations/produits-digitaux', label: 'Produits Digitaux' },
                { href: '/formations/musique-ia', label: 'Musique & IA' },
                { href: '/incubateur', label: 'Incubateur' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm dark:text-dark-muted text-light-muted dark:hover:text-dark-gold hover:text-light-orange transition-colors animated-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <h4 className="font-display font-semibold dark:text-dark-text text-light-text mb-4 text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm dark:text-dark-muted text-light-muted mb-4 leading-relaxed">
              Recevez nos conseils digitaux chaque semaine.
            </p>
            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm dark:text-dark-gold text-light-green font-semibold"
              >
                Merci ! Vous êtes inscrit(e). 🎉
              </motion.p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="form-input text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r dark:from-dark-gold dark:to-yellow-500 from-light-orange to-orange-500 text-white font-semibold text-sm transition-all hover:opacity-90"
                >
                  S'abonner
                </button>
              </form>
            )}

            <div className="mt-6 space-y-2">
              <a href="mailto:contact@africademia.com" className="block text-sm dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text transition-colors">
                contact@africademia.com
              </a>
              <a href="https://wa.me/message/africademia" className="block text-sm dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text transition-colors">
                WhatsApp Business
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t dark:border-dark-border border-light-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs dark:text-dark-muted text-light-muted">
            © 2026 Africademia. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="text-xs dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="text-xs dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text transition-colors">Confidentialité</Link>
            <button
              onClick={toggleTheme}
              className="text-xs dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text transition-colors flex items-center gap-1.5"
            >
              {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
