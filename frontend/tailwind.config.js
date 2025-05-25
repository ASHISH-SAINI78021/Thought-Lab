/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      accent: "var(--accent)",
      text: "var(--text)",
      background: "var(--background)",
      black: "#000000",
      white: "#ffffff",
    },
    fontFamily: {
      display: ["Sansita Swashed"],
      sans: ["Poppins"],
    },
    transitionPropery: {
      width: "width",
    },
    extend: {},
  },
  plugins: [],
};
