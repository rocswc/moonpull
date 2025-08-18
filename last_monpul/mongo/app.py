# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import random
from datetime import datetime
from bson import ObjectId
import logging
import json

# Flask 앱 설정
app = Flask(__name__)
# 정확한 CORS 설정
CORS(app,
     supports_credentials=True,
     origins=["https://192.168.56.1:8888"],  # React 앱 도메인 정확히 지정
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"]
)  # React 앱에서의 CORS 요청 허용

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB 연결 설정 - 데이터베이스 이름을 'quiz'로 변경
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://192.168.0.40:27017')
DATABASE_NAME = 'quiz'  # 변경됨

try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    logger.info(f"MongoDB 연결 성공 - 데이터베이스: {DATABASE_NAME}")
    logger.info(f"접속된 MongoDB URI: {MONGODB_URI}")
    logger.info(f"사용 가능한 DB 목록: {client.list_database_names()}")
    logger.info(f"quiz DB의 컬렉션 목록: {db.list_collection_names()}")
except Exception as e:
    logger.error(f"MongoDB 연결 실패: {e}")
    db = None


# JSON Encoder for ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)


app.json_encoder = JSONEncoder


# 실제 데이터 매핑 함수 - 실제 데이터 구조에 맞게 수정 예정
def map_question_data(question, collection_name):
    """실제 MongoDB 데이터 구조를 React 시스템 형식으로 매핑"""

    # 기본 매핑
    mapped_question = {
        'id': question.get('id', question.get('_id', '')),
        'subject': '',
        'school': question.get('school', ''),
        'grade': question.get('grade', 1),
        'passage': question.get('passage', ''),
        'question': question.get('question', ''),
        'choices': question.get('choices', []),
        'answer': question.get('answer', 0),
        'explanation': question.get('explanation', '')
    }

    # MongoDB ObjectId를 문자열로 변환
    if isinstance(mapped_question['id'], ObjectId):
        mapped_question['id'] = str(mapped_question['id'])

    # 과목명 설정
    subject_names = {
        'history': '한국사',
        'korea': '국어',
        'eng': '영어'
    }
    mapped_question['subject'] = subject_names.get(collection_name, collection_name)

    # 답안 인덱스가 1-based라면 0-based로 변환
    answer = mapped_question['answer']
    if isinstance(answer, (int, float)) and answer > 0:
        # 1-based를 0-based로 변환 (단, 이미 0-based라면 그대로)
        if answer <= len(mapped_question['choices']):
            mapped_question['answer'] = int(answer - 1) if answer > len(mapped_question['choices']) / 2 else int(answer)
    elif isinstance(answer, list) and len(answer) > 0:
        # 리스트 형태라면 첫 번째 값 사용
        mapped_question['answer'] = int(answer[0] - 1) if answer[0] > 0 else 0

    return mapped_question


@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    db_status = 'Disconnected'
    collections_info = {}

    if db is not None:
        try:
            # 실제 컬렉션들의 문서 수 확인
            collections = ['history', 'korea', 'eng']
            for col in collections:
                try:
                    count = db[col].count_documents({})
                    collections_info[col] = count
                except:
                    collections_info[col] = 0
            db_status = 'Connected'
        except:
            db_status = 'Error'

    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'database': db_status,
        'database_name': DATABASE_NAME,
        'collections': collections_info
    })


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    try:
        if db is None:
            raise Exception("Database not connected")

        subjects = []
        target_collections = ['history', 'korea', 'eng']

        logger.info("=== DEBUG: 컬렉션별 문서 수 확인 ===")
        for collection_name in target_collections:
            try:
                count = db[collection_name].count_documents({})
                logger.info(f"{collection_name}: {count} documents")  # 여기서 확인 가능
                if count == 0:
                    continue

                schools = db[collection_name].distinct('school')
                schools = [school for school in schools if school]
                if not schools:
                    schools = ['고등학교']

                subject_names = {
                    'history': '한국사',
                    'korea': '국어',
                    'eng': '영어'
                }

                subject_info = {
                    'id': collection_name,
                    'name': subject_names.get(collection_name, collection_name),
                    'schools': schools,
                    'question_count': count
                }
                subjects.append(subject_info)
                logger.info(f"과목 추가: {subject_info['name']} - {count}문제")

            except Exception as e:
                logger.error(f"컬렉션 {collection_name} 처리 오류: {e}")
                continue

        if not subjects:
            logger.warning("사용 가능한 과목이 없습니다.")

        return jsonify(subjects)

    except Exception as e:
        logger.error(f"과목 조회 오류: {e}")
        return jsonify({'error': 'Failed to fetch subjects'}), 500



