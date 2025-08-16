// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ─── NEW: Sidebar Glow Shadow ─────────────────────────────────────────────
      boxShadow: {
        'inner-lg': 'inset 0 0 12px rgba(106,114,87,0.6)',
      },

      // ─── Existing Animations ─────────────────────────────────────────────────
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        'glow-blue': 'glowBlue 2s ease-in-out infinite',
        'diesel-shimmer': 'dieselGlow 1.5s ease-in-out infinite',
        'spin-3d-once': 'spin3dOnce 1.2s ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': {
            transform: 'scale(1)',
            filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0.2))',
          },
          '50%': {
            transform: 'scale(1.05)',
            filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.35))',
          },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0px #a9b388' },
          '50%': { boxShadow: '0 0 20px #a9b388' },
        },
        glowBlue: {
          '0%, 100%': { boxShadow: '0 0 0px #00BFFF' },
          '50%': { boxShadow: '0 0 20px #00BFFF' },
        },
        dieselGlow: {
          '0%, 100%': {
            textShadow: '0 0 0px #00BFFF',
          },
          '50%': {
            textShadow: '0 0 8px #00BFFF, 0 0 16px #00BFFF',
          },
        },
        spin3dOnce: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },

      // ─── Color Palette Additions ─────────────────────────────────────────────
      colors: {
        'fly-blue': '#00BFFF',
        'brand-green-light': '#E8F5E9',
        'brand-green-base': '#2E7D32',
        'brand-green-dark': '#1B5E20',
        'dark-bg': '#1A1A1A',
        'panel-bg': '#1F1F1F',
        'header-bg': '#2C2C2C',
        'totals-bg': '#272727',
        'accent-blue': '#00B0FF',
        palomaBlue: '#00BFFF', // ← NEW: your custom blue

        // ─── Willow Grove Palette ──────────────────────────────────────────────
        willow: {
          50:  '#F3F4F1',
          100: '#E6E8DF',
          200: '#CFD3C3',
          300: '#B0B79F',
          400: '#949C7F',
          500: '#6A7257',
          600: '#5D654B',
          700: '#494F3C',
          800: '#3C4133',
          900: '#35392E',
          950: '#1B1D16',
        },
      },

      // ─── NEW: Custom Font Families ────────────────────────────────────────────
      fontFamily: {
        // Erbaum family from Adobe (weights controlled via font-weight utilities)
        erbaum: ['"erbaum"', 'sans-serif'],
        // Add your custom font here:
        myfont: ['MyFont', 'erbaum', 'Inter', 'Arial', 'sans-serif'],
        // Varien custom font
        varien: ['Varien', 'sans-serif'],
        // Cornero custom font
        'cornero': ['Font-cornero', 'sans-serif'],
      },

      // ─── NEW: Global Layout Tuning ────────────────────────────────────────────
      fontSize: {
        'xs-sm': ['0.775rem', { lineHeight: '1rem' }],
        'md-plus': ['1.1rem', { lineHeight: '1.5rem' }],
        'xl-plus': ['1.35rem', { lineHeight: '1.85rem' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '192': '48rem',
      },
      scale: {
        '98': '0.98',
        '101': '1.01',
        '102': '1.02',
      },
    },
  },
  plugins: [],
}
