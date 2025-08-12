import React from "react";

const KakaoLoginButton = () => {
  const handleClick = () => {
    window.location.href = "https://localhost:8080/auth/kakao/login";  // 백엔드 로그인 시작 URL
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-2 px-4 rounded-md bg-yellow-300 text-black font-semibold hover:bg-yellow-400 transition"
    >
      카카오로 로그인
    </button>
  );
};

export default KakaoLoginButton;
