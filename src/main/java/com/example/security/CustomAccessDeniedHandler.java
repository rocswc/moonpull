package com.example.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

// Spring Security에서 권한 부족(403) 발생 시 실행되는 커스텀 핸들러
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        // 로그 출력: 어떤 경로에서 권한 거부가 발생했는지 출력
        System.out.println("Access Denied! URI: " + request.getRequestURI());
        System.out.println("Reason: " + accessDeniedException.getMessage());

        // HTTP 응답 코드 설정 (403 Forbidden)
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        // 클라이언트에게 전송할 메시지 작성
        response.getWriter().write("접근 권한이 없습니다.");
    }
}
