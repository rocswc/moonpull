import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // ✅ AuthContext 사용

const Index = () => {
  const { user, isLoggedIn } = useAuth(); // ✅ 로그인 정보 가져오기

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeatureSection />

      {/* ✅ ROLE_ADMIN 권한일 때만 버튼 보이기 */}
      {isLoggedIn && user?.role === "ROLE_ADMIN" && (
        <Button variant="admin" size="lg" asChild>
          <Link to="/admin" className="gap-2">
            <Shield className="w-5 h-5" />
            관리자 대시보드
          </Link>
        </Button>
      )}
    </div>
  );
};

export default Index;
