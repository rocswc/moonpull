import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// 외부 IP 주소 (여기에 본인 GCP IP 입력)
const backendIp = "https://34.64.151.197"; // ✅ 여기를 실제 외부 아이피로

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8888,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost.pem")),
    },
    proxy: {
      "/api": {
        target: `${backendIp}:443`, // ✅ 외부 HTTPS 백엔드 포트
        changeOrigin: true,
        secure: false,
        ws: true,
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
