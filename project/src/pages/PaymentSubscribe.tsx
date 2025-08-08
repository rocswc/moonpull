import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

// ------  SDK 초기화 ------
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const customerKey = "toveCXEwa_CJS_pE8w0tQ";

const PaymentCheckoutPage = () => {
  const location = useLocation();
  const [payment, setPayment] = useState(null);
  const [searchParams] = useSearchParams();
  const [planName, setPlanName] = useState(location.state?.planName);
  const [amount, setAmount] = useState(location.state?.amount || 0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
        const payment = tossPayments.payment({
          customerKey,
        });
        // 비회원 결제
        // const payment = tossPayments.payment({ customerKey: ANONYMOUS });
        setPayment(payment);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching payment:", error);
        setIsLoading(false);
      }
    }
    fetchPayment();
  }, [clientKey, customerKey]);

  // URLSearchParams로 파라미터 구성
  const createSuccessUrl = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('planName', planName);
    params.set('amount', amount.toString());
    return `${window.location.origin}/payment/success?${params.toString()}`;
  };

  // ------ 페이지 로드 시 자동으로 카드 등록창 띄우기 ------
  // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
  async function requestBillingAuth() {
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.

    try {
      await payment.requestBillingAuth({
        method: "CARD", // 자동결제(빌링)는 카드만 지원합니다
        successUrl: createSuccessUrl(), // 요청이 성공하면 리다이렉트되는 URL
        failUrl: window.location.origin + "/payment/fail", // 요청이 실패하면 리다이렉트되는 URL
        customerEmail: "kkjspdlqj@naver.com",
        customerName: "김갑중",
      });
    } catch (error) {
      console.error("Error requesting billing auth:", error);
    }
  }

  // payment 객체가 준비되면 자동으로 카드 등록창 띄우기
  useEffect(() => {
    if (payment && !isLoading) {
      requestBillingAuth();
    }
  }, [payment, isLoading]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '20px'
    }}>
      {isLoading ? (
        <div>
          <p>결제 시스템을 준비하고 있습니다...</p>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite',
            margin: '20px auto'
          }}></div>
        </div>
      ) : (
        <div>
          <p>카드 등록창을 여는 중입니다...</p>
          <p>팝업이 차단되었다면 허용해주세요.</p>
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default PaymentCheckoutPage;