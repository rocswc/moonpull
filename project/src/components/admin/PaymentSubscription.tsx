import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Users, Search, Calendar, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PaymentSubscription = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const paymentHistory = [
    { id: 1, user: "김민수", amount: "₩29,000", date: "2024-07-20", status: "완료", plan: "프리미엄" },
    { id: 2, user: "이영희", amount: "₩19,000", date: "2024-07-19", status: "완료", plan: "베이직" },
    { id: 3, user: "박준호", amount: "₩29,000", date: "2024-07-18", status: "실패", plan: "프리미엄" },
    { id: 4, user: "최수정", amount: "₩39,000", date: "2024-07-17", status: "완료", plan: "프로" },
    { id: 5, user: "정하림", amount: "₩19,000", date: "2024-07-16", status: "완료", plan: "베이직" },
  ];

  const subscriptionUsers = [
    { id: 1, user: "김민수", plan: "프리미엄", status: "활성", startDate: "2024-01-15", endDate: "2024-08-15" },
    { id: 2, user: "이영희", plan: "베이직", status: "활성", startDate: "2024-02-20", endDate: "2024-08-20" },
    { id: 3, user: "박준호", plan: "프리미엄", status: "만료", startDate: "2024-01-10", endDate: "2024-07-10" },
    { id: 4, user: "최수정", plan: "프로", status: "활성", startDate: "2024-03-01", endDate: "2024-09-01" },
  ];

  const revenueData = [
    { month: "1월", revenue: 1250000 },
    { month: "2월", revenue: 1480000 },
    { month: "3월", revenue: 1620000 },
    { month: "4월", revenue: 1890000 },
    { month: "5월", revenue: 2100000 },
    { month: "6월", revenue: 2350000 },
    { month: "7월", revenue: 2450000 },
  ];

  const planDistribution = [
    { plan: "베이직", count: 45 },
    { plan: "프리미엄", count: 32 },
    { plan: "프로", count: 18 },
    { plan: "무료", count: 156 },
  ];

  const handleUpdateSubscription = (userId: number, newStatus: string) => {
    alert(`사용자 ${userId}의 구독 상태를 ${newStatus}로 변경했습니다.`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-admin rounded-2xl flex items-center justify-center shadow-glow">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">결제 & 구독 관리</h1>
        </div>
        <p className="text-lg text-muted-foreground">결제 현황과 구독 상태를 관리하세요</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-admin-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">월 수익</p>
                <p className="text-2xl font-bold text-foreground">₩2,450,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-admin-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 결제 건수</p>
                <p className="text-2xl font-bold text-foreground">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-admin-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">구독 사용자</p>
                <p className="text-2xl font-bold text-foreground">95</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-warning/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-admin-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전환율</p>
                <p className="text-2xl font-bold text-foreground">7.6%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="shadow-elegant bg-gradient-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-admin-success" />
            월별 수익 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--admin-success))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--admin-success))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4" />
            결제 내역
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" />
            구독 관리
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TrendingUp className="h-4 w-4" />
            플랜 분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>결제 내역</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="사용자 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{payment.user[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{payment.user}</h3>
                        <p className="text-sm text-muted-foreground">{payment.plan} 플랜</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                      <Badge variant={payment.status === "완료" ? "default" : "destructive"}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle>구독 사용자 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.user[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{user.user}</h3>
                        <p className="text-sm text-muted-foreground">{user.plan} 플랜</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">시작: {user.startDate}</p>
                        <p className="text-muted-foreground">종료: {user.endDate}</p>
                      </div>
                      <Badge variant={user.status === "활성" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                      <div className="flex gap-2">
                        {user.status === "활성" && (
                          <Button size="sm" variant="warning" onClick={() => handleUpdateSubscription(user.id, "일시정지")}>
                            일시정지
                          </Button>
                        )}
                        {user.status === "만료" && (
                          <Button size="sm" variant="success" onClick={() => handleUpdateSubscription(user.id, "활성")}>
                            재활성화
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-admin-primary" />
                플랜별 사용자 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={planDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}명`} />
                  <Bar dataKey="count" fill="hsl(var(--admin-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSubscription;