import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
        // no rewrite to preserve /api prefix
        ws: false,
      },
      "/socket.io": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
    },
    fs: {
      allow: [".."],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
