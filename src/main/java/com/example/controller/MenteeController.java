package com.example.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mentee")
@PreAuthorize("hasRole('MENTEE')")
public class MenteeController {

    @GetMapping("/dashboard")
    public String menteeDashboard() {
        return "멘티 전용 대시보드";
    }

    @PostMapping("/question")
    public String submitQuestion(@RequestBody String question) {
        return "질문 등록 완료: " + question;
    }
}

