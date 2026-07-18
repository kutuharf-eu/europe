/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Semantik renkler CSS değişkenlerinden gelir (app/globals.css):
      // :root = açık tema (site geneli), .theme-studio = koyu "3D Tabela Stüdyosu"
      // (konfigüratör ana sayfası). rgb + <alpha-value> deseni bg-accent/5 gibi
      // opaklık varyantlarını korur.
      colors: {
        accent: 'rgb(var(--kh-accent) / <alpha-value>)',
        accentlite: 'rgb(var(--kh-accentlite) / <alpha-value>)',
        charcoal: 'rgb(var(--kh-charcoal) / <alpha-value>)',
        herobg: 'rgb(var(--kh-herobg) / <alpha-value>)',
        textsec: 'rgb(var(--kh-textsec) / <alpha-value>)',
        textmut: 'rgb(var(--kh-textmut) / <alpha-value>)',
        lighttxt: 'rgb(var(--kh-lighttxt) / <alpha-value>)',
        mutedark: 'rgb(var(--kh-mutedark) / <alpha-value>)',
        sectionlight: 'rgb(var(--kh-sectionlight) / <alpha-value>)',
        linegray: 'rgb(var(--kh-linegray) / <alpha-value>)',
        inputline: 'rgb(var(--kh-inputline) / <alpha-value>)',
        warnred: 'rgb(var(--kh-warnred) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 24px rgba(0,0,0,0.10)',
        dropdown: '0 12px 28px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
