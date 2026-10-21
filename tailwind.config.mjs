import animations from "tailwindcss-animated";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--color-accent)",
        "accent-text": "var(--color-accent-text)",
        dark: "var(--color-dark)",
        night: "#08080b",
        pumpkin: "#ff8a1f",
      },
      brightness: {
        25: ".25",
      },
      scale: ["group-active"],
    },
  },
  plugins: [
    animations,
    // Variante del tema Halloween: `hw:bg-night` solo se aplica con <body data-theme="halloween">.
    function ({ addVariant }) {
      addVariant("hw", '[data-theme="halloween"] &');
    },
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
