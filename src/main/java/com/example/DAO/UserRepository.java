package com.example.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.VO.MemberVO;

import java.util.Optional;

public interface UserRepository extends JpaRepository<MemberVO, Integer> {
	
    Boolean existsByLoginid(String loginid); // 
    
    //loginid를 받아 DB 테이블에서 회원을 조회하는 메소드 작성
    Optional<MemberVO> findByLoginid(String loginid);

}
 