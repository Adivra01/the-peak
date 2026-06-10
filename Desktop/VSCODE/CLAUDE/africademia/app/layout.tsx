import type { Metadata } from 'next'
import { Space_Grotesk, Inter, DM_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollProgress from '@/components/shared/ScrollProgress'
import CustomCursor from '@/components/shared/CustomCursor'
import WhatsAppButton from '@/components/shared/WhatsAppButton'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
})


export const metadata: Metadata = {
  title: 'Africademia — Agence Digitale Premium Afrique & Monde',
  description:
    'Africademia transforme vos idées en présence digitale puissante. Web, Marketing Digital, IA, Formations — Des résultats concrets pour entrepreneurs africains et diaspora.',
  keywords: 'agence digitale africaine, création site web Afrique, marketing digital Sénégal, Meta Ads Afrique, formation digital Africa',
  openGraph: {
    title: 'Africademia — Agence Digitale Premium',
    description: 'Nous transformons vos idées en présence digitale puissante.',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${dmMono.variable} font-body antialiased`}>
        <ThemeProvider>
          <ScrollProgress />
          <CustomCursor />
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
