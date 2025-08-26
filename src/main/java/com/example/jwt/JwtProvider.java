package com.example.jwt;

import com.example.DAO.UserRepository;
import com.example.VO.MemberVO;
import com.example.jwt.JwtUtil;
import com.example.security.CustomUserDetails;
import com.example.service.SessionService;
import com.example.session.ServerSession;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtProvider {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final SessionService sessionService;

    public JwtProvider(JwtUtil jwtUtil, UserRepository userRepository, SessionService sessionService) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }

    public Authentication getAuthentication(String token) {
        try {
            var claims = jwtUtil.parse(token).getPayload();

            Integer userId = Integer.valueOf(claims.getSubject());
            String rolesCsv = claims.get("roles", String.class);

            Set<String> roles = (rolesCsv == null || rolesCsv.isBlank())
                    ? Set.of()
                    : Arrays.stream(rolesCsv.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toSet());

            MemberVO user = userRepository.findById(userId).orElseGet(() -> {
                MemberVO m = new MemberVO();
                m.setUserId(userId);
                m.setRoles(String.join(",", roles));
                return m;
            });

            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                    .map(SimpleGrantedAuthority::new)
                    .toList();

            CustomUserDetails cud = new CustomUserDetails(user, authorities);
            return new UsernamePasswordAuthenticationToken(cud, null, authorities);
        } catch (Exception e) {
            System.out.println("❌ [JWT 인증 실패] " + e.getMessage());
            return null;
        }
    }
}
