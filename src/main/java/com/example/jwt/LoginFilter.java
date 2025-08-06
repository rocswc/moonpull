package com.example.jwt;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import com.example.DAO.UserRepository;
import com.example.dto.LoginDTO;
import com.example.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// 로그인 요청 처리 필터 (POST /login 요청 시 동작)
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;
	public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserRepository userRepository) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		 this.userRepository = userRepository;
		setFilterProcessesUrl("/api/login"); 
	}

	// 로그인 시도 처리
	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException {

		try {
			ObjectMapper objectMapper = new ObjectMapper();
			LoginDTO loginRequest = objectMapper.readValue(request.getInputStream(), LoginDTO.class);

			String loginid = loginRequest.getLoginId();
			String password = loginRequest.getPassword();

			 System.out.println("[LoginFilter] 입력 loginId: " + loginid);
		     System.out.println("[LoginFilter] 입력 password: " + password); // 실제 서비스에서는 빼야 하지만 디버깅 시 필요

			UsernamePasswordAuthenticationToken authToken =
					new UsernamePasswordAuthenticationToken(loginid, password);

			Authentication result = authenticationManager.authenticate(authToken);
			System.out.println("[LoginFilter] 인증 성공?: " + result.isAuthenticated());
			return result;

		} catch (IOException e) {
			e.printStackTrace();
			throw new RuntimeException("로그인 요청 JSON 파싱 실패", e);
		}
	}

	// 로그인 성공 시 처리 (JWT를 HttpOnly 쿠키에 저장)
	@Override
	protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
	        FilterChain chain, Authentication authentication)
	        throws IOException, ServletException {

	    CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
	    String username = customUserDetails.getUsername();
	    
	    System.out.println("[LoginFilter] 로그인 성공. 사용자: " + username);

	    // 그대로 유지
	    String nickname = customUserDetails.getNickname();
	    userRepository.updateLastLogin(username);
	   
	    var authorities = authentication.getAuthorities();
	    String roles = authentication.getAuthorities().stream()
	    	    .map(auth -> {
	    	        String role = auth.getAuthority();
	    	        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
	    	    })
	    	    .collect(Collectors.joining(","));

	    // ✅ ① JWT 만료시간: 1시간 -> 24시간
	 // === 24시간 토큰 생성 (그대로 유지) ===
	    String token = jwtUtil.createJwt(
	            username,
	            nickname,                 // 기존 JwtUtil 시그니처 그대로
	            roles,
	            24 * 60 * 60 * 1000L     // 하루(밀리초)
	    );

	    // === (여기부터 교체) HTTPS/SameSite 결정 ===
	    // 1) HTTPS 여부 (프록시 뒤면 X-Forwarded-Proto 반영)
	    boolean isHttps = request.isSecure()
	            || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

	    // 2) 크로스사이트 여부 간단 판별 → SameSite 결정
	    String sameSite = "Lax"; // 기본값
	    String origin = request.getHeader("Origin");
	    if (origin != null) {
	        try {
	            java.net.URI o = java.net.URI.create(origin);
	            String originHost   = o.getHost();
	            String originScheme = o.getScheme();
	            String reqHost      = request.getServerName();
	            String reqScheme    = request.getScheme();

	            boolean crossSite = !(originHost != null && originHost.equalsIgnoreCase(reqHost))
	                              || !(originScheme != null && originScheme.equalsIgnoreCase(reqScheme));
	            if (crossSite) sameSite = "None"; // 진짜 크로스사이트면 None
	        } catch (Exception ignore) {}
	    }

	    // SameSite=None이면 Secure=true가 브라우저 정책상 필수
	    boolean secureFlag = isHttps || "None".equals(sameSite);

	    // === 쿠키 생성/추가 (여기까지 교체) ===
	    ResponseCookie cookie = ResponseCookie.from("jwt", token)
	    	    .httpOnly(true)
	    	    .secure(false)          // ✅ HTTP 환경에서는 false 필수
	    	    .sameSite("Lax")        // ✅ 기본값이므로 생략도 가능
	    	    .path("/")
	    	    .maxAge(24 * 60 * 60)
	    	    .build();

	 // 쿠키 설정
	    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

	    // ✅ 사용자 정보 JSON 응답 추가
	    response.setContentType("application/json; charset=UTF-8");
	    response.getWriter().write(new ObjectMapper().writeValueAsString(Map.of(
	    	"token", token, 
	        "loginId", username,
	        "nickname", nickname,
	        "roles", authorities.stream()
	            .map(GrantedAuthority::getAuthority)
	            .collect(Collectors.toList())
	    )));
	}

	// 로그인 실패 시 처리
	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed)
					throws IOException, ServletException {

		System.out.println("로그인 실패: " + failed.getMessage());

		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json; charset=UTF-8");
		response.getWriter().write("{\"error\": \"인증 실패\"}");
	}
}
