/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          active: '#1e293b',
          border: '#1e3a5f',
        },
        income: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669',
        },
        expense: {
          DEFAULT: '#f43f5e',
          light: '#ffe4e6',
          dark: '#e11d48',
        },
        brand: {
          DEFAULT: '#6366f1',
          light: '#e0e7ff',
          dark: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-lg': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
