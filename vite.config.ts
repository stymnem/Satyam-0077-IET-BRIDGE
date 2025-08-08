import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  /* ----------------------------------------------------------------
   * Path alias – lets you write `import x from '@/foo'`
   * ---------------------------------------------------------------- */
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  /* ----------------------------------------------------------------
   * Dev-server settings
   * ---------------------------------------------------------------- */
  server: {
    port: 5173, // change if 5173 is busy
    open: true, // auto-opens browser
    strictPort: true, // fail instead of finding another port

    /*  CORS helper:
     *  Any request starting with /api will be proxied to the backend,
     *  so the browser thinks it’s same-origin and you avoid CORS headaches.
     */
    proxy: {
      "/api": {
        target: "http://localhost:5134",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  /* ----------------------------------------------------------------
   * Build settings – defaults are fine; adjust if you need a sub-folder
   * ---------------------------------------------------------------- */
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  /* ----------------------------------------------------------------
   * Vitest setup (optional) – ignore if you’re not using Vitest
   * ---------------------------------------------------------------- */
});
