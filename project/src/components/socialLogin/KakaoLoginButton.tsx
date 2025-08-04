const KAKAO_CLIENT_ID = "YOUR_KAKAO_REST_API_KEY";
const REDIRECT_URI = encodeURIComponent("http://localhost:8888/auth/kakao/callback");

const KakaoLoginButton = () => {
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

  const handleClick = () => {
    window.location.href = kakaoLoginUrl;
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
