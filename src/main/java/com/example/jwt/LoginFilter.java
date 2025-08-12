package com.example.jwt;

import java.io.IOException;
import java.util.Date;
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
import com.example.VO.MemberVO;
import com.example.dto.LoginDTO;
import com.example.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class LoginFilter extends UsernamePasswordAuthenticationFilter {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;
	
	 @PersistenceContext
	    private EntityManager entityManager;

	public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserRepository userRepository) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		this.userRepository = userRepository;
		setFilterProcessesUrl("/api/login");
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException {

		try {
			ObjectMapper objectMapper = new ObjectMapper();
			LoginDTO loginRequest = objectMapper.readValue(request.getInputStream(), LoginDTO.class);

			String loginid = loginRequest.getLoginId();
			String password = loginRequest.getPassword();

			System.out.println("[LoginFilter] 입력 loginId: " + loginid);
			System.out.println("[LoginFilter] 입력 password: " + password);

			
			
			// ✅ 정지 여부 확인
			MemberVO member = userRepository.findByLoginid(loginid)
					.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
			//entityManager.flush();
			//entityManager.clear();

			
			System.out.println("📌 getIsBanned: " + member.getIsBanned());
			System.out.println("📌 getBanReason: " + member.getBanReason());
			System.out.println("📌 getBanExpireDate: " + member.getBanExpireDate());
			if (member.getIsBanned()) {
				Date today = new Date();
				Date expireDate = member.getBanExpireDate();

				if (expireDate == null || today.before(expireDate)) {
					String reason = member.getBanReason() != null ? member.getBanReason() : "관리자에 의해 정지되었습니다.";
					String expireInfo = expireDate != null ? " (해제일: " + expireDate + ")" : "";
					sendBanResponse(response, "정지된 계정입니다. 사유: " + reason + expireInfo);
					return null; // 인증 시도 중단
					
					
				}
			}

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

	@Override
	protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
	        FilterChain chain, Authentication authentication)
	        throws IOException, ServletException {

	    CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
	    String username = customUserDetails.getUsername();
	    String nickname = customUserDetails.getNickname();
	    userRepository.updateLastLogin(username);

	    var authorities = authentication.getAuthorities();
	    String roles = authorities.stream()
	        .map(auth -> {
	            String role = auth.getAuthority();
	            return role.startsWith("ROLE_") ? role : "ROLE_" + role;
	        })
	        .collect(Collectors.joining(","));

	    String token = jwtUtil.createJwt(username, nickname, roles, 24 * 60 * 60 * 1000L);

	    boolean isHttps = request.isSecure()
	        || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

	    String sameSite = "Lax";
	    String origin = request.getHeader("Origin");
	    if (origin != null) {
	        try {
	            java.net.URI o = java.net.URI.create(origin);
	            String originHost = o.getHost();
	            String originScheme = o.getScheme();
	            String reqHost = request.getServerName();
	            String reqScheme = request.getScheme();

	            boolean crossSite = !(originHost != null && originHost.equalsIgnoreCase(reqHost))
	                    || !(originScheme != null && originScheme.equalsIgnoreCase(reqScheme));
	            if (crossSite) sameSite = "None";
	        } catch (Exception ignore) {}
	    }

	    boolean secureFlag = isHttps || "None".equals(sameSite);

	    ResponseCookie cookie = ResponseCookie.from("jwt", token)
	        .httpOnly(true)
	        .secure(true)
	        .sameSite("None")
	        .path("/")
	        .maxAge(24 * 60 * 60)
	        .build();

	    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

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

	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed)
			throws IOException, ServletException {

		System.out.println("로그인 실패: " + failed.getMessage());

		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json; charset=UTF-8");
		response.getWriter().write("{\"error\": \"인증 실패\"}");
	}

	// 🔒 정지된 유저에 대한 응답
	private void sendBanResponse(HttpServletResponse response, String message) throws IOException {
		response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
		response.setContentType("application/json;charset=UTF-8");
		response.getWriter().write("{\"message\": \"" + message + "\"}");
	}
}
