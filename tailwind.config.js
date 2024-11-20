/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  
  plugins: [],
 
  theme: {
    colors: {
      color1: '#f05537', 
      color2: '#fff',
      color3: '#000',
    },
    extend: {
      backgroundImage: {
        'wave-pattern': "url('/img/wav.png')",
      },
      keyframes: {
        animateWave: {
          '0%': { backgroundPositionX: '1000px' },
          '100%': { backgroundPositionX: '0px' },
        },
        animateWave_02: {
          '0%': { backgroundPositionX: '0px' },
          '100%': { backgroundPositionX: '1000px' },
        },
      },
      animation: {
        animateWave: 'animateWave 4s linear infinite',
        animateWave_02: 'animateWave_02 4s linear infinite',
      },
    },
  },
};

  


