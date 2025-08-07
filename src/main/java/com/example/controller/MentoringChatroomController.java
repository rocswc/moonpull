package com.example.controller;

import com.example.dto.AcceptRequestDTO;
import com.example.service.MentoringChatroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class MentoringChatroomController {

    private final MentoringChatroomService mentoringChatroomService;

    @PostMapping("/accept")
    public ResponseEntity<Map<String, Integer>> acceptRequest(@RequestBody AcceptRequestDTO dto) {
        int chatId = mentoringChatroomService.createChatroomAndUpdateProgress(dto.getMenteeId(), dto.getMentorId());
        return ResponseEntity.ok(Map.of("chatId", chatId));
    
    
    }
}
