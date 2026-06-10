'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

const modules = ['Services', 'Formations', 'Portfolio', 'Témoignages', 'Blog', 'Devis reçus', 'Paramètres']

const recentDevis = [
  { name: 'Aminata K.', country: 'Sénégal', service: 'Site vitrine', status: 'Nouveau', date: '2026-06-10' },
  { name: 'Ibrahim D.', country: 'Mali', service: 'Formation POD', status: 'En cours', date: '2026-06-09' },
  { name: 'Marie-Claire N.', country: 'Côte d\'Ivoire', service: 'Meta Ads', status: 'Traité', date: '2026-06-08' },
  { name: 'Jean-Baptiste K.', country: 'Bénin', service: 'E-commerce', status: 'Nouveau', date: '2026-06-08' },
]

const statusColors: Record<string, string> = {
  'Nouveau': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'En cours': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Traité': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Archivé': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function AdminPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeModule, setActiveModule] = useState('Devis reçus')
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  if (!authenticated) {
    return (
      <div className="min-h-screen dark:bg-dark-bg bg-light-bg flex items-center justify-center pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-gold to-yellow-500 flex items-center justify-center font-bold text-white text-2xl font-display mx-auto mb-4">
              A
            </div>
            <h1 className="text-2xl font-display font-bold dark:text-dark-text text-light-text">Administration</h1>
            <p className="dark:text-dark-muted text-light-muted text-sm mt-1">Accès restreint — Africademia</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); if (password) setAuthenticated(true) }}
            className="space-y-4 rounded-2xl border dark:border-dark-border border-light-border dark:bg-dark-card bg-white p-6"
          >
            <div>
              <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Email</label>
              <input className="form-input" type="email" placeholder="admin@africademia.com" defaultValue="admin@africademia.com" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-dark-muted text-light-muted mb-1.5">Mot de passe</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className={`w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 ${isDark ? 'bg-gradient-to-r from-dark-gold to-yellow-500' : 'bg-gradient-to-r from-light-orange to-orange-500'}`}>
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg pt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold dark:text-dark-text text-light-text">Tableau de bord</h1>
            <p className="dark:text-dark-muted text-light-muted text-sm">Bonjour, Admin Africademia</p>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="px-4 py-2 rounded-lg border dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted text-sm hover:dark:text-dark-text hover:text-light-text transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Visiteurs ce mois', value: 2840, suffix: '' },
            { label: 'Leads reçus', value: 127, suffix: '' },
            { label: 'Devis envoyés', value: 43, suffix: '' },
            { label: 'Taux conversion', value: 45, suffix: '%', decimal: true },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border dark:bg-dark-card bg-white dark:border-dark-border border-light-border"
            >
              <p className="text-xs dark:text-dark-muted text-light-muted mb-2">{stat.label}</p>
              <p className={`text-3xl font-display font-bold ${isDark ? 'gradient-text-gold' : 'gradient-text-orange'}`}>
                {stat.decimal ? '4,5%' : <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border dark:border-dark-border border-light-border dark:bg-dark-card bg-white p-4">
              <p className="text-xs font-mono dark:text-dark-muted text-light-muted uppercase tracking-wider mb-3">Modules</p>
              <nav className="space-y-1">
                {modules.map(module => (
                  <button
                    key={module}
                    onClick={() => setActiveModule(module)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeModule === module
                        ? isDark
                          ? 'bg-dark-gold/15 text-dark-gold'
                          : 'bg-light-orange/10 text-light-orange'
                        : 'dark:text-dark-muted text-light-muted dark:hover:text-dark-text hover:text-light-text hover:bg-white/5'
                    }`}
                  >
                    {module}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border dark:border-dark-border border-light-border dark:bg-dark-card bg-white">
              <div className="p-5 border-b dark:border-dark-border border-light-border flex items-center justify-between">
                <h2 className="font-display font-semibold dark:text-dark-text text-light-text">{activeModule}</h2>
                <button className={`px-4 py-2 rounded-lg text-xs font-semibold text-white ${isDark ? 'bg-dark-gold' : 'bg-light-orange'}`}>
                  + Ajouter
                </button>
              </div>

              {activeModule === 'Devis reçus' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-dark-border border-light-border">
                        {['Client', 'Pays', 'Service', 'Statut', 'Date'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-medium dark:text-dark-muted text-light-muted uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentDevis.map((devis, i) => (
                        <tr key={i} className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-bg hover:bg-light-bg2 transition-colors">
                          <td className="px-5 py-4 dark:text-dark-text text-light-text font-medium text-sm">{devis.name}</td>
                          <td className="px-5 py-4 dark:text-dark-muted text-light-muted text-sm">{devis.country}</td>
                          <td className="px-5 py-4 dark:text-dark-muted text-light-muted text-sm">{devis.service}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-pill text-xs font-medium border ${statusColors[devis.status]}`}>
                              {devis.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 dark:text-dark-muted text-light-muted text-sm">{devis.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeModule !== 'Devis reçus' && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl dark:bg-dark-bg bg-light-bg2 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-display font-semibold dark:text-dark-text text-light-text mb-2">Module {activeModule}</h3>
                  <p className="dark:text-dark-muted text-light-muted text-sm">Ce module est en cours de développement.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
