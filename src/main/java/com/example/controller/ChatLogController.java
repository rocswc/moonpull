package com.example.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import com.example.VO.ChatLogRequest;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@Slf4j
public class ChatLogController {

    @PostMapping("/log")
    public void logChat(@RequestBody ChatLogRequest request) throws JsonProcessingException {
        Map<String, Object> logData = new HashMap<>();
        logData.put("type", "chat_message");
        logData.put("roomId", request.getRoomId());
        logData.put("senderId", request.getSenderId());
        logData.put("content", request.getContent());
        logData.put("timestamp", Instant.now().toString());

        log.info(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(logData));
    }
}
