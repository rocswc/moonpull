import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

const Navigation = () => {
  const { toggleUserList } = useChat();
  const { isLoggedIn, user, logout, bootstrapped } = useAuth();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleNavigation = (path: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate(path);
  };

  // 언어 변경 핸들러
  const handleLanguageChange = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  if (!bootstrapped) return null;

  return (
    <nav className="w-full px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-screen-2xl w-full px-6 mx-auto flex items-center justify-between">
        {/* 왼쪽: 로고 + 메뉴 */}
        <div className="flex items-center space-x-12">
          <button onClick={() => navigate("/")} className="flex items-center space-x-2 cursor-pointer">
            <img src="/logo.png" alt="문풀 로고" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-primary hover:text-primary/80 transition-colors leading-none">
              문풀
            </span>
          </button>

          <div className="hidden md:flex items-center space-x-8 whitespace-nowrap">
<<<<<<< HEAD
            <button onClick={() => handleNavigation("/matching")} className="text-foreground hover:text-primary transition-colors font-medium">멘토·멘티 매칭</button>
            <button onClick={() => handleNavigation("/pricing")} className="text-foreground hover:text-primary transition-colors font-medium">구독 서비스 안내</button>
            <button onClick={() => handleNavigation("/wrong-note")} className="text-foreground hover:text-primary transition-colors font-medium">오답노트</button>
            <button onClick={() => handleNavigation("/quiz")} className="text-foreground hover:text-primary transition-colors font-medium">퀴즈</button>

            {user?.role?.includes("MENTOR") && !user?.role?.includes("ADMIN") && (
              <button onClick={() => handleNavigation("/mentor")} className="text-foreground hover:text-primary transition-colors font-medium">멘토페이지</button>
=======
            <button
              onClick={() => handleNavigation("/matching")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("mentorMatching", "navigation")}
            </button>
            <button
              onClick={() => handleNavigation("/pricing")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("subscription", "navigation")}
            </button>
            <button
              onClick={() => handleNavigation("/wrong-note")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("wrongNote", "navigation")}
            </button>
            <button
              onClick={() => handleNavigation("/quiz")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("quiz", "navigation")}
            </button>

            {user?.role?.includes("MENTOR") && !user?.role?.includes("ADMIN") && (
              <button
                onClick={() => handleNavigation("/mentor")}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {t("mentorPage", "navigation")}
              </button>
>>>>>>> 2559a9f (gyu)
            )}
            {user?.role?.includes("MENTEE") && !user?.role?.includes("ADMIN") && (
<<<<<<< HEAD
              <button onClick={() => handleNavigation("/mentte")} className="text-foreground hover:text-primary transition-colors font-medium">멘티페이지</button>
            )}

            <button onClick={() => handleNavigation("/chatbot")} className="text-foreground hover:text-primary transition-colors font-medium">챗봇</button>
            <button onClick={() => handleNavigation("/mypage")} className="text-foreground hover:text-primary transition-colors font-medium">마이페이지</button>
            <button onClick={() => handleNavigation("/problemGeneratorApp")} className="text-foreground hover:text-primary transition-colors font-medium">문제생성기</button>
            <button onClick={() => handleNavigation("/opictest")} className="text-foreground hover:text-primary transition-colors font-medium">오픽테스트</button>
=======
              <button
                onClick={() => handleNavigation("/mentte")}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {t("menteePage", "navigation")}
              </button>
            )}

            <button
              onClick={() => handleNavigation("/chatbot")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("chatbot", "navigation")}
            </button>
            <button
              onClick={() => handleNavigation("/mypage")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("myPage", "navigation")}
            </button>
>>>>>>> 2559a9f (gyu)
          </div>
        </div>

        {/* 오른쪽: 언어 + 채팅 + 유저 상태 */}
        <div className="flex items-center space-x-4 ml-auto">
<<<<<<< HEAD
		<Button
		  variant="ghost"
		  size="sm"
		  className="h-10 px-3 flex items-center gap-1 text-base text-muted-foreground hover:text-foreground"
		>
		  <Globe className="w-4 h-4" />
		  <span>한국어</span>
		</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginModal(true);
                return;
              }
              toggleUserList();
            }}
            className="gap-2"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">채팅</span>
          </Button>

          {isLoggedIn && user?.nickname ? (
            <>
			<div className="h-10 flex items-center px-3 text-base font-medium text-foreground whitespace-nowrap">
			  {user.nickname} 님 환영합니다{" "}
			  <span className="text-primary font-bold ml-1">
			    {user.role?.includes("ADMIN")
			      ? "관리자"
			      : user.role?.includes("MENTOR")
			      ? "멘토"
			      : "멘티"}
			  </span>
			</div>
              <Button variant="default" size="default" onClick={handleLogout}>로그아웃</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="default" asChild>
                <Link to="/auth/login">로그인</Link>
              </Button>
=======
          <button 
            onClick={handleLanguageChange}
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">{language === 'ko' ? '한국어' : 'English'}</span>
          </button>
		  
		  
		  <button
		              onClick={() => handleNavigation("/problemGeneratorApp")}
		              className="text-foreground hover:text-primary transition-colors font-medium"
		            >
		              {t("problemGenerator", "navigation")}
					 
		            </button>
		  <button
		              onClick={() => handleNavigation("/opictest")}
		              className="text-foreground hover:text-primary transition-colors font-medium"
		            >
		              {t("opicTest", "navigation")}
					 
		            </button>

		  <Button
		    variant="ghost"
		    size="sm"
		    onClick={() => {
		      if (!isLoggedIn) {
		        setShowLoginModal(true);  // 로그인 안 되어 있으면 모달 띄움
		        return;                   // 채팅 토글은 실행하지 않음
		      }
		      toggleUserList();            // 로그인 되어 있으면 채팅 토글 실행
		    }}
		    className="gap-2"
		  >
		    <Menu className="w-4 h-4" />
		    <span className="hidden sm:inline">{t("chat", "navigation")}</span>
		  </Button>

          {isLoggedIn && user?.nickname ? (
            <>
              <div className="text-sm font-medium text-foreground font-sans whitespace-nowrap">
                {user.nickname} {t("welcome", "navigation")}{" "}
                <span className="text-primary font-bold">
                  {user.role?.includes("ADMIN")
                    ? t("admin", "navigation")
                    : user.role?.includes("MENTOR")
                    ? t("mentor", "navigation")
                    : t("mentee", "navigation")}
                </span>
              </div>
              <Button variant="default" size="default" onClick={handleLogout}>
                {t("logout", "navigation")}
              </Button>
            </>
          ) : (
            <>
			<Button variant="outline" size="default" asChild>
			  <Link to="/auth/login">{t("login", "navigation")}</Link>
			</Button>
>>>>>>> 2559a9f (gyu)
              <Button variant="default" size="default" asChild>
                <Link to="/auth/signup">{t("signup", "navigation")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onGoToLogin={() => {
            setShowLoginModal(false);
            navigate("/auth/login");
          }}
        />
      )}
    </nav>
  );
};

export default Navigation;
