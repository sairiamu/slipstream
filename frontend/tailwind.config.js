/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'var(--bg-base)',
          mid: 'var(--bg-mid)',
          light: 'var(--bg-light)',
        },
        milk: {
          DEFAULT: 'var(--color-milk)',
          dim: 'var(--color-milk-dim)',
        },
        silver: {
          DEFAULT: 'var(--color-silver)',
          bright: '#E2E6EE',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          glow: 'var(--accent-glow)',
        },
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
