import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Users, Search, TrendingUp, BarChart } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PaymentSubscription = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPaymentAmount, setTotalPaymentAmount] = useState("로딩 중...");
  const [totalPaymentCount, setTotalPaymentCount] = useState("로딩 중...");
  const [subscribedUserCount, setSubscribedUserCount] = useState("로딩 중...");
  const [conversionRate, setConversionRate] = useState("로딩 중...");
  const [revenueData, setRevenueData] = useState([]);

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

  const planDistribution = [
    { plan: "베이직", count: 45 },
    { plan: "프리미엄", count: 32 },
    { plan: "프로", count: 18 },
    { plan: "무료", count: 156 },
  ];

  const handleUpdateSubscription = (userId: number, newStatus: string) => {
    alert(`사용자 ${userId}의 구독 상태를 ${newStatus}로 변경했습니다.`);
  };

  useEffect(() => {
    axios.get("/api/admin/payments/total-amount")
      .then((res) => {
        const amount = typeof res.data === "number" ? res.data : 0;
        setTotalPaymentAmount(amount.toLocaleString("ko-KR") + " 원");
      })
      .catch(() => setTotalPaymentAmount("에러"));

    axios.get("/api/admin/payments/total-count")
      .then((res) => {
        setTotalPaymentCount(res.data.toLocaleString("ko-KR") + " 건");
      })
      .catch(() => setTotalPaymentCount("에러"));

    axios.get("/api/admin/subscriptions/count")
      .then((res) => {
        setSubscribedUserCount(res.data.toLocaleString("ko-KR") + " 명");
      })
      .catch(() => setSubscribedUserCount("에러"));

    axios.get("/api/admin/subscriptions/conversion-rate")
      .then((res) => {
        const rate = typeof res.data === "number" ? res.data.toFixed(1) + "%" : "0%";
        setConversionRate(rate);
      })
      .catch(() => setConversionRate("에러"));

    axios.get("/api/admin/payments/daily-revenue")
      .then((res) => {
        setRevenueData(
          res.data.map((item) => ({
            date: item.pay_date,
            revenue: item.daily_revenue,
          }))
        );
      })
      .catch(() => console.error("일별 수익 불러오기 실패"));
  }, []);

  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6 flex items-center gap-3">
          <DollarSign className="text-admin-success w-6 h-6" />
          <div>
            <p className="text-sm text-muted-foreground">월 수익</p>
            <p className="text-2xl font-bold">{totalPaymentAmount}</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 flex items-center gap-3">
          <CreditCard className="text-admin-primary w-6 h-6" />
          <div>
            <p className="text-sm text-muted-foreground">총 결제 건수</p>
            <p className="text-2xl font-bold">{totalPaymentCount}</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 flex items-center gap-3">
          <Users className="text-admin-secondary w-6 h-6" />
          <div>
            <p className="text-sm text-muted-foreground">구독 사용자</p>
            <p className="text-2xl font-bold">{subscribedUserCount}</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 flex items-center gap-3">
          <TrendingUp className="text-admin-warning w-6 h-6" />
          <div>
            <p className="text-sm text-muted-foreground">전환율</p>
            <p className="text-2xl font-bold">{conversionRate}</p>
          </div>
        </CardContent></Card>
      </div>

      {/* ✅ 일별 수익 추이 그래프 */}
      <Card className="shadow-elegant bg-gradient-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-admin-success" />
            일별 수익 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => `₩${(v / 1000).toLocaleString()}K`} />
              <Tooltip formatter={(v: number) => `₩${v.toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--admin-success))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--admin-success))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 아래 탭은 그대로 유지 */}
      {/* ... 결제 내역, 구독 관리, 분석 탭은 기존 그대로 사용 가능 ... */}
    </div>
  );
};

export default PaymentSubscription;
