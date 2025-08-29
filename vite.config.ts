import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8888,

    // ✅ 프록시 설정 추가
	proxy: {
	  "/api": {
	    target: "https://34.64.151.197", // ✅ 실서버 IP + HTTPS
	    changeOrigin: true,
	    secure: false, // 🔐 self-signed 인증서일 경우 필요
	    rewrite: (path) => path.replace(/^\/api/, "/api"),
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
