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

        // 디버깅: 전체 멘토 목록 조회
        System.out.println("🔍 [디버깅] 전체 APPROVED 멘토 조회 시작");
        List<MentorResponseDTO> allMentors = mentorResponseDAO.getAllApprovedMentors();
        System.out.println("🔍 [디버깅] 전체 APPROVED 멘토 수: " + allMentors.size());
        for (MentorResponseDTO mentor : allMentors) {
            System.out.println("🔍 [디버깅] 멘토 ID: " + mentor.getId() + ", 이름: " + mentor.getName() + ", 전문분야: " + mentor.getSpecialties());
        }

        List<MentorResponseDTO> mentors = mentorResponseDAO.getMentorsBySlug(slug);
        System.out.println("🧑‍🏫 [쿼리 결과] 멘토 수: " + mentors.size());

        // specialties 문자열을 배열로 변환
        for (MentorResponseDTO mentor : mentors) {
            System.out.println("🔍 [멘토 정보] ID: " + mentor.getId() + ", 이름: " + mentor.getName() + ", 전문분야: " + mentor.getSpecialties());
            
            // specialties 문자열을 쉼표로 분리하여 배열로 변환
            if (mentor.getSpecialties() != null && !mentor.getSpecialties().trim().isEmpty()) {
                String[] specialtiesArray = mentor.getSpecialties().split(",");
                // 공백 제거
                for (int i = 0; i < specialtiesArray.length; i++) {
                    specialtiesArray[i] = specialtiesArray[i].trim();
                }
                mentor.setSpecialtiesArray(specialtiesArray);
            } else {
                mentor.setSpecialtiesArray(new String[0]);
            }
        }

        return mentors;
    }
}