@app.route('/api/grades', methods=['GET'])
def get_grades():
    """특정 과목과 학교의 사용 가능한 학년 반환 - 실제 데이터 기반"""
    try:
        subject = request.args.get('subject')
        school = request.args.get('school')

        if not subject or not school:
            return jsonify({'error': 'Subject and school are required'}), 400

        if db is None:
            raise Exception("Database not connected")

        # 해당 과목과 학교의 학년 정보 추출
        query = {}
        if school != 'all':  # 'all'이 아닌 경우에만 학교 필터 적용
            query['school'] = school

        grades = db[subject].distinct('grade', query)
        logger.info(f"학년 조회: {subject}, {school} -> {grades}")

        # 학년 데이터 정규화
        normalized_grades = []
        for grade in grades:
            if isinstance(grade, str):
                # "1학년" -> 1, "고1" -> 1 등
                grade_num = None
                if '학년' in grade:
                    grade_num = int(grade.replace('학년', ''))
                elif grade.isdigit():
                    grade_num = int(grade)
                elif grade.startswith('고') and len(grade) == 2:
                    grade_num = int(grade[1])
                elif grade.startswith('중') and len(grade) == 2:
                    grade_num = int(grade[1])

                if grade_num and 1 <= grade_num <= 3:
                    normalized_grades.append(grade_num)
            elif isinstance(grade, (int, float)):
                grade_num = int(grade)
                if 1 <= grade_num <= 3:
                    normalized_grades.append(grade_num)

        # 중복 제거 및 정렬
        normalized_grades = sorted(list(set(normalized_grades)))

        # 데이터가 없으면 기본값 반환
        if not normalized_grades:
            normalized_grades = [1, 2, 3]
            logger.warning(f"학년 데이터 없음, 기본값 사용: {normalized_grades}")

        return jsonify(normalized_grades)

    except Exception as e:
        logger.error(f"학년 조회 오류: {e}")
        return jsonify({'error': 'Failed to fetch grades'}), 500


@app.route('/api/questions', methods=['GET'])
def get_questions():
    """시험 모드용 전체 문제 반환 - 실제 데이터"""
    try:
        subject = request.args.get('subject')
        school = request.args.get('school')
        grade = request.args.get('grade')
        mode = request.args.get('mode', 'exam')

        if not all([subject, school, grade]):
            return jsonify({'error': 'Subject, school, and grade are required'}), 400

        if db is None:
            raise Exception("Database not connected")

        # 쿼리 구성 - 실제 데이터 구조에 맞게
        query = {}

        # 학교 필터 (데이터에 school 필드가 있는 경우)
        if school and school != 'all':
            query['school'] = school

        # 학년 필터 - 다양한 형식 지원
        grade_queries = [
            int(grade),  # 숫자
            f"{grade}학년",  # "1학년"
            f"고{grade}",  # "고1"
            f"중{grade}",  # "중1"
            grade  # 원본 그대로
        ]

        query['$or'] = [{'grade': g} for g in grade_queries]

        logger.info(f"문제 조회 쿼리: {query}")

        # 문제 조회 (시험 모드에서는 최대 50개 제한)
        limit = 50 if mode == 'exam' else 10
        questions = list(db[subject].find(query).limit(limit))

        logger.info(f"조회된 문제 수: {len(questions)}")

        # 데이터 매핑
        mapped_questions = []
        for q in questions:
            try:
                mapped_q = map_question_data(q, subject)
                mapped_questions.append(mapped_q)
            except Exception as e:
                logger.error(f"문제 매핑 오류: {e}, 원본 데이터: {q}")
                continue

        return jsonify(mapped_questions)

    except Exception as e:
        logger.error(f"문제 조회 오류: {e}")
        return jsonify({'error': 'Failed to fetch questions'}), 500


