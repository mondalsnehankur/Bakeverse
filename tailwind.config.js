/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
          950: '#3B0764',
        },
        mocha: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#2E1746',
          800: '#231236',
          900: '#1A0E26',
          950: '#0F0817',
        },
        marshmallow: {
          50: '#FFFFFF',
          100: '#FFFDF9',
          200: '#FFF9F2',
          300: '#FFF3E5',
          400: '#FFE9D0',
        },
        berry: {
          800: '#581C87',
          900: '#3B0764',
          950: '#1E1B4B',
        },
        sakura: {
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
        },
        matcha: {
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
        },
      },
      fontFamily: {
        fredoka: ['Fredoka', 'Quicksand', 'sans-serif'],
        quicksand: ['Quicksand', 'Fredoka', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(147, 51, 234, 0.12)',
        glow: '0 0 25px rgba(192, 132, 252, 0.35)',
        card: '0 4px 20px -2px rgba(90, 24, 154, 0.06)',
      },
    },
  },
  plugins: [],
};
