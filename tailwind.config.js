/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: '#0F6E56',
          light: '#E6F3EF',
          dark: '#0A5240',
          50: '#f0fdf9',
          100: '#ccfbef',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#0F6E56',
          900: '#134e4a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
