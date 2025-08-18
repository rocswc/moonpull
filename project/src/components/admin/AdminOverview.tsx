import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, DollarSign, BookOpen, AlertTriangle } from "lucide-react";

const AdminOverview = () => {
  const [userCount, setUserCount] = useState("로딩 중...");
  const [inactiveUserCount, setInactiveUserCount] = useState("로딩 중...");
  const [totalPaymentAmount, setTotalPaymentAmount] = useState("로딩 중...");
  const [totalQuestions, setTotalQuestions] = useState("로딩 중...");	
  useEffect(() => {
    axios.get("/api/admin/stats")
      .then((res) => {
        setUserCount(res.data.userCount.toString());
		setInactiveUserCount(res.data.inactiveUserCount.toString());
      })
      .catch((err) => {
        console.error("총 사용자 수 불러오기 실패", err);
        setUserCount("에러");
      });
	  
	  axios.get("/api/admin/payments/total-amount")
	  .then((res) => {
	     const amount = typeof res.data === "number" ? res.data : 0;
	    setTotalPaymentAmount(amount.toLocaleString('ko-KR') + " 원");
	  })
	    .catch((err) => {
	      console.error("총 결제액 불러오기 실패", err);
	      setTotalPaymentAmount("에러");
	    });
		
		axios.get("https://localhost:5001/api/admin/total-questions")
		   .then((res) => {
		     setTotalQuestions(res.data.total_questions.toLocaleString('ko-KR'));
		   })
		   .catch((err) => {
		     console.error("총 문제 수 불러오기 실패", err);
		     setTotalQuestions("에러");
		   });
		
  }, []);

  const stats = [
    { title: "총 사용자 수", value: userCount, icon: Users, color: "text-admin-primary" }, // ✅ change 제거
    { title: "현재 온라인 사용자 수", value: "89", change: "+5%", icon: Activity, color: "text-admin-secondary" },
    { title: "장기간 미로그인 사용자", value: inactiveUserCount, icon: Users, color: "text-admin-success" },
    { title: "월 수익", value: totalPaymentAmount, icon: DollarSign, color: "text-admin-success" }, 
     { title: "총 문제 수", value: totalQuestions, icon: BookOpen, color: "text-admin-warning" },
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

                    {/* ✅ change가 있을 때만 Badge 렌더링 */}
                    {stat.change && (
                      <Badge variant="secondary" className="mt-2">
                        {stat.change}
                      </Badge>
                    )}
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
    </div>
  );
};

export default AdminOverview;
