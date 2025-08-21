package com.example.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.example.VO.MemberVO;

import java.util.Optional;

// ✅ 추가 import
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<MemberVO, Integer> {

    // 중복 확인
    Boolean existsByLoginid(String loginid);
    Boolean existsByEmail(String email);
    Boolean existsByNickname(String nickname);
    Boolean existsByPhonenumber(String phonenumber);

    // loginid로 회원 조회
    Optional<MemberVO> findByLoginid(String loginid);

    // 마지막 로그인 시간 갱신
    @Modifying
    @Transactional
    @Query("UPDATE MemberVO m SET m.lastLogin = CURRENT_TIMESTAMP WHERE m.loginid = :loginid")
    int updateLastLogin(String loginid);

    // 이메일로 회원 조회
    Optional<MemberVO> findByEmail(String email);

    // 이메일 대소문자 무시 조회
    Optional<MemberVO> findByEmailIgnoreCase(String email);

    // ✅ 추가: 행 잠금 (연동 시 동시성 문제 방지)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MemberVO m WHERE m.userId = :id")
    Optional<MemberVO> lockByUserId(@Param("id") Integer id);
}
