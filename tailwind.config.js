/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50: '#F1F0FF',
          100: '#E4E2FF',
          200: '#C9C5FF',
          300: '#ADA7FF',
          400: '#8B82FF',
          500: '#6C63FF',
          600: '#4E3FFF',
          700: '#3B2AE0',
          800: '#2E20B0',
          900: '#241A85',
        },
        secondary: {
          DEFAULT: '#4F8CFF',
          50: '#EEF4FF',
          100: '#DCE9FF',
          200: '#B9D3FF',
          300: '#8FB8FF',
          400: '#6BA0FF',
          500: '#4F8CFF',
          600: '#2A6EF0',
          700: '#1E56C4',
          800: '#1A459A',
          900: '#173A7A',
        },
        ink: {
          50: '#F7F7FB',
          100: '#EEEEF6',
          400: '#7A7A94',
          600: '#4B4B63',
          800: '#211F3D',
          900: '#14132A',
          950: '#0B0A18',
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6C63FF 0%, #4F8CFF 100%)',
        'brand-radial': 'radial-gradient(circle at top right, rgba(108,99,255,0.15), transparent 60%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        glow: '0 0 40px rgba(108, 99, 255, 0.25)',
        card: '0 4px 24px rgba(20, 19, 42, 0.06)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s ease-out both',
        blob: 'blob 12s infinite ease-in-out',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
