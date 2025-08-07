package com.example.service;

import com.example.VO.MemberVO;

public interface UserService {
    boolean existsBySocialIdAndType(String socialId, String socialType);
    MemberVO findBySocialIdAndType(String socialId, String socialType);
}
