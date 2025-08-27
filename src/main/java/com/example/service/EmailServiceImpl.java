package com.example.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // ✅ 로그 추가
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j // ✅ 로그 어노테이션
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${spring.mail.username}")
    private String from;

    @Override
    public void sendResetPasswordEmail(String to, String token) {
        String subject = "[문풀] 비밀번호 재설정 안내";
        String resetUrl = frontendBaseUrl + "/auth/reset-password/confirm?token=" + token;

        String content = """
            <div>
                <h2>비밀번호 재설정 안내</h2>
                <p>비밀번호를 재설정하려면 아래 링크를 클릭하세요:</p>
                <a href="%s">%s</a>
                <p>해당 링크는 30분간 유효합니다.</p>
            </div>
        """.formatted(resetUrl, resetUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(from);
            helper.setText(content, true);
            mailSender.send(message);

            // ✅ 성공 로그
            log.info("Reset password email sent to {}", to);

        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 실패: " + e.getMessage(), e);
        }
    }
}
