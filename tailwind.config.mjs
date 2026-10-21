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
        // Colores de la temporada activa (tokens --season-* / --night-rgb en Layout.astro).
        season: "rgb(var(--season-rgb) / <alpha-value>)",
        night: "rgb(var(--night-rgb) / <alpha-value>)",
        // Texto legible sobre el color de la temporada (negro en Halloween, blanco en Navidad).
        "season-ink": "rgb(var(--season-ink-rgb) / <alpha-value>)",
        // Color secundario de la temporada (Halloween: morado, Navidad: verde).
        "season-alt": "rgb(var(--season-alt-rgb) / <alpha-value>)",
      },
      brightness: {
        25: ".25",
      },
      scale: ["group-active"],
    },
  },
  plugins: [
    animations,
    // Variantes de temporada. `fest:` aplica con cualquier temporada activa (<body data-festive>) y en las
    // páginas oscuras sin temporada (<body data-dark>, la portada);
    // `halloween:` / `navidad:` solo con esa temporada (<body data-theme="...">).
    function ({ addVariant }) {
      addVariant("fest", ["[data-festive] &", "[data-dark] &"]);
      addVariant("halloween", '[data-theme="halloween"] &');
      addVariant("navidad", '[data-theme="navidad"] &');
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
