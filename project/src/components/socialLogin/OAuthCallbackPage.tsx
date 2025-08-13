import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.pathname.split("/")[2]; // "naver", "google", "kakao"
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");
  const { login } = useAuth();

  useEffect(() => {
    if (!provider || !code) {
      alert("잘못된 요청입니다.");
      navigate("/auth/login");
      return;
    }

    axios
      .get(`/auth/${provider}/callback?code=${code}&state=${state}`, {
        withCredentials: true,
      })
	  .then(async (res) => {
	    const { needSocialJoin, social_id, email, name } = res.data;

	    if (needSocialJoin) {
	      navigate(`/auth/social-join?provider=${provider}&socialId=${social_id}&email=${email}&name=${name}`);
	    } else {
	      try {
	        const me = await axios.get("/api/user", { withCredentials: true }).then(r => r.data);
	        login?.(me); // ✅ AuthContext 로그인 상태 갱신
	      } catch (e) {
	        console.warn("유저 정보 가져오기 실패", e);
	      }
	      navigate("/", { replace: true });
	    }
	  })
      .catch(() => {
        alert(`${provider} 로그인 처리 중 오류 발생`);
        navigate("/auth/login");
      });
  }, []);

  return <div>로그인 처리 중입니다...</div>;
};

export default OAuthCallbackPage;
