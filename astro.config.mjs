import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  redirects: {
    "/proxima-pivo": {
      status: 302,
      destination: "https://saraos.tech",
    },
  },
});
