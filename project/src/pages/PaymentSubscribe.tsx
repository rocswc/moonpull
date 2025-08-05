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
      } catch (error) {
        console.error("Error fetching payment:", error);
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

  // ------ '카드 등록하기' 버튼 누르면 결제창 띄우기 ------
  // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
  async function requestBillingAuth() {
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.


    await payment.requestBillingAuth({
      method: "CARD", // 자동결제(빌링)는 카드만 지원합니다
      successUrl: createSuccessUrl(), // 요청이 성공하면 리다이렉트되는 URL
      failUrl: window.location.origin + "/payment/fail", // 요청이 실패하면 리다이렉트되는 URL
      customerEmail: "kkjspdlqj@naver.com",
      customerName: "김갑중",
    });
  }

  return (
    // 카드 등록하기 버튼
    <button className="button" onClick={() => requestBillingAuth()}>
      카드 등록하기
    </button>
  );
}

export default PaymentCheckoutPage;