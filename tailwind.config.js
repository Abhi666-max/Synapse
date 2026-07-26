/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: '#00f3ff',
        neonMagenta: '#ff00ff',
        darkBg: '#050505',
        glassBg: 'rgba(10, 10, 15, 0.45)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        orbitron: ['"Orbitron"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glowCyan: '0 0 15px 5px rgba(0, 243, 255, 0.3)',
        glowMagenta: '0 0 15px 5px rgba(255, 0, 255, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
