package com.example.service;

import com.example.DAO.MentorResponseDAO;
import com.example.dto.MentorResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MentorResponseService {

    private final MentorResponseDAO mentorResponseDAO;

    public List<MentorResponseDTO> getMentorsBySlug(String slug) {
        List<MentorResponseDTO> mentors = mentorResponseDAO.getMentorsBySlug(slug);

        // specialties 추가로 채우기
        for (MentorResponseDTO mentor : mentors) {
            List<String> specialties = mentorResponseDAO.getSpecialtiesByMentorId(mentor.getId());
            mentor.setSpecialties(specialties);
        }

        return mentors;
    }
}
