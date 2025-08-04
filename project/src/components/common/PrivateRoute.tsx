import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, bootstrapped } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

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
