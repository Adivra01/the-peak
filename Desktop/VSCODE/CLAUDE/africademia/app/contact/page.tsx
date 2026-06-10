'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import Link from 'next/link'

export default function ContactPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <section className="relative pt-32 pb-20 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>Parlons de votre projet</p>
          <h1 className="text-5xl lg:text-7xl font-display font-bold dark:text-dark-text text-light-text mb-6">
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>Contactez</span>-nous
          </h1>
          <p className="text-xl dark:text-dark-muted text-light-muted max-w-2xl mx-auto">
            Notre équipe répond sous 2h en semaine. Week-end : sous 24h.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
                <Image src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop" alt="Contact Africademia" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="space-y-5">
                {[
                  { label: 'WhatsApp', value: '+221 78 000 00 00', href: 'https://wa.me/221780000000' },
                  { label: 'Email', value: 'contact@africademia.com', href: 'mailto:contact@africademia.com' },
                  { label: 'Instagram', value: '@africademia', href: 'https://instagram.com/africademia' },
                ].map((contact, i) => (
                  <a
                    key={i}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl dark:bg-dark-card bg-white border dark:border-dark-border border-light-border hover:-translate-y-0.5 transition-transform"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-dark-gold/15' : 'bg-light-orange/10'}`}>
                      <span className={`font-mono text-xs font-bold ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>{contact.label[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs dark:text-dark-muted text-light-muted">{contact.label}</p>
                      <p className="font-medium dark:text-dark-text text-light-text">{contact.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              {sent ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold dark:text-dark-text text-light-text mb-2">Message envoyé !</h3>
                    <p className="dark:text-dark-muted text-light-muted">Nous vous répondons sous 2h.</p>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={e => { e.preventDefault(); setSent(true) }}>
                  <h2 className="text-2xl font-display font-bold dark:text-dark-text text-light-text mb-6">Envoyez-nous un message</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Prénom</label>
                      <input className="form-input" placeholder="Votre prénom" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Nom</label>
                      <input className="form-input" placeholder="Votre nom" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Email</label>
                    <input className="form-input" type="email" placeholder="vous@exemple.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Sujet</label>
                    <input className="form-input" placeholder="En quoi pouvons-nous vous aider ?" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Message</label>
                    <textarea className="form-input resize-none" rows={5} placeholder="Décrivez votre projet ou votre question..." required />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500 hover:shadow-gold-glow' : 'bg-gradient-to-r from-light-orange to-orange-500 hover:shadow-orange-glow'}`}
                  >
                    Envoyer le message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
