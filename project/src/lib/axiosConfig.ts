// src/lib/axiosConfig.ts
import axios from "axios";

axios.defaults.baseURL = "https://34.64.151.197:443";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";


// ✅ FormData일 땐 Content-Type 자동 제거
axios.interceptors.request.use(
  (config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete (config.headers as any)?.["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 401 에러 시 로그인 페이지로 리디렉션
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.location.href = "/auth?reason=unauthorized";
    }
    return Promise.reject(error);
  }
);

export default axios;
