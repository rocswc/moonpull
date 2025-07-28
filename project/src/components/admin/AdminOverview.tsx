import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, DollarSign, BookOpen, AlertTriangle, Zap } from "lucide-react";

const AdminOverview = () => {
  const stats = [
    { title: "총 사용자 수", value: "1,247", change: "+12%", icon: Users, color: "text-admin-primary" },
    { title: "현재 온라인 사용자 수", value: "89", change: "+5%", icon: Activity, color: "text-admin-secondary" },
     { title: "장기간 미로그인 사용자", value: "43", change: "-3.4%", icon: Users, color: "text-admin-success" },
    { title: "월 수익", value: "₩2,450,000", change: "+18%", icon: DollarSign, color: "text-admin-success" },
    { title: "총 문제 수", value: "3,456", change: "+24", icon: BookOpen, color: "text-admin-warning" },
    { title: "이상 탐지", value: "3", change: "-2", icon: AlertTriangle, color: "text-admin-danger" },
   
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">관리자 대시보드</h1>
        <p className="text-lg text-muted-foreground">시스템 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-card bg-gradient-card border border-border/50 hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <Badge variant="secondary" className="mt-2">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-elegant bg-gradient-card border border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-colors cursor-pointer">
            <Users className="w-8 h-8 text-admin-primary mb-2" />
            <h3 className="font-medium text-foreground">사용자 관리</h3>
            <p className="text-sm text-muted-foreground">계정 및 권한 관리</p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-colors cursor-pointer">
            <DollarSign className="w-8 h-8 text-admin-success mb-2" />
            <h3 className="font-medium text-foreground">결제 관리</h3>
            <p className="text-sm text-muted-foreground">구독 및 결제 현황</p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-colors cursor-pointer">
            <BookOpen className="w-8 h-8 text-admin-warning mb-2" />
            <h3 className="font-medium text-foreground">콘텐츠 관리</h3>
            <p className="text-sm text-muted-foreground">문제 및 카테고리 관리</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;