import animations from "tailwindcss-animated";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--color-accent)",
      },
      brightness: {
        25: ".25",
      },
    },
  },
  plugins: [animations],
};
