import { Button } from "@/components/ui/button";
import { Globe, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";

const Navigation = () => {
  const { toggleUserList } = useChat();

  return (
    <nav className="w-full px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
  <img
    src="/logo.png"
    alt="문풀 로고"
    className="h-10 w-auto object-contain"
  />
  <span className="text-xl font-bold text-primary hover:text-primary/80 transition-colors leading-none">
    문풀
  </span>
</Link>
        </div>

        {/* Navigation Menu */}
        <div className="hidden md:flex items-center space-x-8">
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
          <Link to="/mentor" className="text-foreground hover:text-primary transition-colors font-medium">
            멘토페이지
          </Link>
          <Link to="/mentte" className="text-foreground hover:text-primary transition-colors font-medium">
            멘티페이지
          </Link>
          <Link to="/chatbot" className="text-foreground hover:text-primary transition-colors font-medium">
            챗봇
          </Link>
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
          
          <Button variant="outline" size="default" asChild>
            <Link to="/auth">로그인</Link>
          </Button>
          <Button variant="default" size="default" asChild>
            <Link to="/auth">회원가입</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
