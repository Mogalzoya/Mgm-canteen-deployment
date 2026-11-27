import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the React app runs on :5173 and forwards /api and /uploads calls to
// Spring Boot on :8080, so you do not need to add CORS config to the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://mgm-canteen-deployment.onrender.com", changeOrigin: true },
      "/uploads": { target: "https://mgm-canteen-deployment.onrender.com", changeOrigin: true },
    },
  },
});
