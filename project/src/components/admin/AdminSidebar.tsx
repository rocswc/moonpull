import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Activity,
  CreditCard,
  BookOpen,
  Settings,
  Shield,
  BarChart3,
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminSidebar = ({ activeSection, setActiveSection }: AdminSidebarProps) => {
  const menuItems = [
    { id: "overview", label: "대시보드 개요", icon: BarChart3 },
    { id: "users", label: "사용자 관리", icon: Users },
    { id: "logs", label: "로그 모니터링", icon: Activity },
    { id: "payments", label: "결제/구독 관리", icon: CreditCard },
    { id: "content", label: "콘텐츠 관리", icon: BookOpen },
    { id: "anomaly", label: "이상 탐지", icon: Shield },
  ];

  return (
    <Card className="w-64 bg-background/80 backdrop-blur-sm shadow-elegant border border-border/50">
      <CardContent className="p-6 space-y-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-admin rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">관리자 패널</h2>
          <p className="text-sm text-muted-foreground">시스템 관리 도구</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "admin" : "ghost"}
                className="justify-start w-full gap-3 h-11 transition-smooth"
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default AdminSidebar;