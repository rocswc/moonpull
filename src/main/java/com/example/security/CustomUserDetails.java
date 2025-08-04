package com.example.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.VO.MemberVO;

public class CustomUserDetails implements UserDetails {

    private final MemberVO memberVO;   // ✅ userEntity 대신 memberVO 사용

    // 직접 주입된 권한 목록 (nullable)
    private final Collection<? extends GrantedAuthority> authorities;

    // 생성자 1: 권한 없이 memberVO만 전달받을 때 사용
    public CustomUserDetails(MemberVO memberVO) {
        this.memberVO = memberVO;   // ✅ 변수명 통일
        this.authorities = null;
    }

    // 생성자 2: 권한 목록까지 직접 전달받을 때 사용
    public CustomUserDetails(MemberVO memberVO, Collection<? extends GrantedAuthority> authorities) {
        this.memberVO = memberVO;   // ✅ 변수명 통일
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (authorities != null) {
            return authorities;
        }

        String role = memberVO.getRoles();
        if (role == null || role.trim().isEmpty()) {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return java.util.Arrays.stream(role.split(","))
                .map(String::trim)
                .filter(r -> !r.isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public String getPassword() {
        return memberVO.getPasswordhash();
    }

    @Override
    public String getUsername() {
        return memberVO.getLoginid();
    }

    // 닉네임 꺼내기
    public String getNickname() {
        String nickname = memberVO.getNickname();
        return (nickname == null || nickname.trim().isEmpty())
                ? memberVO.getLoginid()
                : nickname;
    }


    // memberVO를 그대로 가져오는 메서드
    public MemberVO getMemberVO() {
        return memberVO;  // ✅ 필드 그대로 반환
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
