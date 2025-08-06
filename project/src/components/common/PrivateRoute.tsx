import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

// 1. LoginRequiredModal.tsx
//로그인 유도 모달 컴포넌트
//로그인하지 않은 사용자가 보호된 페이지에 접근했을 때,
//"로그인이 필요합니다" 메시지를 띄우고
//취소 또는 로그인 하러 가기 버튼 제공



const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, bootstrapped } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log(" user: ", user);
    console.log(" user.role: ", user?.role);
  }, [user]);

  useEffect(() => {
    if (bootstrapped && !isLoggedIn) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isLoggedIn, bootstrapped]);

  if (!bootstrapped) return null;

  if (!isLoggedIn) {
    // 모달이 떠 있는 동안 페이지 렌더링하지 않음
    return (
      <>
        {showModal && (
          <LoginRequiredModal
            onClose={() => {
              setShowModal(false);
              navigate("/"); // 취소하면 홈으로 이동
            }}
            onGoToLogin={() =>
              navigate(`/auth/login?redirect=${location.pathname}`)
            }
          />
        )}
      </>
    );
  }

  return children;
};

export default PrivateRoute;
