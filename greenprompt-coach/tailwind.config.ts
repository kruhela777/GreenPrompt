import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-bg))',
        foreground: 'hsl(var(--color-fg))',
        card: 'hsl(var(--color-card))',
        border: 'hsl(var(--color-border))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config
