import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'burbank': ['var(--font-burbank)', 'sans-serif'],
        'brik-custom': ['var(--font-brik-custom)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.8)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
