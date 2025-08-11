// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./", // ✅ important for Electron
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  define: {
    "process.env": {
      VITE_DEV_SERVER_URL: "http://localhost:3000",
    },
  },
});
