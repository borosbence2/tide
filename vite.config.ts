import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Pages a project site is served from /<repo>/, so the CI build sets
// VITE_BASE accordingly. Locally and on a root/custom domain it stays "/".
const base = process.env.VITE_BASE || "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon-180.png", "favicon.svg"],
      manifest: {
        name: "Tide — calm companion",
        short_name: "Tide",
        description:
          "A calm companion for panic attacks: breathing, grounding, and reassurance.",
        lang: "en",
        display: "standalone",
        orientation: "portrait",
        // Relative so it works under any base (root, /tide/, or a custom domain).
        start_url: ".",
        scope: ".",
        background_color: "#0e1726",
        theme_color: "#0e1726",
        categories: ["health", "lifestyle"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
});
