/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-surface', 'bg-layer', 'bg-card',
    'text-primary', 'text-secondary', 'text-accent',
    'border', 'input-bg', 'input-text', 'input-placeholder',
    'button-bg', 'button-hover', 'link', 'nav-bg', 'footer-bg',
    'modal-bg', 'tag-bg', 'badge-bg',
    'dark:bg-surface-dark', 'dark:text-primary-dark', 'dark:bg-layer-dark',
    'dark:text-secondary-dark', 'dark:border-dark', 'dark:bg-card-dark',
    'dark:text-accent-dark', 'dark:bg-modal-dark', 'dark:text-input-text-dark',
    'dark:placeholder-input-placeholder-dark', 'dark:hover:bg-button-hover-dark'
  ],
  theme: {
    extend: {
      colors: {
        // Custom palette
        pearl: {
          DEFAULT: '#f1e5c7',
          100: '#463712',
          200: '#8c6f23',
          300: '#cea43a',
          400: '#dfc480',
          500: '#f1e5c7',
          600: '#f4ead1',
          700: '#f6efdd',
          800: '#f9f4e8',
          900: '#fcfaf4',
        },
        sage: {
          DEFAULT: '#bcbd9a',
          100: '#29291b',
          200: '#525336',
          300: '#7b7c51',
          400: '#a0a270',
          500: '#bcbd9a',
          600: '#c9caae',
          700: '#d6d7c2',
          800: '#e4e4d6',
          900: '#f1f2eb',
        },
        moss_green: {
          DEFAULT: '#86956d',
          100: '#1b1e16',
          200: '#363c2c',
          300: '#515b42',
          400: '#6c7957',
          500: '#86956d',
          600: '#9fab8b',
          700: '#b7c0a8',
          800: '#cfd5c5',
          900: '#e7eae2',
        },
        fern_green: {
          DEFAULT: '#516d40',
          100: '#10160d',
          200: '#212c1a',
          300: '#314226',
          400: '#415733',
          500: '#516d40',
          600: '#719859',
          700: '#94b480',
          800: '#b8cdaa',
          900: '#dbe6d5',
        },
        pakistan_green: {
          DEFAULT: '#163010',
          100: '#050a03',
          200: '#091407',
          300: '#0e1e0a',
          400: '#12280d',
          500: '#163010',
          600: '#357427',
          700: '#53b73d',
          800: '#8ad37a',
          900: '#c5e9bc',
        },
        dark_green: {
          DEFAULT: '#101c0d',
          100: '#030603',
          200: '#060b05',
          300: '#0a1108',
          400: '#0d160a',
          500: '#101c0d',
          600: '#345c2a',
          700: '#599d48',
          800: '#8cc47e',
          900: '#c6e1bf',
        },

        // Light Mode Tokens
        surface: '#f1e5c7',
        layer: '#bcbd9a',
        card: '#ffffff',
        primary: '#163010',
        secondary: '#516d40',
        accent: '#86956d',
        border: '#bcbd9a',
        input: '#fcfaf4',
        'input-text': '#101c0d',
        'input-placeholder': '#516d40',
        button: '#86956d',
        'button-hover': '#516d40',
        link: '#516d40',
        nav: '#bcbd9a',
        footer: '#f1e5c7',
        modal: '#ffffff',
        tag: '#bcbd9a',
        badge: '#86956d',

        // Refined Dark Mode Tokens
'surface-dark': '#0e0f0c',            // near-black with moss undertone
'layer-dark': '#1a1e17',              // soft mossy-charcoal layer
'card-dark': '#1f271f',               // card with neutral green-gray hint
'primary-dark': '#f1e5c7',            // warm cream for text
'secondary-dark': '#aabca3',          // soft sage-gray
'accent-dark': '#c4d3b4',             // pale leaf — for links/buttons
'border-dark': '#3e4a39',             // earthy neutral border
'input-dark': '#141814',              // lifted slightly from surface
'input-text-dark': '#f1e5c7',
'input-placeholder-dark': '#8d9b86',
'button-dark': '#4b6042',             // green-gray olive
'button-hover-dark': '#657f5d',       // brighter hover
'link-dark': '#c4d3b4',
'nav-dark': '#1a1e17',
'footer-dark': '#0e0f0c',
'modal-dark': '#222a22',             // neutral olive shadow box
'tag-dark': '#3e4a39',
'badge-dark': '#8d9b86',
      },
    },
  },
};