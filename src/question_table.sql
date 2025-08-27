-- 질문 테이블 생성
CREATE TABLE question (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentee_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('PENDING', 'ANSWERED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at DATETIME NULL,
    answer_content TEXT NULL,
    
    -- 외래키 제약조건 (필요시 주석 해제)
    -- FOREIGN KEY (mentee_id) REFERENCES mentee(mentee_id),
    -- FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id),
    
    -- 인덱스 생성
    INDEX idx_mentee_id (mentee_id),
    INDEX idx_mentor_id (mentor_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 테스트 데이터 삽입 (멘티 황규영(mentee_id: 4)이 멘토 이재건(mentor_id: 201)에게 질문)
INSERT INTO question (mentee_id, mentor_id, subject, title, content, status, created_at) VALUES
(4, 201, '한국사', '임진왜란에 대한 질문입니다', '임진왜란이 발생한 연도와 주요 전투에 대해 알려주세요.', 'PENDING', NOW()),
(4, 201, '한국사', '조선시대 정치제도 질문', '조선시대의 정치제도와 양반사회의 특징을 설명해주세요.', 'PENDING', NOW()),
(4, 201, '수능한국사', '수능 한국사 문제 풀이', '2024년 수능 한국사 문제 중 조선시대 관련 문제를 풀이해주세요.', 'PENDING', NOW());

-- 답변된 질문 예시
INSERT INTO question (mentee_id, mentor_id, subject, title, content, status, created_at, answered_at, answer_content) VALUES
(4, 201, '한국사', '고려시대 정치제도', '고려시대의 정치제도에 대해 질문합니다.', 'ANSWERED', '2025-08-19 10:00:00', '2025-08-19 11:00:00', '고려시대는 문벌귀족사회로, 중앙집권적 정치체제를 유지했습니다. 주요 특징으로는...');

-- 다른 멘티들의 질문 예시
INSERT INTO question (mentee_id, mentor_id, subject, title, content, status, created_at) VALUES
(2, 201, '한국사', '삼국시대 질문', '삼국시대의 문화적 특징에 대해 알려주세요.', 'PENDING', NOW()),
(6, 201, '수능한국사', '근현대사 문제', '일제강점기 독립운동에 대한 질문입니다.', 'PENDING', NOW());



