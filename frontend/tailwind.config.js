/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: "#F2A33A",
          50: "#FEF7EE",
          100: "#FDECDB",
          200: "#FAD8B5",
          500: "#F2A33A",
          600: "#D98720",
          700: "#B46513",
        },
        plum: {
          DEFAULT: "#5B2A86",
          50: "#F6F1FA",
          100: "#ECDCF3",
          500: "#5B2A86",
          600: "#491F6D",
          700: "#381454",
        },
        tealMint: {
          DEFAULT: "#2BB3A3",
          50: "#EEFAF8",
          100: "#DCF5F1",
          500: "#2BB3A3",
          600: "#1FA091",
        },
        warmIvory: "#FFF9F0",
        midnightAubergine: "#14101F",
        cardDark: "#1C172B",
        cardLight: "#FFFFFF",
        festiveGreen: "#3FB27F",
        festiveAmber: "#F5B83D",
        festiveCoral: "#F46D6D",
        festiveDanger: "#E5484D",
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        'festive': '20px',
        'festive-lg': '24px',
        'festive-sm': '16px',
      },
      boxShadow: {
        'festive': '0 10px 30px -10px rgba(91, 42, 134, 0.08), 0 4px 6px -2px rgba(242, 163, 58, 0.05)',
        'festive-hover': '0 20px 40px -15px rgba(91, 42, 134, 0.16), 0 8px 12px -4px rgba(242, 163, 58, 0.1)',
        'festive-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
