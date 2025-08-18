// src/main/java/com/example/DAO/FcmTokenRepository.java
package com.example.DAO;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.example.VO.FcmTokenVO;

@Mapper
public interface FcmTokenRepository {

    // XML: getTokensByUserId
    List<FcmTokenVO> getTokensByUserId(Integer userId);

    // XML: insertToken
    void insertToken(FcmTokenVO vo);

    // XML: deleteToken
    void deleteToken(String token);

    // (선택) 특정 유저의 모든 토큰 제거가 필요할 때 유용
    // <delete id="deleteByUserId">DELETE FROM fcm_token WHERE user_id = #{userId}</delete>
    void deleteByUserId(Integer userId);
}
