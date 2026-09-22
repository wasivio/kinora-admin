/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF8F1',
          100: '#F4EEDC',
          200: '#E9DDB9',
          300: '#DFC891',
          400: '#D4B86A',
          500: '#C5A047',
          600: '#B48C37',
          700: '#8E6D29',
          800: '#684E1C',
          900: '#453311',
          primary: '#D4AF37',
          light: '#F3E5AB',
          dark: '#997D24',
        },
        dark: {
          950: '#070708',
          900: '#0E0E10',
          850: '#131316',
          800: '#18181B',
          700: '#27272A',
          600: '#3F3F46',
          500: '#52525B',
          400: '#71717A',
          300: '#A1A1AA',
          200: '#E4E4E7',
          100: '#F4F4F5',
          50: '#FAFAFA',
        },
      },
      boxShadow: {
        'gold-glow': '0 0 15px -3px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 25px -3px rgba(212, 175, 55, 0.4)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
