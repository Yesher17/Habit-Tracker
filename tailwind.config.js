/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#141414',
          1: '#1a1a1a',
          2: '#212121',
          3: '#2a2a2a',
        },
        border: 'rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
