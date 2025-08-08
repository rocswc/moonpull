package com.example.controller;

import com.example.dto.AcceptRequestDTO;
import com.example.entity.MentoringProgress;
import com.example.service.MentoringChatroomService;
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
}
