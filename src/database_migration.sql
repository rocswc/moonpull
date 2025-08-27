-- mentoring_progress 테이블에 end_date 컬럼 추가
ALTER TABLE mentoring_progress 
ADD COLUMN end_date DATE NULL 
COMMENT '멘토링 종료 날짜';

-- 기존 데이터가 있다면 NULL로 설정
UPDATE mentoring_progress 
SET end_date = NULL 
WHERE end_date IS NULL;

-- 인덱스 추가 (선택사항)
CREATE INDEX idx_mentoring_progress_end_date ON mentoring_progress(end_date);
CREATE INDEX idx_mentoring_progress_status ON mentoring_progress(connection_status);
