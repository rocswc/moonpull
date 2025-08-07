import React from "react";

const GoogleLoginButton = () => {
  const handleClick = () => {
    // 백엔드에서 리디렉션 처리하도록 요청
    window.location.href = "http://localhost:8080/auth/google/login";
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
