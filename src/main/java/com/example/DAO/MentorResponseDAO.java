package com.example.DAO;

import com.example.dto.MentorResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface MentorResponseDAO {
    List<MentorResponseDTO> getMentorsBySlug(String slug);
    List<String> getSpecialtiesByMentorId(Long mentorId); // ★ 서브쿼리
}