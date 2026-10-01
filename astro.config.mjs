import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://xauendevs.io",
  integrations: [tailwind()],
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
});
