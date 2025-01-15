import animations from "tailwindcss-animated";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--color-accent)",
        dark: "var(--color-dark)",
      },
      brightness: {
        25: ".25",
      },
      scale: ["group-active"],
    },
  },
  plugins: [
    animations,
    function ({ addVariant }) {
      // Agregamos la variante group-active
      addVariant("group-active", ({ modifySelectors }) => {
        modifySelectors(({ className }) => {
          return `.group:active .${className}`;
        });
      });
    },
  ],
};
