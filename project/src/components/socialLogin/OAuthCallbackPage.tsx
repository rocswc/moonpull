import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.pathname.split("/")[2]; // "naver", "google", "kakao"
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");

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
      .then((res) => {
        const { needSocialJoin, social_id, email, name } = res.data;
        if (needSocialJoin) {
          navigate(`/auth/social-join?provider=${provider}&socialId=${social_id}&email=${email}&name=${name}`);
        } else {
          navigate("/");
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
