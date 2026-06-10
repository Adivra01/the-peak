'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/layout/ThemeProvider'
import { blogPosts } from '@/lib/data'

const categories = ['Tous', 'Digital', 'Marketing', 'IA', 'Formations', 'Entrepreneuriat']

export default function BlogPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filtered = activeCategory === 'Tous' ? blogPosts : blogPosts.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Hero */}
      <section className="pt-32 pb-16 dark:bg-dark-bg2 bg-light-bg2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className={`text-sm font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-dark-gold' : 'text-light-orange'}`}>
            Ressources & Conseils
          </p>
          <h1 className="text-5xl lg:text-7xl font-display font-bold dark:text-dark-text text-light-text mb-4">
            Le{' '}
            <span className={isDark ? 'gradient-text-gold' : 'gradient-text-orange'}>blog</span>
          </h1>
          <p className="text-xl dark:text-dark-muted text-light-muted max-w-2xl mx-auto">
            Conseils digitaux, stratégies marketing et insights pour entrepreneurs africains.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-pill text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? isDark ? 'bg-dark-gold text-dark-bg' : 'bg-light-orange text-white'
                    : 'dark:bg-dark-card bg-white dark:border-dark-border border-light-border border dark:text-dark-muted text-light-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-10 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="h-full rounded-2xl overflow-hidden border dark:border-dark-border border-light-border dark:bg-dark-card bg-white hover:-translate-y-2 transition-all duration-300 dark:hover:shadow-dark-card-hover hover:shadow-light-card-hover">
                    <div className="relative h-52">
                      <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-pill text-xs font-semibold text-white ${isDark ? 'bg-dark-gold/80' : 'bg-light-orange/80'}`}>
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3 text-xs dark:text-dark-muted text-light-muted">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime} de lecture</span>
                      </div>
                      <h2 className="font-display font-bold text-lg dark:text-dark-text text-light-text mb-3 leading-snug group-hover:dark:text-dark-gold group-hover:text-light-orange transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm dark:text-dark-muted text-light-muted leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-semibold dark:text-dark-gold text-light-orange">
                        Lire l'article
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
