/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        workbench: {
          950: '#090a0f',
          900: '#0e0f14',
          850: '#121319',
          800: '#161720',
          750: '#1b1d28',
          700: '#222432',
          600: '#2e3143',
          border: '#1f212c',
          borderSubtle: '#181922',
          borderActive: '#323646',
        }
      }
    },
  },
  plugins: [],
}
