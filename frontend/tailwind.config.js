/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#102A43",
          deepNavy: "#0B1F33",
          teal: "#0D9488",
          tealHover: "#0F766E",
          mint: "#5EEAD4",
          mintLight: "#CCFBF1",
          mintDark: "#115E59",
          bg: "#F7FAFC",
          surface: "#FFFFFF",
          text: "#172B4D",
          muted: "#64748B",
          border: "#E5EAF0",
          borderFocus: "#99F6E4",
          success: "#15803D",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Manrope", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        bangla: ["var(--font-hind-siliguri)", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(16, 42, 67, 0.05), 0 1px 2px 0 rgba(16, 42, 67, 0.03)",
        card: "0 4px 6px -1px rgba(16, 42, 67, 0.07), 0 2px 4px -1px rgba(16, 42, 67, 0.04)",
        cardHover: "0 10px 15px -3px rgba(16, 42, 67, 0.1), 0 4px 6px -2px rgba(16, 42, 67, 0.05)",
        elevated: "0 20px 25px -5px rgba(16, 42, 67, 0.1), 0 10px 10px -5px rgba(16, 42, 67, 0.04)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
