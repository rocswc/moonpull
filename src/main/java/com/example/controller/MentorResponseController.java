package com.example.controller;

import com.example.dto.MentorResponseDTO;
import com.example.service.MentorResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mentors")
public class MentorResponseController {

    private final MentorResponseService mentorResponseService;

    @GetMapping("/{slug}")
    public List<MentorResponseDTO> getMentorsBySlug(@PathVariable String slug) {
        System.out.println("📥 [Controller] slug 요청: " + slug);
        List<MentorResponseDTO> mentors = mentorResponseService.getMentorsBySlug(slug);
        System.out.println("📤 [Controller] 응답 mentor 수: " + mentors.size());
        return mentors;
    }
}
