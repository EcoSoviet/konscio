import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import playformInline from "@playform/inline";
import compressor from "astro-compressor";
import purgecss from "astro-purgecss";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import { remarkReadingTime } from "./plugins/remark-reading-time.ts";
import { config } from "./src/config";

const fontaineOptions = {
  fallbacks: ["system-ui", "sans-serif", "monospace"],
};

export default defineConfig({
  site: config.siteUrl,
  base: config.baseUrl,
  trailingSlash: "never",
  output: "static",
  prefetch: {
    defaultStrategy: "hover",
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  build: {
    assetsInlineLimit: 4096,
    cacheDir: "./.astro-cache",
    rollupOptions: {
      output: {
        crossOrigin: "anonymous",
      },
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    playformInline({
      Logger: 0,
    }),
    purgecss(),
    compressor({
      gzip: true,
      brotli: true,
      zstd: true,
    }),
  ],
  vite: {
    plugins: [FontaineTransform.vite(fontaineOptions)],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkGfm, remarkSmartypants],
  },
});
