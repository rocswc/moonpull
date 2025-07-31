package com.example.dto;
import java.util.Date;
import lombok.Data;

@Data
public class PaymentDTO {
	private Integer payment_id;
	private Integer member_id; //사용자 고유 ID
	private String order_id; //주문번호(각 주문을 식별하는 역할)
    private String order_name; //구매상품(예시:생수 외 1건 등)
    private String name;
    private String email;
    private String payment_method; //결제수단(카드,가상계좌,간편결제,휴대폰,계좌이체 중 하나의 값을 가져옴)
    private Integer amount; //결제금액
    private String payment_key; //결제의 키값, 결제를 식별하는 역할로,중복되지 않는 고유한 값
    private Date paid_at; //결제시각
    
    //결제 처리 상태
    /*
    -READY: 결제를 생성하면 가지게 되는 초기 상태입니다. 인증 전까지는 READY 상태를 유지합니다.
    -IN_PROGRESS: 결제수단 정보와 해당 결제수단의 소유자가 맞는지 인증을 마친 상태입니다. 결제 승인 API를 호출하면 결제가 완료됩니다.
    -WAITING_FOR_DEPOSIT: 가상계좌 결제 흐름에만 있는 상태입니다. 발급된 가상계좌에 구매자가 아직 입금하지 않은 상태입니다.
    -DONE: 인증된 결제수단으로 요청한 결제가 승인된 상태입니다.
    -CANCELED: 승인된 결제가 취소된 상태입니다.
    -PARTIAL_CANCELED: 승인된 결제가 부분 취소된 상태입니다.
    -ABORTED: 결제 승인이 실패한 상태입니다.
    -EXPIRED: 결제 유효 시간 30분이 지나 거래가 취소된 상태입니다. IN_PROGRESS 상태에서 결제 승인 API를 호출하지 않으면 EXPIRED가 됩니다.
	 */
    private String payment_status; 
}


/* payment 객체 예시
 
{
mId=tgen_docs, 
lastTransactionKey=txrd_a01k1d4fww2yczsxqxvdphk45pr, 
paymentKey=tgen_202507301640576F2r5, 
orderId=MC4wODI5MjE2NDk3MjA1, 
orderName=토스 티셔츠 외 2건, 
taxExemptionAmount=0, 
status=DONE, 
requestedAt=2025-07-30T16:40:57+09:00, 
approvedAt=2025-07-30T16:42:01+09:00, 
useEscrow=false, 
cultureExpense=false, 
card=null, 
virtualAccount=null, 
transfer=null, 
mobilePhone=null, 
giftCertificate=null, 
cashReceipt=null, 
cashReceipts=null, 
discount=null, 
cancels=null, 
secret=ps_oEjb0gm23Pd4667zaaqW3pGwBJn5, 
type=NORMAL, 
easyPay={provider=카카오페이, amount=12500, discountAmount=0}, 
country=KR, failure=null, 
isPartialCancelable=true, 
receipt={url=https://dashboard.tosspayments.com/receipt/redirection?transactionId=tgen_202507301640576F2r5&ref=PX}, 
checkout={url=https://api.tosspayments.com/v1/payments/tgen_202507301640576F2r5/checkout}, 
currency=KRW, 
totalAmount=12500, 
balanceAmount=12500, 
suppliedAmount=11364, 
vat=1136, 
taxFreeAmount=0, 
method=간편결제, 
version=2022-11-16, 
metadata=null}
}

*/









