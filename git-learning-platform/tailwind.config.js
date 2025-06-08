/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Para modo oscuro
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0d1117',
        'secondary-dark': '#161b22',
        'accent-green': '#39d353',
        'accent-blue': '#58a6ff',
        'text-primary': '#f0f6fc',
        'text-secondary': '#8b949e',
        'border': '#30363d',
        'danger': '#f85149',
        'warning': '#d29922'
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'blink': 'blink 1.06s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
