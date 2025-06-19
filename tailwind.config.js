/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eaf6ef',
          100: '#d4eddc',
          200: '#a8dbb9',
          300: '#7cc996',
          400: '#50b773',
          500: '#21823b',
          600: '#1b6a30',
          700: '#155225',
          800: '#0f3a1a',
          900: '#09220f',
          950: '#051108',
        },
        secondary: {
          50: '#fff5f5',
          100: '#ffeaea',
          200: '#ffcfcf',
          300: '#ffb3b3',
          400: '#ff9797',
          500: '#e53935',
          600: '#b92d2b',
          700: '#8c2221',
          800: '#5e1616',
          900: '#310b0b',
          950: '#180505',
        },
        accent: {
          500: '#222',
          100: '#f7f5ed',
        },
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}; 