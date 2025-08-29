// NaverLoginButton.tsx
import React from "react";

const NaverLoginButton = () => {
  const handleClick = () => {
    // 프론트는 단순히 백엔드 시작 URL로 이동
    window.location.href = "https://34.64.151.197:443/auth/naver/login";
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
