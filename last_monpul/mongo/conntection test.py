#!/usr/bin/env python3
import pymongo
from pymongo import MongoClient
from pprint import pprint

# MongoDB 연결 - 데이터베이스 이름을 'quiz'로 변경
client = MongoClient('mongodb://192.168.0.44:27017')
db = client['quiz']  # 변경됨


def check_quiz_database():
    """quiz 데이터베이스의 실제 데이터 확인"""
    print("🔍 quiz 데이터베이스 실제 데이터 확인")
    print("=" * 60)

    # 모든 컬렉션 확인
    collections = db.list_collection_names()
    print(f"📁 사용 가능한 컬렉션들: {collections}")

    if not collections:
        print("❌ 컬렉션이 없습니다!")
        return

    print()

    target_collections = ['history', 'korea', 'eng']

    for collection_name in target_collections:
        if collection_name in collections:
            print(f"=== 📚 {collection_name.upper()} 컬렉션 ===")

            # 전체 문서 수
            total_count = db[collection_name].count_documents({})
            print(f"📊 전체 문제 수: {total_count}")

            if total_count > 0:
                # 첫 번째 문서 구조 확인
                first_doc = db[collection_name].find_one()
                print("\n📋 첫 번째 문서 구조:")
                if '_id' in first_doc:
                    first_doc['_id'] = str(first_doc['_id'])
                pprint(first_doc, width=100, depth=3)

                # 필드명들 확인
                sample_docs = list(db[collection_name].find().limit(10))
                all_fields = set()
                for doc in sample_docs:
                    all_fields.update(doc.keys())
                print(f"\n📝 사용된 필드들: {sorted(all_fields)}")

                # 중요 필드들 분석
                print(f"\n🔍 데이터 분석:")

                # ID 필드 확인
                if 'id' in all_fields:
                    ids = db[collection_name].distinct('id')
                    print(f"   📋 ID 범위: {len(ids)}개 (예: {ids[:5] if len(ids) >= 5 else ids})")

                # School 필드 확인
                if 'school' in all_fields:
                    schools = db[collection_name].distinct('school')
                    print(f"   🏫 학교: {schools}")
                else:
                    print(f"   ⚠️  'school' 필드가 없습니다")

                # Grade 필드 확인
                if 'grade' in all_fields:
                    grades = db[collection_name].distinct('grade')
                    print(f"   📊 학년: {grades} (타입들: {[type(g).__name__ for g in grades[:3]]})")
                else:
                    print(f"   ⚠️  'grade' 필드가 없습니다")

                # Question 필드 확인
                if 'question' in all_fields:
                    sample_questions = list(
                        db[collection_name].find({'question': {'$exists': True}}, {'question': 1}).limit(3))
                    print(f"   ❓ 문제 예시:")
                    for i, q in enumerate(sample_questions, 1):
                        question_text = q.get('question', '없음')[:60] + "..."
                        print(f"      {i}. {question_text}")

                # Choices 필드 확인
                if 'choices' in all_fields:
                    sample_choice = db[collection_name].find_one({'choices': {'$exists': True}})
                    if sample_choice and 'choices' in sample_choice:
                        choices = sample_choice['choices']
                        print(
                            f"   ✅ 선택지 형식: {type(choices).__name__} (개수: {len(choices) if isinstance(choices, list) else '?'})")
                        if isinstance(choices, list) and choices:
                            print(f"      예시: {choices[0][:50]}...")

                # Answer 필드 확인
                if 'answer' in all_fields:
                    answers = db[collection_name].distinct('answer')
                    answer_types = list(set([type(a).__name__ for a in answers[:5]]))
                    print(f"   🎯 정답 형식: {answer_types} (예시값: {answers[:5]})")

                # Explanation 필드 확인
                if 'explanation' in all_fields:
                    explanation_count = db[collection_name].count_documents(
                        {'explanation': {'$exists': True, '$ne': ''}})
                    print(f"   💡 해설 있는 문제: {explanation_count}개")

                # 학교-학년별 분포
                print(f"\n📈 학교-학년별 문제 분포:")
                if 'school' in all_fields and 'grade' in all_fields:
                    pipeline = [
                        {'$group': {
                            '_id': {'school': '$school', 'grade': '$grade'},
                            'count': {'$sum': 1}
                        }},
                        {'$sort': {'_id.school': 1, '_id.grade': 1}}
                    ]

                    distribution = list(db[collection_name].aggregate(pipeline))
                    for item in distribution:
                        school = item['_id'].get('school', 'null')
                        grade = item['_id'].get('grade', 'null')
                        count = item['count']
                        print(f"   - {school} {grade}: {count}문제")
                else:
                    print(f"   ⚠️  school 또는 grade 필드가 없어서 분포 확인 불가")

            else:
                print(f"   ❌ 데이터가 없습니다")

            print("-" * 60)
            print()
        else:
            print(f"❌ '{collection_name}' 컬렉션이 존재하지 않습니다.")
            print()


def test_api_queries():
    """API에서 사용할 쿼리들 미리 테스트"""
    print("\n🧪 API 쿼리 테스트")
    print("=" * 40)

    test_cases = [
        ('history', '고등학교', '1'),
        ('history', '중학교', '2'),
        ('korea', '고등학교', '1'),
        ('eng', '중학교', '1'),
        ('eng', '고등학교', '2')
    ]

    for subject, school, grade in test_cases:
        if subject in db.list_collection_names():
            print(f"\n--- {subject} | {school} | {grade}학년 ---")

            # 다양한 학년 형식으로 쿼리 테스트
            grade_queries = [
                {'grade': int(grade)},
                {'grade': f"{grade}학년"},
                {'grade': f"고{grade}"},
                {'grade': f"중{grade}"},
                {'grade': grade}
            ]

            total_found = 0
            for i, grade_query in enumerate(grade_queries):
                query = {'school': school, **grade_query}
                count = db[subject].count_documents(query)
                if count > 0:
                    print(f"  ✅ 쿼리 {i + 1} ({grade_query['grade']}): {count}문제")
                    total_found += count

                    # 첫 번째로 찾은 문제의 실제 grade 값 확인
                    if count > 0:
                        sample = db[subject].find_one(query)
                        actual_grade = sample.get('grade', 'None')
                        print(f"     실제 grade 값: {actual_grade} ({type(actual_grade).__name__})")
                        break

            if total_found == 0:
                print(f"  ❌ 조건에 맞는 문제 없음")
                # 해당 subject에서 사용 가능한 school, grade 값들 확인
                available_schools = db[subject].distinct('school')
                available_grades = db[subject].distinct('grade')
                print(f"     사용 가능한 학교: {available_schools}")
                print(f"     사용 가능한 학년: {available_grades}")


def suggest_next_steps():
    """다음 단계 제안"""
    print("\n💡 다음 단계")
    print("=" * 30)
    print("1. 위 데이터 구조를 확인한 후 Flask API의 map_question_data() 함수 수정")
    print("2. React 앱에서 실제 데이터로 테스트")
    print("3. 필요시 데이터 형식 통일화")
    print("\n🚀 Flask 서버 실행:")
    print("   python app.py")
    print("\n📊 API 테스트:")
    print("   http://localhost:5000/api/health")
    print("   http://localhost:5000/api/debug/collection/history")


if __name__ == "__main__":
    check_quiz_database()
    test_api_queries()
    suggest_next_steps()