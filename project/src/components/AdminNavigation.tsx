import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";

const AdminNavigation = () => {
  const { toggleUserList } = useChat();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <nav className="w-full px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold text-foreground">멘토</span>
        </div>

        {/* Navigation Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {isAdminRoute ? (
            <>
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors font-medium">
                관리자 대시보드
              </Link>
              <Link to="/admin/users" className="text-foreground hover:text-primary transition-colors font-medium">
                사용자 관리
              </Link>
              <Link to="/admin/logs" className="text-foreground hover:text-primary transition-colors font-medium">
                로그 모니터링
              </Link>
              <Link to="/admin/system" className="text-foreground hover:text-primary transition-colors font-medium">
                시스템 제어
              </Link>
            </>
          ) : (
            <>
              <Link to="/matching" className="text-foreground hover:text-primary transition-colors font-medium">
                멘토·멘티 매칭
              </Link>
              <Link to="/pricing" className="text-foreground hover:text-primary transition-colors font-medium">
                구독 서비스 안내
              </Link>
              <Link to="/wrong-note" className="text-foreground hover:text-primary transition-colors font-medium">
                오답노트
              </Link> 
              <Link to="/quiz" className="text-foreground hover:text-primary transition-colors font-medium">
                퀴즈
              </Link>
              <Link to="/mypage" className="text-foreground hover:text-primary transition-colors font-medium">
                마이페이지
              </Link>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm">한국어</span>
          </button>
          
          {/* Chat Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleUserList}
            className="gap-2"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">채팅</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;