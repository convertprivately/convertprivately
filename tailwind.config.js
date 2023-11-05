/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Update this to point to your files
  theme: {
    extend: {
      colors: {
        primaryColor: '#D7EBFB',
        
      fontFamily: {
        body: ['Nunito']
      }
    },
      
    },
  },
  plugins: [],
}

