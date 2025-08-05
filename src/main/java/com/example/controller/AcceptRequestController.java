package com.example.controller;

import com.example.dto.AcceptRequestDTO;
import com.example.service.AcceptRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mentoring")
@RequiredArgsConstructor
public class AcceptRequestController {

    private final AcceptRequestService acceptRequestService;

    @PostMapping("/accept")
    public ResponseEntity<Map<String, Integer>> acceptRequest(@RequestBody AcceptRequestDTO dto) {
        int chatId = acceptRequestService.accept(dto.getMenteeId(), dto.getMentorId());

        // chatId를 JSON으로 반환 (예: { "chatId": 5 })
        return ResponseEntity.ok(Map.of("chatId", chatId));
    }
}
