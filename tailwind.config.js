/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Set Poppins as default sans font
      },
      colors: {
        brand: {
          cream: '#FFEFCD',      // Headings/accents/buttons
          buttonText: '#424530', // Button text color
          dark: '#424530',       // Dark Olive Green: #424530 RGB(66, 69, 48)
          black: '#424530',      // Replaced pure black with Dark Olive Green
          burntOrange: '#E09132',// Burnt Orange: #E09132
          olive: '#424530',      // Dark Olive Green
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
}
