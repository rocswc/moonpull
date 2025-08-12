package com.example.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.example.VO.MemberVO;

import java.util.Optional;

public interface UserRepository extends JpaRepository<MemberVO, Integer> {
	
    Boolean existsByLoginid(String loginid); // 11
    Boolean existsByEmail(String email);
    Boolean existsByNickname(String nickname);
    Boolean existsByPhonenumber(String phonenumber); //  전화번호 중복 확인용
    
    //loginid를 받아 DB 테이블에서 회원을 조회하는 메소드 작성
    Optional<MemberVO> findByLoginid(String loginid);
    @Modifying
    @Transactional
    @Query("UPDATE MemberVO m SET m.lastLogin = CURRENT_TIMESTAMP WHERE m.loginid = :loginid")
    int updateLastLogin(String loginid);
    Optional<MemberVO> findByEmail(String email);
    Optional<MemberVO> findBySocialIdAndSocialType(String socialId, String socialType);
    boolean existsBySocialIdAndSocialType(String socialId, String socialType);
    
    


}
 