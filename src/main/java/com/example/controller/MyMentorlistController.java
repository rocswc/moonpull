package com.example.controller;

import com.example.dto.MyMentorlistDTO;
import com.example.service.MyMentorlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MyMentorlistController {

    private final MyMentorlistService myMentorlistService;

    public MyMentorlistController(MyMentorlistService myMentorlistService) {
        this.myMentorlistService = myMentorlistService;
    }

    @GetMapping("/my-mentors")
    public List<MyMentorlistDTO> getMyMentors(@RequestParam("menteeId") Long menteeId) {
        return myMentorlistService.getMyMentors(menteeId);
    }
}
