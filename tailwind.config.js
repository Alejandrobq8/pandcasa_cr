module.exports = {
  content: ['./*.html', './admin/*.html', './pages/*.html', './partials/*.html', './js/*.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#F0A50A',
          gold2: '#E9A318',
          cream: '#FCFDFC',
          beige: '#ECD8B4',
          cocoa: '#502B1C',
          cocoa2: '#4F2E1E',
          caramel: '#7E5B37'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 10px 30px -20px rgba(80,43,28,0.35)',
        lift: '0 14px 40px -28px rgba(80,43,28,0.45)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.8s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
