import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "github-pages",

  // Use relative asset paths so the same build works both on
  // 6900903-ai.github.io/chudo-app-design/ and on chudocoin.pp.ua.
  base: "./",

  publicDir: "../public",

  plugins: [
    react(),
  ],

  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH":
      JSON.stringify("."),
  },

  build: {
    outDir: "../pages-dist",
    emptyOutDir: true,
  },
});
