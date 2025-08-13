package com.example.controller;

import com.example.dto.AcceptRequestDTO;
import com.example.entity.Mentee;
import com.example.entity.Mentor;
import com.example.entity.MentoringProgress;
import com.example.service.MentoringChatroomService;
import com.example.DAO.MenteeRepository;
import com.example.DAO.MentorEntityRepository;
import com.example.DAO.MentoringProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class MentoringChatroomController {

    private final MentoringChatroomService mentoringChatroomService;
    private final MentoringProgressRepository mentoringProgressRepository;
    private final MenteeRepository menteeRepository;
    private final MentorEntityRepository mentorEntityRepository;

    @PostMapping("/accept")
    public ResponseEntity<Map<String, Integer>> acceptRequest(@RequestBody AcceptRequestDTO dto) {
        int chatId = mentoringChatroomService.createChatroomAndUpdateProgress(dto.getMenteeId(), dto.getMentorId());
        return ResponseEntity.ok(Map.of("chatId", chatId));
    }

    @GetMapping("/chatId")
    public ResponseEntity<Map<String, Integer>> getChatId(
            @RequestParam int menteeId,
            @RequestParam int mentorId
    ) {
        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(menteeId, mentorId);
        if (progress == null || progress.getChatId() == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }
        return ResponseEntity.ok(Map.of("chatId", progress.getChatId()));
    }

    @GetMapping("/chatIdByUserId")
    public ResponseEntity<Map<String, Integer>> getChatIdByUserId(
            @RequestParam Long menteeUserId,
            @RequestParam Long mentorUserId
    ) {
        // menteeUserId로 mentee_id 조회 (중복 가능성 고려: 가장 최근 1건 사용)
        Mentee mentee = menteeRepository.findTopByUserIdOrderByMenteeIdDesc(menteeUserId)
                .orElse(null);
        if (mentee == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }

        // mentorUserId로 mentor_id 조회
        Mentor mentor = mentorEntityRepository.findByUserId(mentorUserId)
                .orElse(null);
        if (mentor == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }

        MentoringProgress progress = mentoringProgressRepository.findByMenteeIdAndMentorId(
                mentee.getMenteeId().intValue(), 
                mentor.getMentorId().intValue()
        );
        
        if (progress == null || progress.getChatId() == null) {
            return ResponseEntity.status(404).body(Map.of("chatId", -1));
        }
        return ResponseEntity.ok(Map.of("chatId", progress.getChatId()));
    }
}
