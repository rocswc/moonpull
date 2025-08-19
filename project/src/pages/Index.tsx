import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeatureSection />

      {/* ✅ ROLE_ADMIN 권한일 때만 관리자 대시보드 버튼 출력 */}
      {isLoggedIn && user?.role === "ADMIN" && (
        <div className="flex justify-center mt-8">
          <Button variant="admin" size="lg" asChild>
            <Link to="/admin" className="gap-2 flex items-center">
              <Shield className="w-5 h-5" />
              관리자 대시보드
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
