-- mentor_request 테이블에 다양한 멘토링 관계 데이터 생성
-- 멘티들이 다양한 멘토와 연결되도록 설정

-- 기존 데이터 정리 (선택사항 - 필요시 실행)
-- DELETE FROM mentor_request WHERE status IN ('ACCEPTED', 'ENDED');

-- 다양한 멘토링 관계 생성
-- 멘티 2번(suhan)이 여러 멘토와 연결
INSERT INTO mentor_request (mentor_id, mentee_id, status, started_at, end_date) VALUES
-- suhan(mentee_id: 2)이 이재건(mentor_id: 201)과 멘토링 중
(201, 2, 'ACCEPTED', '2025-08-20 10:00:00', NULL),
-- suhan이 다른 멘토들과도 멘토링 중
(202, 2, 'ACCEPTED', '2025-08-21 14:00:00', NULL),
(203, 2, 'ACCEPTED', '2025-08-22 16:00:00', NULL);

-- 멘티 4번(황규영)이 다양한 멘토와 연결
INSERT INTO mentor_request (mentor_id, mentee_id, status, started_at, end_date) VALUES
-- 황규영(mentee_id: 4)이 이재건(mentor_id: 201)과 멘토링 중
(201, 4, 'ACCEPTED', '2025-08-19 09:00:00', NULL),
-- 황규영이 다른 멘토들과도 멘토링 중
(204, 4, 'ACCEPTED', '2025-08-20 11:00:00', NULL),
(205, 4, 'ACCEPTED', '2025-08-21 13:00:00', NULL);

-- 멘티 6번이 다양한 멘토와 연결
INSERT INTO mentor_request (mentor_id, mentee_id, status, started_at, end_date) VALUES
-- 멘티 6번이 이재건과 멘토링 중
(201, 6, 'ACCEPTED', '2025-08-18 15:00:00', NULL),
-- 멘티 6번이 다른 멘토들과도 멘토링 중
(206, 6, 'ACCEPTED', '2025-08-19 10:00:00', NULL),
(207, 6, 'ACCEPTED', '2025-08-20 16:00:00', NULL);

-- 멘티 8번이 다양한 멘토와 연결
INSERT INTO mentor_request (mentor_id, mentee_id, status, started_at, end_date) VALUES
-- 멘티 8번이 이재건과 멘토링 중
(201, 8, 'ACCEPTED', '2025-08-17 14:00:00', NULL),
-- 멘티 8번이 다른 멘토들과도 멘토링 중
(208, 8, 'ACCEPTED', '2025-08-18 11:00:00', NULL),
(209, 8, 'ACCEPTED', '2025-08-19 13:00:00', NULL);

-- 멘티 10번이 다양한 멘토와 연결
INSERT INTO mentor_request (mentor_id, mentee_id, status, started_at, end_date) VALUES
-- 멘티 10번이 이재건과 멘토링 중
(201, 10, 'ACCEPTED', '2025-08-16 12:00:00', NULL),
-- 멘티 10번이 다른 멘토들과도 멘토링 중
(210, 10, 'ACCEPTED', '2025-08-17 09:00:00', NULL),
(211, 10, 'ACCEPTED', '2025-08-18 15:00:00', NULL);

-- 종료된 멘토링 관계도 추가 (평가 가능한 멘토링)
INSERT INTO mentor_request (mentor_id, mentee_id, status, started_at, end_date) VALUES
-- suhan이 이재건과 종료된 멘토링
(201, 2, 'ENDED', '2025-07-15 10:00:00', '2025-08-15 10:00:00'),
-- 황규영이 다른 멘토와 종료된 멘토링
(212, 4, 'ENDED', '2025-07-10 14:00:00', '2025-08-10 14:00:00'),
-- 멘티 6번이 다른 멘토와 종료된 멘토링
(213, 6, 'ENDED', '2025-07-05 16:00:00', '2025-08-05 16:00:00');

-- 멘토별 멘티 분포 확인을 위한 조회 쿼리
-- SELECT 
--     m.mentor_id,
--     mem.name as mentor_name,
--     COUNT(mr.mentee_id) as mentee_count,
--     GROUP_CONCAT(DISTINCT mr.status) as statuses
-- FROM mentor m
-- LEFT JOIN member mem ON m.user_id = mem.user_id
-- LEFT JOIN mentor_request mr ON m.mentor_id = mr.mentor_id
-- WHERE mr.status IN ('ACCEPTED', 'ENDED')
-- GROUP BY m.mentor_id, mem.name
-- ORDER BY m.mentor_id;

-- 멘티별 멘토 분포 확인을 위한 조회 쿼리
-- SELECT 
--     me.mentee_id,
--     mem.name as mentee_name,
--     COUNT(mr.mentor_id) as mentor_count,
--     GROUP_CONCAT(DISTINCT mr.mentor_id) as mentor_ids
-- FROM mentee me
-- LEFT JOIN member mem ON me.user_id = mem.user_id
-- LEFT JOIN mentor_request mr ON me.mentee_id = mr.mentee_id
-- WHERE mr.status IN ('ACCEPTED', 'ENDED')
-- GROUP BY me.mentee_id, mem.name
-- ORDER BY me.mentee_id;

