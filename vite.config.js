import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/cartelera": "http://localhost:8081",
      "/api/asientos": "http://localhost:8082",
      "/api/boletos": "http://localhost:8083",
    },
  },
});
