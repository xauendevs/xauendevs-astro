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
    // @astrojs/vercel resolves each entry with realpath(), so these
    // must be concrete files rather than glob patterns.
    includeFiles: [
      "node_modules/harfbuzzjs/hb.wasm",
      "node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
      "node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff",
    ],
  }),
});
