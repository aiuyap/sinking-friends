import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F6F5EC',
          dim: '#EBE9DC',
        },
        sage: {
          DEFAULT: '#6B8E6B',
          hover: '#557555',
          dim: 'rgba(107, 142, 107, 0.15)',
        },
        terracotta: {
          DEFAULT: '#C4956A',
          dim: 'rgba(196, 149, 106, 0.15)',
        },
        charcoal: {
          DEFAULT: '#1a1a1a',
          secondary: '#4a4a4a',
          muted: '#888888',
        },
        success: {
          DEFAULT: '#4A9D6B',
          dim: 'rgba(74, 157, 107, 0.15)',
        },
        danger: {
          DEFAULT: '#C75D5D',
          dim: 'rgba(199, 93, 93, 0.15)',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'accent': '0 4px 12px rgba(107, 142, 107, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
