package com.example.DAO;

import com.example.VO.MemberVO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<MemberVO, Integer> {
    boolean existsByEmail(String email);
    boolean existsByPhonenumber(String phonenumber);
}
// boolean return값이 t/f만 나오고 이 이메일이 DB에 이미 존재하면 t