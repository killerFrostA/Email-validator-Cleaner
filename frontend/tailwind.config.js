/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: "#154D71" },
        ocean:  { DEFAULT: "#1C6EA4" },
        sky:    { DEFAULT: "#33A1E0" },   // enables ring-sky, bg-sky, ring-sky/60, etc.
        butter: { DEFAULT: "#FFF9AF" },
        ink:    { DEFAULT: "#233044" },   // enables text-ink, bg-ink, border-ink
      },
      boxShadow: {
        card: "0 6px 20px rgba(21,77,113,.08)",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
