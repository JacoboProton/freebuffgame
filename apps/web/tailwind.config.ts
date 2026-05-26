import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#86EFAC',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#93C5FD',
        },
        accent: {
          yellow: '#FACC15',
          coral: '#F97316',
        },
        surface: '#FFFFFF',
        background: '#FAFAFA',
        'background-alt': '#F3F4F6',
        muted: '#6B7280',
        error: '#EF4444',
        success: '#22C55E',
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.06)',
        glow: '0 0 20px rgba(34, 197, 94, 0.3)',
      },
      animation: {
        'bounce-sm': 'bounce 1s ease infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'confetti': 'confetti 1.5s ease-out forwards',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;