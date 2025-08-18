// src/lib/axiosConfig.ts
import axios from "axios";

// ✅ 기본 axios에 전역 설정 적용
axios.defaults.baseURL = "https://192.168.56.1:8080";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

// ✅ FormData일 땐 Content-Type 자동 제거 (boundary 자동 처리되도록)
axios.interceptors.request.use(
  (config) => {
    const isForm =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isForm && config.headers) {
      const headers = config.headers;
      if (typeof headers.delete === "function") {
        headers.delete("Content-Type");
      } else if (typeof headers === "object" && headers !== null) {
        Reflect.deleteProperty(headers, "Content-Type");
      }
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