import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

const SubscriptionStatus = () => {
  const [subscriptionData, setSubscriptionData] = useState({
    subscriptionType: "월간 프리미엄",
    paymentDate: "2025-07-01",
    nextPaymentDate: "2025-08-01",
    isActive: true
  });

  const handleCancelSubscription = () => {
    setSubscriptionData({ ...subscriptionData, isActive: false });
    alert("구독이 취소되었습니다.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="flex max-w-7xl mx-auto px-6 py-10 gap-8 min-h-[900px]">
        <aside className="w-64 bg-white dark:bg-background rounded-2xl shadow p-6 space-y-4 min-h-full">
          <h2 className="text-xl font-bold mb-4">마이페이지</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/profileEdit">
                          <Button variant="outline" className="justify-start w-full">정보 수정</Button>
                        </Link>
            
            <Link to="/subscription">
              <Button variant="outline" className="justify-start w-full">구독 현황</Button>
            </Link>
            <Link to="/mypage">
              <Button variant="outline" className="justify-start w-full">학습 현황</Button>
            </Link>
            <Link to="/mentorReview">
              <Button variant="outline" className="justify-start w-full">멘토 평가하기</Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-2xl space-y-10 text-center bg-white dark:bg-background rounded-2xl shadow p-10">
            <h1 className="text-3xl font-bold text-foreground">구독 현황</h1>
            <p className="text-muted-foreground">현재 구독 정보를 확인할 수 있어요.</p>

            <div className="space-y-4 text-left">
              <p><strong>선택한 구독:</strong> {subscriptionData.subscriptionType}</p>
              <p><strong>결제일:</strong> {subscriptionData.paymentDate}</p>
              <p><strong>다음 결제 예정일:</strong> {subscriptionData.nextPaymentDate}</p>
              <p><strong>구독 상태:</strong> {subscriptionData.isActive ? "활성" : "취소됨"}</p>
            </div>

            {subscriptionData.isActive && (
              <div className="flex justify-center">
                <Button onClick={handleCancelSubscription} className="mt-4">구독 취소</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
