package com.example.service;
import com.example.VO.WrongAnswerVO;
import com.example.dto.WrongAnswerCreateRequestDTO;
import com.example.DAO.WrongAnswerRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WrongAnswerServiceImpl implements WrongAnswerService {
    private final WrongAnswerRepository repository;
 
    public WrongAnswerVO saveIfWrong(WrongAnswerCreateRequestDTO req) {
        System.out.println("🔧 [Service] saveIfWrong 호출됨");
        System.out.println("🔧 [Service] userId = " + req.getUserId());
        System.out.println("🔧 [Service] isCorrect = " + req.getIsCorrect());
        
        if (Boolean.TRUE.equals(req.getIsCorrect())) {
            System.out.println("🔧 [Service] 정답이므로 저장하지 않음");
            return null; // 정답이면 저장 안 함
        }

        System.out.println("🔧 [Service] 오답이므로 저장 진행");

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

        System.out.println("🔧 [Service] MongoDB 저장 시도");
        try {
            WrongAnswerVO saved = repository.save(doc);
            System.out.println("✅ [Service] MongoDB 저장 성공: id = " + saved.getId());
            return saved;
        } catch (Exception e) {
            System.err.println("❌ [Service] MongoDB 저장 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<WrongAnswerVO> saveWrongBatch(List<WrongAnswerCreateRequestDTO> requests) {
        return requests.stream()
                .map(this::saveIfWrong)
                .filter(doc -> doc != null)
                .toList();
    }
    
    @Override
    public List<WrongAnswerVO> list(Long userId, String subject) {
        System.out.println("🔧 [Service] list 호출됨: userId=" + userId + ", subject=" + subject);
        
        try {
            List<WrongAnswerVO> result;
            
            if (subject == null || subject.isBlank()) {
                System.out.println("🔧 [Service] userId로만 조회 시도: " + userId);
                System.out.println("🔧 [Service] Repository 호출 직전");
                result = repository.findByUserIdOrderByCreatedAtDesc(userId);
                System.out.println("🔧 [Service] Repository 호출 완료");
            } else {
                System.out.println("🔧 [Service] userId + subject로 조회 시도: " + userId + ", " + subject);
                System.out.println("🔧 [Service] Repository 호출 직전");
                result = repository.findByUserIdAndSubjectOrderByCreatedAtDesc(userId, subject);
                System.out.println("🔧 [Service] Repository 호출 완료");
            }
            
            System.out.println("🔧 [Service] Repository 조회 결과 개수: " + (result != null ? result.size() : "null"));
            
            if (result != null && !result.isEmpty()) {
                System.out.println("🔧 [Service] 첫 번째 결과: " + result.get(0));
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("❌ [Service] list 메서드 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public List<WrongAnswerVO> listAll() {
        System.out.println("🔧 [Service] listAll 호출됨 - 모든 오답노트 조회");
        try {
            System.out.println("🔧 [Service] Repository 호출 직전");
            List<WrongAnswerVO> allData = repository.findAll();
            System.out.println("🔧 [Service] Repository 호출 완료");
            System.out.println("🔧 [Service] 전체 데이터 개수: " + allData.size());
            
            if (!allData.isEmpty()) {
                System.out.println("🔧 [Service] 첫 번째 데이터: " + allData.get(0));
                System.out.println("🔧 [Service] 첫 번째 데이터의 userId: " + allData.get(0).getUserId());
                System.out.println("🔧 [Service] 첫 번째 데이터의 userId 타입: " + allData.get(0).getUserId().getClass().getName());
            } else {
                System.out.println("🔧 [Service] 데이터가 없습니다. MongoDB 연결을 확인해주세요.");
            }
            
            return allData;
        } catch (Exception e) {
            System.err.println("❌ [Service] listAll 메서드 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
}