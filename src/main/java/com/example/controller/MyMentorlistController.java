package com.example.controller;

import com.example.DAO.MyMentorListRepository;
import com.example.dto.MyMentorListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentoring")
public class MyMentorlistController {

    @Autowired
    private MyMentorListRepository repository;

    @GetMapping("/my-progress")
    public List<MyMentorListDTO> getMentoringProgress(@RequestParam("menteeId") int menteeId) {
        System.out.println("menteeId: " + menteeId);
        List<MyMentorListDTO> list = repository.findByMenteeId(menteeId);
        System.out.println("결과: " + list.size());  // 출력 개수 확인
        return list;
    }
}
