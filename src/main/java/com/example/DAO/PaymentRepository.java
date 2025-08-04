package com.example.DAO;
import org.apache.ibatis.annotations.Mapper;
import com.example.dto.PaymentDTO;
import com.example.dto.SubscribeDTO;

@Mapper
public interface PaymentRepository {
	Integer insertPayment(PaymentDTO vo);
	Integer insertSubscription(SubscribeDTO vo);
}
