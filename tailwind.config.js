/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b2545',
          light: '#13315c',
          dark: '#071a33',
        },
        govgreen: {
          DEFAULT: '#00703c',
          dark: '#005a30',
        },
        govblue: {
          DEFAULT: '#1d70b8',
          dark: '#155087',
        },
        govpurple: '#4c2c92', // visited links
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
        lightgrey: '#f3f2f1', // GDS surface / secondary button
        focus: '#ffdd00',
      },
      fontFamily: {
        // GDS Transport is licence-restricted off gov.uk; Arial is the compliant substitute.
        sans: ['"GDS Transport"', 'arial', 'helvetica', 'sans-serif'],
      },
      // GOV.UK type scale (desktop) mapped onto Tailwind's text-* utilities.
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.25' }], // 14px
        sm: ['1rem', { lineHeight: '1.25' }], // 16px
        base: ['1.1875rem', { lineHeight: '1.32' }], // 19px — GDS body
        lg: ['1.5rem', { lineHeight: '1.25' }], // 24px — heading-m
        xl: ['1.5rem', { lineHeight: '1.25' }], // 24px
        '2xl': ['2.25rem', { lineHeight: '1.11' }], // 36px — heading-l
        '3xl': ['3rem', { lineHeight: '1.04' }], // 48px — heading-xl
        '4xl': ['3rem', { lineHeight: '1.04' }], // 48px
        '5xl': ['3.5rem', { lineHeight: '1.04' }], // 56px
      },
      // GDS is square.
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 12, 12, 0.06), 0 1px 3px rgba(11, 12, 12, 0.08)',
      },
      keyframes: {
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
