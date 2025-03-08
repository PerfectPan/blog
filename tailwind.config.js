/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#48434f',
        'wash-dark': 'rgb(35, 39, 47)',
        'shiki-dark': '#16181d',
      },
      borderWidth: {
        10: '10px',
      },
      lineHeight: {
        16: '4rem',
      },
    },
  },
};
