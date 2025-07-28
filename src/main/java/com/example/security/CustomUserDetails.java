package com.example.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.VO.MemberVO;

public class CustomUserDetails implements UserDetails {

    private final MemberVO userEntity;

    // 직접 주입된 권한 목록 (nullable)
    private final Collection<? extends GrantedAuthority> authorities;

    // 생성자 1: 권한 없이 userEntity만 전달받을 때 사용
    public CustomUserDetails(MemberVO userEntity) {
        this.userEntity = userEntity;
        this.authorities = null;
    }

    // 생성자 2: 권한 목록까지 직접 전달받을 때 사용
    public CustomUserDetails(MemberVO userEntity, Collection<? extends GrantedAuthority> authorities) {
        this.userEntity = userEntity;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (authorities != null) {
            return authorities;
        }

        // userEntity에서 roles 문자열 파싱 (예: "ROLE_USER,ROLE_ADMIN")
        String role = userEntity.getRoles();
        if (role == null || role.trim().isEmpty()) {
            System.out.println("[경고] 사용자 권한 정보 없음: 기본 ROLE_USER 적용");
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return java.util.Arrays.stream(role.split(",")) // 쉼표로 분리
                .map(String::trim)
                .filter(r -> !r.isEmpty())
                .map(SimpleGrantedAuthority::new) // ROLE 문자열 → 권한 객체로 변환
                .collect(java.util.stream.Collectors.toList());
    }

    // 인증 시 사용할 비밀번호 반환
    @Override
    public String getPassword() {
        return userEntity.getPasswordhash(); // 주의: password 필드명 아님!
    }

    // 인증 시 사용할 사용자 ID 반환
    @Override
    public String getUsername() {
        return userEntity.getLoginid();
    }

    // 계정 만료 여부 (true = 사용 가능)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 계정 잠김 여부 (true = 잠김 아님)
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 자격 증명(비밀번호 등) 만료 여부
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 계정 활성화 여부
    @Override
    public boolean isEnabled() {
        return true;
    }
}
