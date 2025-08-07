package com.example.DAO;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import com.example.dto.PaymentDTO;
import com.example.dto.SubscribeDTO;

@Mapper
public interface PaymentRepository {
	Integer insertPayment(PaymentDTO vo);
	Integer insertSubscription(SubscribeDTO vo);
	 void cancelSubscriptionById(int subscribeId);
	 void cancelPaymentByMemberId(int memberId);
	 List<Map<String, Object>> getPlanDistribution();
}
