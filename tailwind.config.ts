import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1D3A',
        slateBlue: '#1E3A5F',
        steel: '#4A5D75',
        fog: '#EEF2F7',
      },
    },
  },
  plugins: [],
} satisfies Config;
