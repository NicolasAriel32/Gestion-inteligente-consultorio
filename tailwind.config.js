/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#273532",
        deep: "#315F59",
        sage: "#A7C2B6",
        ivory: "#F7F8F5",
        sand: "#E8D6C7",
        muted: "#71807A",
        line: "#E5EAE6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(39, 53, 50, .07)",
      },
      borderRadius: {
        xl2: "1.125rem",
      },
    },
  },
  plugins: [],
};
