package com.example.DAO;

import com.example.VO.MemberVO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<MemberVO, Integer> {
    boolean existsByEmail(String email);
    boolean existsByPhonenumber(String phonenumber);
}
