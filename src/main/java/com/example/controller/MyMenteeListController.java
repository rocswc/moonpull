package com.example.controller;

import com.example.dto.MyMenteeListDTO;
import com.example.service.MyMenteeListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mentor")
public class MyMenteeListController {

    private final MyMenteeListService myMenteeListService;

    @GetMapping("/mentees")
    public List<MyMenteeListDTO> getMyMentees(@RequestParam Long mentorId) {
        return myMenteeListService.getMyMentees(mentorId);
    }

    @PostMapping("/accept")
    public void acceptMentee(@RequestParam Long menteeId, @RequestParam Long mentorId) {
        myMenteeListService.acceptMentee(menteeId, mentorId);
    }
}
