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
            return null; // 정답이면 저장 안 함
        }

        // 1) 정답 텍스트 보정
        List<String> answer = req.getAnswer();
        if ((answer == null || answer.isEmpty())
                && req.getCorrectAnswerIndex() != null
                && req.getChoices() != null
                && req.getCorrectAnswerIndex() >= 0
                && req.getCorrectAnswerIndex() < req.getChoices().size()) {
            answer = List.of(req.getChoices().get(req.getCorrectAnswerIndex()));
        }

        // 2) ★ 같은 사용자+같은 문항은 1건만 유지 (upsert)
        WrongAnswerVO doc = repository.findByUserIdAndQuestionId(req.getUserId(), req.getQuestionId())
                .orElse(WrongAnswerVO.builder()
                        .userId(req.getUserId())          // ★ 추가
                        .questionId(req.getQuestionId())  // ★ 추가
                        .build());

        // 3) 필드 세팅/갱신
        doc.setSchool(req.getSchool());
        doc.setGrade(req.getGrade());
        doc.setSubject(req.getSubject());
        doc.setQuestion(req.getQuestion());
        doc.setPassage(req.getPassage());
        doc.setChoices(req.getChoices());
        doc.setAnswer(answer);
        doc.setExplanation(req.getExplanation());
        doc.setUserAnswer(req.getUserAnswer());
        doc.setCorrect(false); // 항상 활성 오답로 유지(맞추면 따로 true로 바꾸거나 삭제)

        return repository.save(doc);
    }

    public List<WrongAnswerVO> saveWrongBatch(List<WrongAnswerCreateRequestDTO> requests) {
        return requests.stream()
                .map(this::saveIfWrong)
                .filter(doc -> doc != null)
                .toList();
    }
    
    @Override
    public List<WrongAnswerVO> list(Long userId, String subject) {
        if (subject == null || subject.isBlank()) {
            return repository.findByUserIdAndIsCorrectFalseOrderByCreatedAtDesc(userId);
        }
        return repository.findByUserIdAndSubjectAndIsCorrectFalseOrderByCreatedAtDesc(userId, subject);
    }
    
    @Override
    public void markCorrect(String id, boolean correct) {
        repository.findById(id).ifPresent(doc -> {
            doc.setCorrect(correct);   // true면 해결됨, false면 다시 오답 활성화
            repository.save(doc);
        });
    }
    
}