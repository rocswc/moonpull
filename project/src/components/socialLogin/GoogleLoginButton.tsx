import React from "react";

const GOOGLE_CLIENT_ID = "구글_클라이언트_ID"; // 나중에 실제 값으로 교체
const REDIRECT_URI = encodeURIComponent("http://localhost:8888/auth/google/callback");
const RESPONSE_TYPE = "code";
const SCOPE = encodeURIComponent("openid email profile");

const GoogleLoginButton = () => {
  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

  const handleClick = () => {
    window.location.href = googleLoginUrl;
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-2 px-4 rounded-md bg-white text-black border font-semibold hover:bg-gray-100 transition"
    >
      구글로 로그인
    </button>
  );
};

export default GoogleLoginButton;
