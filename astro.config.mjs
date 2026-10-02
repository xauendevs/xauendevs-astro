import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://xauendevs.io",
  integrations: [tailwind()],
  output: "server",
  vite: {
    ssr: {
      // Keep these packages external so Vercel's serverless bundle
      // can include their runtime files (fonts + HarfBuzz WASM).
      external: ["harfbuzzjs", "@fontsource/roboto"],
    },
  },
  adapter: vercel({
    webAnalytics: { enabled: true },
    includeFiles: [
      "node_modules/harfbuzzjs/**",
      "node_modules/@fontsource/roboto/files/**",
    ],
  }),
});
