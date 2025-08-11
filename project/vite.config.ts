import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8888,
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"), // mkcert 발급 키
      cert: fs.readFileSync("./certs/localhost.pem"),    // mkcert 발급 인증서
    },
    proxy: {
      "/api": {
        target: "https://localhost:8080", // ✅ HTTPS 백엔드 포트
        changeOrigin: true,
        secure: false, // ✅ mkcert 자기서명 허용
        ws: true,      // 웹소켓도 프록시할 경우 필요
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
