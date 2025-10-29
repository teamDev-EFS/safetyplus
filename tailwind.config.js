/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        accent: {
          500: "#22C55E",
          600: "#16A34A",
        },
        primary: {
          DEFAULT: "#059669",
          foreground: "#FFFFFF",
        },
      },
      gradientColorStops: {
        "hero-start": "#065F46",
        "hero-end": "#10B981",
        "cta-start": "#10B981",
        "cta-end": "#059669",
      },
    },
  },
  plugins: [],
};
