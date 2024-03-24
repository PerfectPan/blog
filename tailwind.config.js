/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#48434f',
        'active-blue': '#316ecd',
      },
      borderWidth: {
        '10': '10px',
      },
    },
  },
};
