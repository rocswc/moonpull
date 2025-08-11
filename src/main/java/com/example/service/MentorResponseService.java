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
        System.out.println("🎯 [서비스 진입] slug: " + slug);

        List<MentorResponseDTO> mentors = mentorResponseDAO.getMentorsBySlug(slug);
        System.out.println("🧑‍🏫 [쿼리 결과] 멘토 수: " + mentors.size());

        for (MentorResponseDTO mentor : mentors) {
            System.out.println("🔍 [멘토 ID] " + mentor.getId());
            List<String> specialties = mentorResponseDAO.getSpecialtiesByMentorId(mentor.getId());
            System.out.println("🔍 [전문 분야 조회] mentorId: " + mentor.getId() + ", specialties: " + specialties);
            mentor.setSpecialties(specialties);
        }

        return mentors;
    }
}
