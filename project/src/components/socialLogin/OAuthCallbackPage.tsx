import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext"; // ✅ AuthContext import

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // ✅ 로그인 상태 갱신 함수 가져오기

  const provider = location.pathname.split("/")[2]; // "naver" | "kakao" ...
  const params = new URLSearchParams(location.search);
  const code = params.get("code") || "";
  const state = params.get("state") || "";

  useEffect(() => {
    (async () => {
      if (!provider || !code) {
        alert("잘못된 요청입니다.");
        navigate("/auth/login", { replace: true });
        return;
      }

      try {
        // 1) 백엔드 콜백 호출 → 티켓 받기
        const qs = new URLSearchParams({ code, ...(state ? { state } : {}) }).toString();
        const cbRes = await fetch(
          `https://34.64.151.197:443/auth/${provider}/callback?${qs}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Accept": "application/json" },
          }
        );
        if (!cbRes.ok) throw new Error(`callback failed: ${cbRes.status}`);
        const { ticket } = await cbRes.json();
        if (!ticket) throw new Error("missing ticket");

        // 2) 브릿지 호출 → 서버가 jwt 쿠키 심음
        const brRes = await fetch(
          `https://34.64.151.197:443/auth/bridge?ticket=${encodeURIComponent(ticket)}`,
          { method: "GET", credentials: "include" }
        );
        if (!brRes.ok) throw new Error(`bridge failed: ${brRes.status}`);

        // 3) ✅ 쿠키 심은 후 /api/user 호출 → AuthContext 갱신
        const meRes = await axios.get("/api/user", { withCredentials: true });
        login(meRes.data); // 전역 상태에 로그인 반영

        // 4) 홈으로 이동
        navigate("/", { replace: true });
      } catch (e) {
        console.error(e);
        alert("소셜 로그인 처리 중 오류가 발생했습니다.");
        navigate("/auth/login", { replace: true });
      }
    })();
  }, [provider, code, state, navigate, login]);

  return <div>로그인 처리 중입니다...</div>;
};

export default OAuthCallbackPage;
