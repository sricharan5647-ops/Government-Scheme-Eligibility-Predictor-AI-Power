/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#dce7f3',
          200: '#bed1e7',
          300: '#94b4d7',
          400: '#6490c2',
          500: '#4372ac',
          600: '#325990',
          700: '#2a4875',
          800: '#1b3150',
          900: '#0f2038',
          950: '#0a1526'
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        saffron: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309'
        }
      }
    },
  },
  plugins: [],
}
