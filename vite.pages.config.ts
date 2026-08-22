import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "github-pages",

  base: "/chudo-app-design/",

  publicDir: "../public",

  plugins: [
    react(),
  ],

  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH":
      JSON.stringify("/chudo-app-design"),
  },

  build: {
    outDir: "../pages-dist",
    emptyOutDir: true,
  },
});
