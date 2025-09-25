/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          800: '#1e293b',
          900: '#0f172a',
          700: '#334155',
          600: '#475569'
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
          400: '#34d399'
        },
        sky: {
          500: '#0ea5e9',
          600: '#0284c7',
          400: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}