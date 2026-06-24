/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Official-feeling masthead navy (retained for existing surfaces)
        navy: {
          DEFAULT: '#0b2545',
          light: '#13315c',
          dark: '#071a33',
        },
        // GOV.UK palette
        govgreen: {
          DEFAULT: '#00703c',
          dark: '#005a30',
        },
        govblue: {
          DEFAULT: '#1d70b8',
          dark: '#155087',
        },
        emergency: {
          DEFAULT: '#d4351c',
          dark: '#aa2a16',
          light: '#f6e4e1',
        },
        urgent: {
          DEFAULT: '#f47738',
          dark: '#c75e26',
          light: '#fdeee4',
        },
        ink: '#0b0c0c',
        midgrey: '#505a5f',
        line: '#b1b4b6',
        focus: '#ffdd00',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      // GOV.UK-style minimal radii — tightens every existing rounded-* utility
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '4px',
        lg: '4px',
        xl: '6px',
        '2xl': '8px',
        '3xl': '10px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 12, 12, 0.06), 0 1px 3px rgba(11, 12, 12, 0.08)',
      },
      keyframes: {
        // Soft ring pulse for newly-arrived / at-risk job cards
        attention: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29,112,184,0)' },
          '50%': { boxShadow: '0 0 0 3px rgba(29,112,184,0.30)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': {
          from: { transform: 'translateY(-6px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-in': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        attention: 'attention 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 220ms ease-out',
        'slide-in': 'slide-in 280ms ease-out both',
        'toast-in': 'toast-in 220ms ease-out',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
