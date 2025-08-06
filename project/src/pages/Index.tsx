import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; //  AuthContext 불러오기

const Index = () => {
  const { isLoggedIn, user } = useAuth(); //  AuthContext 사용

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeatureSection />

    
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
