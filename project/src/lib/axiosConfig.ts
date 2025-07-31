import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.56.1:8080", // 백엔드 실제 IP로 수정
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


// 요청 로그
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[Axios Request]", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Axios Error]", error);
    if (error.response?.status === 401) {
      // 인증 필요 시 리다이렉트 (선택)
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
