import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const SuccessPage = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [searchParams] = useSearchParams();
  const payment_key = searchParams.get("paymentKey");
  const order_id = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const plan_type = searchParams.get("planType");

  async function confirmPayment() {
    console.log(payment_key);
    console.log(order_id);
    console.log(amount);
    const response = await fetch("http://localhost:8080/payments/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
    }
  }

  return (
    <div className="wrapper w-100">
      {isConfirmed ? (
        <div
          className="flex-column align-center confirm-success w-100 max-w-540"
          style={{
            display: "flex"
          }}
        >
          <img
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
            width="120"
            height="120"
          />
          <h2 className="title">결제를 완료했어요</h2>
          <div className="response-section w-100">
            <div className="flex justify-between">
              <span className="response-label">결제 금액</span>
              <span id="amount" className="response-text">
                {paymentData?.totalAmount || amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">주문번호</span>
              <span id="orderId" className="response-text">
                {paymentData?.orderId || orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">주문명</span>
              <span className="response-text">
                {paymentData?.orderName || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">결제 방법</span>
              <span className="response-text">
                {paymentData?.method || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">승인 시간</span>
              <span className="response-text">
                {paymentData?.approvedAt || "-"}
              </span>
            </div>
          </div>

          <div className="w-100 button-group">
            <div className="flex" style={{ gap: "16px" }}>
              <a
                className="btn w-100"
                href="https://developers.tosspayments.com/sandbox"
              >
                다시 테스트하기
              </a>
              <a
                className="btn w-100"
                href="https://docs.tosspayments.com/guides/v2/payment-widget/integration"
                target="_blank"
                rel="noopner noreferer"
              >
                결제 연동 문서가기
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-column align-center confirm-loading w-100 max-w-540">
          <div className="flex-column align-center">
            <img
              src="https://static.toss.im/lotties/loading-spot-apng.png"
              width="120"
              height="120"
            />
            <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
            <h4 className="text-center description">결제 승인하고 완료해보세요.</h4>
          </div>
          <div className="w-100">
            <button className="btn primary w-100" onClick={confirmPayment}>
            결제 승인하기
          </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuccessPage;