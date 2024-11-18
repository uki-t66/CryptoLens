/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',  // WQHD対応
        '4xl': '2560px',  // 4K対応
      },
    },
  },
  plugins: [],
}

