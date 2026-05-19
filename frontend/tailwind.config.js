/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'foboh-teal':       '#0F6E56',
        'foboh-teal-dark':  '#085041',
        'foboh-teal-light': '#1D9E75',
        'foboh-teal-bg':    '#E1F5EE',
      },
    },
  },
  plugins: [],
}

