/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          400: '#FFB347',
          500: '#FF9933',
          600: '#E8891E',
        },
        india: {
          green: '#138808',
          navy: '#000080',
        },
        surface: {
          DEFAULT: '#0D1117',
          1: '#161B22',
          2: '#1C2230',
          3: '#212A3E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0D1117 0%, #1a0533 40%, #0d2137 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,153,51,0.08) 0%, rgba(19,136,8,0.04) 100%)',
        'saffron-glow': 'radial-gradient(ellipse at center, rgba(255,153,51,0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing': 'typing 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 10px rgba(255,153,51,0.3)' }, '50%': { boxShadow: '0 0 25px rgba(255,153,51,0.6)' } },
        typing: { '0%,100%': { opacity: '0.2' }, '50%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
