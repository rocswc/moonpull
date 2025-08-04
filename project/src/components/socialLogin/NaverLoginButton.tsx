import React from "react";

const NAVER_CLIENT_ID = "네이버_클라이언트_ID";
const REDIRECT_URI = encodeURIComponent("http://localhost:8888/auth/naver/callback"); // 네이버 개발자센터 등록한 주소
const STATE = "랜덤한문자열";

const NaverLoginButton = () => {
  const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;

  const handleClick = () => {
    window.location.href = naverLoginUrl;
  };

  return (
	<button
	  onClick={handleClick}
	  className="w-full py-2 px-4 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition"
	>
	  네이버로 로그인
	</button>
  );
};

export default NaverLoginButton;
