import { defineConfig, mergeConfig } from "vite";
import base from "../vite.config";
export default mergeConfig(base, defineConfig({
  server: { host: "127.0.0.1", port: 5197, strictPort: true,
    proxy: { "/api": { target: process.env.AUTH_AUDIT_API_URL, changeOrigin: true, secure: false } } },
}));
