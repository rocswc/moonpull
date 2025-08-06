import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isSubscription, setIsSubscription] = useState(false);
  
  // URL 파라미터를 직접 파싱 (예시용)
  const urlParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const payment_key = urlParams.get("paymentKey");
  const order_id = urlParams.get("orderId");
  const amount = urlParams.get("amount");
  const plan_type = urlParams.get("planName");
  const customerKey = urlParams.get("customerKey");
  const authKey = urlParams.get("authKey");

  async function subscriptionPayment() {
    console.log(customerKey);
    console.log(authKey);
   
    const response = await fetch("http://localhost:8080/payments/create_billing_key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include', 
      body: JSON.stringify({
        customerKey,
        authKey,
        amount,
        plan_type
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setPaymentData(data);
      setIsConfirmed(true);
      setIsSubscription(true); // 구독결제 플래그 설정
    }
  }

  async function confirmPayment() {
    console.log(payment_key);
    console.log(order_id);
    console.log(amount);
    const response = await fetch("http://localhost:8080/payments/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify({
        payment_key,
        order_id,
        amount,
        plan_type
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setPaymentData(data);
      setIsConfirmed(true);
      setIsSubscription(false); // 일시불 결제
    }
  }

  // 구독 시작일과 다음 결제일 계산 (예시)
  const getSubscriptionDates = () => {
    const today = new Date();
    const nextBilling = new Date(today);
    nextBilling.setMonth(today.getMonth() + 1);
    
    return {
      startDate: today.toLocaleDateString('ko-KR'),
      nextBillingDate: nextBilling.toLocaleDateString('ko-KR')
    };
  };

  const { startDate, nextBillingDate } = getSubscriptionDates();

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full">
        {isConfirmed ? (
          <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
            <div className="w-24 h-24 mb-6">
              <img
                src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
                alt="성공"
                className="w-full h-full"
              />
            </div>
            
            {isSubscription ? (
              // 구독결제 성공 화면
              <>
                <h2 className="text-2xl font-bold text-center mb-2">
                  구독이 시작되었어요! 🎉
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {plan_type} 구독을 이용하실 수 있습니다.
                </p>
                
                <div className="w-full space-y-3 mb-6">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">구독 플랜</span>
                    <span className="font-medium">{plan_type || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">구독 시작일</span>
                    <span className="font-medium">{startDate}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">다음 결제일</span>
                    <span className="font-medium text-blue-600">{nextBillingDate}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">월 결제 금액</span>
                    <span className="font-medium">{amount}원</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">결제 수단</span>
                    <span className="font-medium text-sm">
                      {paymentData?.cardCompany} {paymentData?.method}
                      <br />
                      ({paymentData?.cardNumber})
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">구독 상태</span>
                    <span className="font-medium text-green-600">
                      활성화됨
                    </span>
                  </div>
                  {paymentData?.billingKey && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">자동결제 등록</span>
                      <span className="font-medium text-green-600">
                        등록 완료
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 w-full">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-2">💡 안내사항</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 구독은 언제든지 해지하실 수 있습니다</li>
                      <li>• 다음 결제일 하루 전까지 해지 시 추가 요금이 발생하지 않습니다</li>
                      <li>• 결제 실패 시 이메일로 안내드립니다</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md border border-blue-600"
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    서비스 시작하기
                  </button>
                  <button 
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-md border border-gray-300"
                    onClick={() => window.location.href = "/subscription/manage"}
                  >
                    구독 관리
                  </button>
                </div>
              </>
            ) : (
              // 일시불 결제 성공 화면 (기존)
              <>
                <h2 className="text-2xl font-bold text-center mb-6">결제를 완료했어요</h2>
                <div className="w-full space-y-3 mb-6">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-medium">
                      {paymentData?.totalAmount || amount}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-medium">
                      {paymentData?.orderId || order_id}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">주문명</span>
                    <span className="font-medium">
                      {paymentData?.orderName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">결제 방법</span>
                    <span className="font-medium">
                      {paymentData?.method || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">승인 시간</span>
                    <span className="font-medium">
                      {paymentData?.approvedAt || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    className="flex-1 bg-blue-600 text-black py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md border border-blue-600"
                    onClick={() => navigate("/")}
                  >
                    다시 테스트하기
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
            <div className="w-24 h-24 mb-6">
              <img
                src="https://static.toss.im/lotties/loading-spot-apng.png"
                alt="로딩"
                className="w-full h-full"
              />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">결제 요청까지 성공했어요.</h2>
            <h4 className="text-center text-gray-600 mb-6">결제 승인하고 완료해보세요.</h4>
            
            <div className="w-full space-y-4">
              {/* 일시불 결제 파라미터가 있는 경우 */}
              {(payment_key && order_id) && (
                <button 
                  className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg border-2 transform hover:scale-105"
                  onClick={confirmPayment}
                  style={{ 
                    color: '#ffffff', 
                    backgroundColor: '#1e40af',
                    borderColor: '#1e3a8a'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1e3a8a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1e40af';
                  }}
                >
                  💳 일시불 결제 승인
                </button>
              )}
              
              {/* 구독 결제 파라미터가 있는 경우 */}
              {(customerKey && authKey) && (
                <button 
                  className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg border-2 transform hover:scale-105"
                  onClick={subscriptionPayment}
                  style={{ 
                    color: '#ffffff', 
                    backgroundColor: '#059669',
                    borderColor: '#047857'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#047857';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#059669';
                  }}
                >
                  🔄 구독 결제 승인
                </button>
              )}
              
              {/* 둘 다 없는 경우 또는 테스트용 */}
              {(!payment_key && !customerKey) && (
                <div className="text-center text-gray-500 bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  ⚠️ 결제 정보가 없습니다. URL 파라미터를 확인해주세요.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuccessPage;