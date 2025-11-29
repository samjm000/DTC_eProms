/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nhs-blue': '#005EB8',
        'nhs-dark-blue': '#003087',
        'nhs-light-blue': '#41B6E6',
        'nhs-green': '#007F3B',
        'nhs-red': '#DA291C',
        'nhs-grey': '#4C6272',
      }
    },
  },
  plugins: [],
}
