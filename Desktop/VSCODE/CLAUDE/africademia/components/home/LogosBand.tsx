'use client'

import { useTheme } from '@/components/layout/ThemeProvider'

const logos = [
  { name: 'Meta', color: '#0866FF' },
  { name: 'Google', color: '#4285F4' },
  { name: 'Hostinger', color: '#6B48FF' },
  { name: 'TikTok', color: '#000000' },
  { name: 'Vercel', color: '#000000' },
  { name: 'Supabase', color: '#3ECF8E' },
  { name: 'Brevo', color: '#0077B6' },
  { name: 'Figma', color: '#F24E1E' },
  { name: 'OpenAI', color: '#000000' },
  { name: 'Shopify', color: '#96BF48' },
]

function LogoItem({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-8 py-3 flex-shrink-0">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-display font-semibold text-sm dark:text-dark-muted text-light-muted whitespace-nowrap tracking-wide">
        {name}
      </span>
    </div>
  )
}

export default function LogosBand() {
  const { theme } = useTheme()

  return (
    <section className="py-12 dark:bg-dark-bg2 bg-light-bg2 border-y dark:border-dark-border border-light-border overflow-hidden">
      <p className="text-center text-xs dark:text-dark-muted text-light-muted uppercase tracking-widest mb-6 font-medium">
        Partenaires & outils de confiance
      </p>

      {/* Row 1 — left to right */}
      <div className="relative overflow-hidden mb-3">
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <LogoItem key={i} {...logo} />
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee-reverse">
          {[...logos.slice(5), ...logos, ...logos.slice(0, 5)].map((logo, i) => (
            <LogoItem key={i} {...logo} />
          ))}
        </div>
      </div>
    </section>
  )
}
