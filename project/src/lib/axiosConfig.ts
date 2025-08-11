// src/lib/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://192.168.56.1:8080", // 백엔드 실제 IP
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 인터셉터: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
	  
    }
	console.log("[Axios Request Token]", config.headers.Authorization);
    console.log("[Axios Request]", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Axios Error]", error);
    if (error.response?.status === 401) {
      window.location.href = "/auth"; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