@app.route('/api/question/random', methods=['GET'])
def get_random_question():
    """연습 모드용 랜덤 문제 반환 - 실제 데이터"""
    try:
        subject = request.args.get('subject')
        school = request.args.get('school')
        grade = request.args.get('grade')
        exclude = request.args.get('exclude', '')

        if not all([subject, school, grade]):
            return jsonify({'error': 'Subject, school, and grade are required'}), 400

        if db is None:
            raise Exception("Database not connected")

        # 쿼리 구성
        query = {}

        if school and school != 'all':
            query['school'] = school

        # 학년 필터
        grade_queries = [
            int(grade),
            f"{grade}학년",
            f"고{grade}",
            f"중{grade}",
            grade
        ]
        query['$or'] = [{'grade': g} for g in grade_queries]

        # 제외할 문제 ID 처리
        if exclude:
            try:
                exclude_ids = []
                for id_str in exclude.split(','):
                    id_str = id_str.strip()
                    if id_str:
                        # ObjectId 또는 일반 ID 모두 지원
                        try:
                            exclude_ids.append(ObjectId(id_str))
                        except:
                            exclude_ids.append(id_str)
                            if id_str.isdigit():
                                exclude_ids.append(int(id_str))

                if exclude_ids:
                    query['_id'] = {'$nin': exclude_ids}
                    query['id'] = {'$nin': exclude_ids}
            except Exception as e:
                logger.warning(f"제외 ID 처리 오류: {e}")

        # 사용 가능한 문제 수 확인
        total_count = db[subject].count_documents(query)
        logger.info(f"랜덤 문제 후보: {total_count}개")

        if total_count == 0:
            return jsonify(None)  # 더 이상 문제가 없음

        # 랜덤 문제 선택
        random_skip = random.randint(0, total_count - 1)
        random_question = db[subject].find(query).skip(random_skip).limit(1)
        random_question = list(random_question)

        if not random_question:
            return jsonify(None)

        # 데이터 매핑
        mapped_question = map_question_data(random_question[0], subject)

        return jsonify(mapped_question)

    except Exception as e:
        logger.error(f"랜덤 문제 조회 오류: {e}")
        return jsonify({'error': 'Failed to fetch random question'}), 500


@app.route('/api/debug/collection/<collection_name>', methods=['GET'])
def debug_collection(collection_name):
    """디버깅용: 컬렉션 데이터 구조 확인"""
    try:
        if db is None:
            return jsonify({'error': 'Database not connected'}), 500

        # 첫 번째 문서 조회
        first_doc = db[collection_name].find_one()
        if first_doc:
            # ObjectId를 문자열로 변환
            first_doc['_id'] = str(first_doc['_id'])

        # 전체 문서 수
        total_count = db[collection_name].count_documents({})

        # 사용된 필드들
        pipeline = [
            {"$project": {"arrayofkeyvalue": {"$objectToArray": "$$ROOT"}}},
            {"$unwind": "$arrayofkeyvalue"},
            {"$group": {"_id": None, "allkeys": {"$addToSet": "$arrayofkeyvalue.k"}}}
        ]

        try:
            result = list(db[collection_name].aggregate(pipeline))
            all_fields = result[0]['allkeys'] if result else []
        except:
            all_fields = list(first_doc.keys()) if first_doc else []

        return jsonify({
            'collection': collection_name,
            'total_count': total_count,
            'first_document': first_doc,
            'all_fields': all_fields,
            'schools': db[collection_name].distinct('school'),
            'grades': db[collection_name].distinct('grade')
        })

    except Exception as e:
        logger.error(f"디버깅 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

    
@app.route('/api/admin/total-questions', methods=['GET'])
def get_total_question_count():
    """전체 과목의 총 문제 수를 반환"""
    try:
        if db is None:
            raise Exception("Database not connected")
        
        logger.info("=== 총 문제 수 API 호출됨 ===")
        logger.info(f"접속된 DB: {db.name}")
        logger.info(f"컬렉션 목록: {db.list_collection_names()}")

        total = 0
        for col in ['history', 'korea', 'eng']:
            count = db[col].count_documents({})
            logger.info(f"{col} 문서 수: {count}")
            total += count

        return jsonify({'total_questions': total})
    
    except Exception as e:
        logger.error(f"총 문제 수 계산 오류: {e}")
        return jsonify({'error': 'Failed to fetch total question count'}), 500






if __name__ == "__main__":
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5001,
        ssl_context=(
            'D:/2jo/moonpull/project/certs/localhost.pem',
            'D:/2jo/moonpull/project/certs/localhost-key.pem'
        ),
        use_reloader=False  # ⭐ 이게 핵심!
    )


    

    