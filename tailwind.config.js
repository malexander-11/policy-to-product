/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Official-feeling masthead navy
        navy: {
          DEFAULT: '#0b2545',
          light: '#13315c',
          dark: '#071a33',
        },
        // GOV.UK-influenced accent colours (recognisable, accessible)
        govgreen: {
          DEFAULT: '#00703c',
          dark: '#005a30',
        },
        govblue: {
          DEFAULT: '#1d70b8',
          dark: '#155087',
        },
        ink: '#0b0c0c',
        midgrey: '#505a5f',
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
      boxShadow: {
        card: '0 1px 2px rgba(11, 12, 12, 0.06), 0 1px 3px rgba(11, 12, 12, 0.08)',
      },
    },
  },
  plugins: [],
}
