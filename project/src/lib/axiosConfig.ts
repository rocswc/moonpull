// src/lib/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://192.168.56.1:8080",
  withCredentials: true, // 쿠키 자동 전송
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 쿠키 기반 인증이므로 Authorization 헤더 불필요
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[Axios Request]", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401이면 로그인 페이지로 이동
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Axios Error]", error);
    if (error.response?.status === 401) {
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
