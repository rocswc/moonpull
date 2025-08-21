package com.example.DAO;

import com.example.VO.MemberSocialVO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 인터페이스 선언
public interface MemberSocialRepository extends JpaRepository<MemberSocialVO, Integer> {

    Optional<MemberSocialVO> findBySocialTypeAndSocialId(String socialType, String socialId);
    boolean existsBySocialTypeAndSocialId(String socialType, String socialId);
    List<MemberSocialVO> findByMemberUserId(Integer userId);
}