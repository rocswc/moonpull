package com.example.service;
import com.example.VO.WrongAnswerVO;
import com.example.dto.WrongAnswerCreateRequestDTO;
import com.example.DAO.WrongAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WrongAnswerServiceImpl implements WrongAnswerService {
    private final WrongAnswerRepository repository;

    public WrongAnswerVO saveIfWrong(WrongAnswerCreateRequestDTO req) {
        if (Boolean.TRUE.equals(req.getIsCorrect())) {
            // 정답이면 저장하지 않음
            return null;
        }

        // answer가 비어 있고, correctAnswerIndex가 들어오면 보기 텍스트로 매핑
        List<String> answer = req.getAnswer();
        if ((answer == null || answer.isEmpty()) 
                && req.getCorrectAnswerIndex() != null
                && req.getChoices() != null
                && req.getCorrectAnswerIndex() >= 0
                && req.getCorrectAnswerIndex() < req.getChoices().size()) {
            answer = List.of(req.getChoices().get(req.getCorrectAnswerIndex()));
        }

        WrongAnswerVO doc = WrongAnswerVO.builder()
                .school(req.getSchool())
                .grade(req.getGrade())
                .subject(req.getSubject())
                .question(req.getQuestion())
                .passage(req.getPassage())
                .choices(req.getChoices())
                .answer(answer)                    // <- 서버에서 보정된 answer 사용
                .explanation(req.getExplanation())
                .userAnswer(req.getUserAnswer())
                .isCorrect(false)                  // 어차피 오답만 저장
                .build();

        return repository.save(doc);
    }

    public List<WrongAnswerVO> saveWrongBatch(List<WrongAnswerCreateRequestDTO> requests) {
        return requests.stream()
                .map(this::saveIfWrong)
                .filter(doc -> doc != null)
                .toList();
    }
}