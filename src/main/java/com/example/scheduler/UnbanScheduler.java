package com.example.scheduler;

import com.example.DAO.MentorRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class UnbanScheduler {

    @Autowired
    private MentorRepository mentorRepository;

    // 매일 새벽 1시에 실행
    @Scheduled(cron = "0 0 0 * * ?")
    public void unbanExpiredUsers() {
        System.out.println("🕐 [스케줄러] 정지 만료 사용자 해제 실행");
        mentorRepository.unbanUsersWithExpiredBan();
    }
}