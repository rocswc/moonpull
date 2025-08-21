import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.pathname.split("/")[2]; // "naver" | "kakao" ...
  const params = new URLSearchParams(location.search);
  const code = params.get("code") || "";
  const state = params.get("state") || "";

  useEffect(() => {
    if (!provider || !code) {
      alert("잘못된 요청입니다.");
      navigate("/auth/login", { replace: true });
      return;
    }
    // ❗ axios로 호출하지 말고, 백엔드 콜백으로 브라우저 이동
    const qs = new URLSearchParams({ code, ...(state ? { state } : {}) }).toString();
    window.location.replace(`https://localhost:8080/auth/${provider}/callback?${qs}`);
  }, []);

  return <div>로그인 처리 중입니다...</div>;
};

export default OAuthCallbackPage;