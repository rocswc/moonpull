-- mentor_request 테이블에 end_date 컬럼 추가
ALTER TABLE mentor_request 
ADD COLUMN end_date DATETIME NULL 
COMMENT '멘토링 종료 날짜';

-- 기존 데이터가 있다면 NULL로 설정 (선택사항, 필요시 실행)
-- UPDATE mentor_request 
-- SET end_date = NULL 
-- WHERE end_date IS NULL;

-- 인덱스 추가 (선택사항)
-- CREATE INDEX idx_mentor_request_end_date ON mentor_request(end_date);
-- CREATE INDEX idx_mentor_request_status ON mentor_request(status);


