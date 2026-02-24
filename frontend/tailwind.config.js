/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your existing primary colors
        primary: {
          25: '#f4f5f9',
          50: '#e9ebf4',
          100: '#bbc2db',
          200: '#9aa5ca',
          300: '#6c7cb2',
          400: '#4f62a3',
          500: '#233b8c',
          600: '#20367f',
          700: '#192a63',
          800: '#13204d',
          900: '#0f193b',
        },
        // Info colors
        info: {
          25: '#f3f3ff',
          50: '#e6e6fe',
          100: '#b0b0fd',
          200: '#8a8afb',
          300: '#5454fa',
          400: '#3333f9',
          500: '#0000f7',
          600: '#0000e1',
          700: '#0000af',
          800: '#000088',
          900: '#000068',
        },
        // Success/Green colors
        success: {
          25: '#f3fbf6',
          50: '#e6f7ed',
          100: '#b0e5c7',
          200: '#8ad8ab',
          300: '#54c785',
          400: '#33bc6d',
          500: '#00ab49',
          600: '#009c42',
          700: '#007934',
          800: '#007934',
          900: '#00481f',
        },
        // Gray scale
        gray: {
          25: '#fcfcfd',
          50: '#f9fafb',
          100: '#f2f4f7',
          200: '#eaecf0',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
        },
        // Custom colors
        imageBG: '#f7f7f9',
        white: {
          DEFAULT: '#ffffff',
          70: '#ffffffb2',
        },
        black: {
          DEFAULT: '#000000',
          70: '#000000b2',
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
      backgroundColor: {
        main: '#f3f4f6',
      },
    },
  },
  plugins: [],
};