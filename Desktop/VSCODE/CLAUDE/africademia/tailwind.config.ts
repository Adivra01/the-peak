import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme - Cosmos Africain
        dark: {
          bg: '#080C14',
          bg2: '#0D1526',
          card: '#111C30',
          border: '#1E2D45',
          text: '#F0EDE6',
          muted: '#8A9BB5',
          gold: '#E8A020',
          cyan: '#00D4FF',
        },
        // Light theme - Savane Numérique
        light: {
          bg: '#FAFAF7',
          bg2: '#F5F0E8',
          card: '#FFFFFF',
          border: '#E5DDD0',
          text: '#1A1A1A',
          muted: '#6B7280',
          orange: '#E85D04',
          green: '#2D9E6B',
          blue: '#1A5CB5',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        clash: ['Clash Display', 'Space Grotesk', 'sans-serif'],
        nunito: ['Nunito Sans', 'Inter', 'sans-serif'],
      },
      spacing: {
        '4xs': '4px',
        '3xs': '8px',
        '2xs': '16px',
        xs: '24px',
        sm: '40px',
        md: '64px',
        lg: '96px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '32px',
        pill: '9999px',
      },
      boxShadow: {
        'dark-card': '0 4px 24px rgba(0, 212, 255, 0.06)',
        'dark-card-hover': '0 8px 40px rgba(232, 160, 32, 0.15)',
        'light-card': '0 2px 16px rgba(26, 26, 26, 0.06)',
        'light-card-hover': '0 8px 32px rgba(232, 93, 4, 0.12)',
        'gold-glow': '0 0 40px rgba(232, 160, 32, 0.3)',
        'cyan-glow': '0 0 40px rgba(0, 212, 255, 0.2)',
        'orange-glow': '0 0 40px rgba(232, 93, 4, 0.25)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #080C14 0%, #0D1526 50%, #0A1A2E 100%)',
        'gradient-light': 'linear-gradient(135deg, #FFF8F0 0%, #FAFAF7 60%, #F0F7FF 100%)',
        'gradient-gold': 'linear-gradient(135deg, #E8A020 0%, #F5C842 100%)',
        'gradient-orange': 'linear-gradient(135deg, #E85D04 0%, #F5820A 100%)',
        'gradient-cta-dark': 'linear-gradient(135deg, #0D1526 0%, #111C30 100%)',
      },
    },
  },
  plugins: [],
}

export default config
