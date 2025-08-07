import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Users, TrendingUp, BarChart as BarChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

dayjs.extend(utc);
dayjs.extend(timezone);

const PaymentSubscription = () => {
  const [totalPaymentAmount, setTotalPaymentAmount] = useState("로딩 중...");
  const [totalPaymentCount, setTotalPaymentCount] = useState("로딩 중...");
  const [subscribedUserCount, setSubscribedUserCount] = useState("로딩 중...");
  const [conversionRate, setConversionRate] = useState("로딩 중...");
  const [revenueData, setRevenueData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);

  const handleCancel = async (subscribeId: number, memberId: number) => {
    try {
      const confirmCancel = window.confirm("정말로 이 사용자의 결제를 취소하시겠습니까?");
      if (!confirmCancel) return;

      await axios.post(
        `/api/admin/subscription/cancel-direct`,
        { subscribeId, memberId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("구독 및 결제 취소 완료");

      const updated = await axios.get("/api/admin/payments/recent");
      setRecentPayments(updated.data);
    } catch (err: any) {
      console.error("❌ 취소 실패:", err);
      alert("취소 실패: " + (err?.response?.data || "서버 오류"));
    }
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
          res.data.map((item: any) => ({
            date: item.pay_date,
            revenue: item.daily_revenue,
          }))
        );
      })
      .catch(() => console.error("일별 수익 불러오기 실패"));

    axios.get("/api/admin/payments/recent")
      .then((res) => {
        setRecentPayments(res.data);
      })
      .catch((err) => {
        console.error("최근 결제자 목록 불러오기 실패", err);
      });

	  axios.get("/api/admin/subscriptions/plan-distribution", {
	    headers: {
	      Authorization: `Bearer ${localStorage.getItem("token")}`
	    },
	    withCredentials: true
	  })
	    .then((res) => {
	      setPlanDistribution(res.data);
	    })
	    .catch((err) => {
	      console.error("플랜별 사용자 분포 불러오기 실패", err);
	    });
  }, []);

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <DollarSign className="text-admin-success w-6 h-6" />
            <div>
              <p className="text-sm text-muted-foreground">월 수익</p>
              <p className="text-2xl font-bold">{totalPaymentAmount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <CreditCard className="text-admin-primary w-6 h-6" />
            <div>
              <p className="text-sm text-muted-foreground">총 결제 건수</p>
              <p className="text-2xl font-bold">{totalPaymentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <Users className="text-admin-secondary w-6 h-6" />
            <div>
              <p className="text-sm text-muted-foreground">구독 사용자</p>
              <p className="text-2xl font-bold">{subscribedUserCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <TrendingUp className="text-admin-warning w-6 h-6" />
            <div>
              <p className="text-sm text-muted-foreground">전환율</p>
              <p className="text-2xl font-bold">{conversionRate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 일별 수익 / 플랜 분포 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-admin-primary" />
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
      </div>

      {/* 최근 결제 사용자 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-admin-primary" />
            최근 결제 사용자
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-muted-foreground text-center">📭 결제한 사용자가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((user: any, index: number) => (
                <div key={user.login_id || index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-admin-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-admin-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{user.name} ({user.login_id})</h3>
                      <p className="text-sm text-muted-foreground">📞 {user.phone_number}</p>
                      <p className="text-sm text-muted-foreground">📧 {user.email}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1 text-sm text-muted-foreground">
                    <p>💳 금액: ₩{Number(user.amount).toLocaleString()}</p>
                    <p>🕓 결제일시: {dayjs(user.paid_at).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm")}</p>
                    <p>📦 구독 타입: {user.plan_type ?? "없음"}</p>
                    <p>📅 시작일: {user.started_at ? dayjs(user.started_at).format("YYYY-MM-DD") : "-"}</p>
                    <p>📅 종료일: {user.expires_at ? dayjs(user.expires_at).format("YYYY-MM-DD") : "-"}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(user.subscribe_id, user.member_id)}
                    >
                      결제 취소
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSubscription;
