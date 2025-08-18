from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.encoders import jsonable_encoder
import whisper
import requests
import json
import tempfile
import os
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="Enhanced OPIc Test API",
    description="AI 기반 영어 말하기 평가 시스템 - MongoDB 연동",
    version="2.0.0"
)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB 설정
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "opic_test"
client = None
database = None

# Whisper 모델 로드
logger.info("Whisper 모델을 로드하는 중...")
try:
    whisper_model = whisper.load_model("medium")
    logger.info("✅ Whisper 모델 로드 완료")
except Exception as e:
    logger.error(f"❌ Whisper 모델 로드 실패: {e}")
    whisper_model = None

# Groq 설정
from groq import Groq

GROQ_API_KEY = ""
GROQ_MODEL = "llama-3.3-70b-versatile"

try:
    groq_client = Groq(api_key=GROQ_API_KEY)
    logger.info("✅ Groq 클라이언트 초기화 완료")
except Exception as e:
    logger.error(f"❌ Groq 클라이언트 초기화 실패: {e}")
    groq_client = None


# Pydantic 모델들
class Question(BaseModel):
    id: Optional[str] = None
    topic: str
    question_text: str
    difficulty: str  # beginner, intermediate, advanced


class TextSubmission(BaseModel):
    question_id: str
    user_text: str
    mode: str  # "practice" or "exam"


class ExamSession(BaseModel):
    topic: str
    question_count: int
    mode: str = "exam"


class EvaluationResult(BaseModel):
    question_id: str
    question_text: str
    user_answer: str
    transcription: Optional[str] = None
    grade: str
    score: int
    problem_understanding: Dict[str, Any]
    answer_structure: Dict[str, Any]
    content_expression: Dict[str, Any]
    topic_delivery: Dict[str, Any]
    overall_feedback: str
    timestamp: str


async def connect_to_mongodb():
    """MongoDB 연결 함수"""
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        # 연결 테스트
        await client.admin.command('ping')
        database = client[DATABASE_NAME]
        logger.info("✅ MongoDB 연결 성공")
        return True
    except Exception as e:
        logger.error(f"❌ MongoDB 연결 실패: {e}")
        return False


# 앱 시작 이벤트
@app.on_event("startup")
async def startup_event():
    logger.info("=== 애플리케이션 시작 ===")
    success = await connect_to_mongodb()
    if not success:
        logger.error("MongoDB 초기화에 실패했습니다. 애플리케이션이 제대로 작동하지 않을 수 있습니다.")


@app.on_event("shutdown")
async def shutdown_event():
    global client
    if client:
        client.close()
        logger.info("MongoDB 연결을 종료했습니다.")


class OpicEvaluator:
    """OPIc 답변 평가 클래스 - 엄격한 평가 기준 적용"""

    def create_evaluation_prompt(self, question: str, user_answer: str) -> str:
        """평가용 프롬프트 생성"""
        prompt = f"""You are a strict expert English speaking test evaluator for OPIc (Oral Proficiency Interview - computer). 
Please evaluate the following English response based on these detailed criteria:

1. Problem Understanding (문제 이해력)
   - Topic Relevance: How well does the answer match the question topic?
   - Expression Accuracy: Correctness of vocabulary and grammar
   - Meaning Clarity: Clear delivery of intent and information

2. Answer Structure (답변 구성력)
   - Sentence Formation: Grammar and sentence structure completeness
   - Tense Consistency: Appropriate use of tenses
   - Vocabulary Range: Variety and appropriateness of words used
   - Word Repetition: Minimizing same word repetition

3. Content Expression (내용 표현력)
   - Modifier Details: Use of adverbs/adjectives and detailed descriptions
   - Connector Variety: Ability to connect sentences with various conjunctions
   - Situational Appropriateness: Suitable response to the question context

4. Topic Delivery (주제 전달력)
   - Speech Volume: Speaking pace and volume
   - Speaking Speed: Natural flow of speech
   - Response Continuity: Ability to sustain answer in one go
   - Response Length: Appropriate length and content volume

STRICT SCORING GUIDELINES:
- Score 90-100: Near-native fluency, complex grammar, rich vocabulary, excellent structure
- Score 80-89: Advanced level, minor errors, good variety, well-organized
- Score 70-79: Intermediate-high, some errors, adequate vocabulary, decent structure  
- Score 60-69: Intermediate, noticeable errors, basic vocabulary, simple structure
- Score 50-59: Low-intermediate, frequent errors, limited vocabulary
- Score 40-49: Beginner-high, many errors, very basic vocabulary
- Score 30-39: Beginner, severe errors, minimal vocabulary
- Score 0-29: Unable to communicate effectively

Question: "{question}"
User's Answer: "{user_answer}"

Please provide your evaluation in the following JSON format:
{{
    "grade": "1-5 (overall grade)",
    "score": "0-100 overall numeric score",
    "problem_understanding": {{
        "score": "0-25 points",
        "feedback": "Korean feedback for 문제 이해력 (주제 일치도, 표현 정확성, 의미 전달성)"
    }},
    "answer_structure": {{
        "score": "0-25 points", 
        "feedback": "Korean feedback for 답변 구성력 (문장 형식, 시제 일치, 어휘력, 단어 중복도)"
    }},
    "content_expression": {{
        "score": "0-25 points",
        "feedback": "Korean feedback for 내용 표현력 (수식어 상세성, 접속어 다양성, 상황 대응력)"
    }},
    "topic_delivery": {{
        "score": "0-25 points",
        "feedback": "Korean feedback for 주제 전달력 (발화 성량, 말하기 속도, 답변 지속성, 답변 길이)"
    }},
    "overall_feedback": "Korean overall feedback and improvement suggestions"
}}

Be very strict with scoring. Most answers should fall in the 40-70 range unless truly exceptional."""
        return prompt

    def query_groq_api(self, prompt: str) -> Dict[str, Any]:
        """Groq API에 직접 POST 요청"""
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 800,
                "temperature": 0.3  # 더 일관된 평가를 위해 낮춤
            }

            response = requests.post(url, headers=headers, json=data)
            if response.status_code != 200:
                logger.error(f"Groq API 오류 응답: {response.text}")
                return {"error": f"API request failed: {response.text}"}

            result = response.json()
            message_content = result["choices"][0]["message"]["content"]
            return {"generated_text": message_content}

        except Exception as e:
            logger.error(f"Groq API 요청 오류: {e}")
            return {"error": f"API request failed: {str(e)}"}

    def parse_evaluation_result(self, api_response: str) -> Dict[str, Any]:
        """API 응답에서 평가 결과 파싱"""
        try:
            start_idx = api_response.find('{')
            end_idx = api_response.rfind('}') + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = api_response[start_idx:end_idx]
                evaluation = json.loads(json_str)

                grade = str(evaluation.get("grade", "2"))

                # 각 기준별 점수 추출
                problem_understanding = evaluation.get("problem_understanding", {})
                answer_structure = evaluation.get("answer_structure", {})
                content_expression = evaluation.get("content_expression", {})
                topic_delivery = evaluation.get("topic_delivery", {})

                # 총점 계산 (각 항목 25점씩)
                total_score = (
                        int(problem_understanding.get("score", 10)) +
                        int(answer_structure.get("score", 10)) +
                        int(content_expression.get("score", 10)) +
                        int(topic_delivery.get("score", 10))
                )

                return {
                    "grade": grade,
                    "score": max(0, min(100, total_score)),
                    "problem_understanding": problem_understanding,
                    "answer_structure": answer_structure,
                    "content_expression": content_expression,
                    "topic_delivery": topic_delivery,
                    "overall_feedback": evaluation.get("overall_feedback", "평가가 완료되었습니다.")
                }
            else:
                raise ValueError("JSON format not found in response")

        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"응답 파싱 오류: {e}")
            return self.generate_fallback_evaluation(api_response)

    def generate_fallback_evaluation(self, user_answer: str) -> Dict[str, Any]:
        """API 파싱 실패 시 엄격한 기본 평가 결과 생성"""
        word_count = len(user_answer.split())
        sentence_count = len([s for s in user_answer.split('.') if s.strip()])

        # 문법 오류 간단 체크
        grammar_issues = []
        if ' i ' in user_answer.lower() or user_answer.startswith('i '):
            grammar_issues.append("대문자 I 사용")
        if user_answer.count('a') + user_answer.count('an') + user_answer.count('the') < word_count * 0.1:
            grammar_issues.append("관사 사용 부족")

        # 각 기준별 점수 계산 (25점씩)
        if word_count >= 80 and sentence_count >= 6:
            scores = {
                "problem_understanding": 18,
                "answer_structure": 17,
                "content_expression": 16,
                "topic_delivery": 19
            }
            grade = "4"
        elif word_count >= 50 and sentence_count >= 4:
            scores = {
                "problem_understanding": 15,
                "answer_structure": 14,
                "content_expression": 13,
                "topic_delivery": 16
            }
            grade = "3"
        elif word_count >= 30 and sentence_count >= 3:
            scores = {
                "problem_understanding": 12,
                "answer_structure": 10,
                "content_expression": 11,
                "topic_delivery": 12
            }
            grade = "2"
        elif word_count >= 10:
            scores = {
                "problem_understanding": 8,
                "answer_structure": 7,
                "content_expression": 8,
                "topic_delivery": 9
            }
            grade = "1"
        else:
            scores = {
                "problem_understanding": 5,
                "answer_structure": 4,
                "content_expression": 5,
                "topic_delivery": 6
            }
            grade = "1"

        total_score = sum(scores.values())

        return {
            "grade": grade,
            "score": total_score,
            "problem_understanding": {
                "score": scores["problem_understanding"],
                "feedback": f"질문 이해도: {'상' if scores['problem_understanding'] >= 15 else '중' if scores['problem_understanding'] >= 10 else '하'}. 주제와의 연관성과 핵심 내용 파악 능력을 향상시켜야 합니다."
            },
            "answer_structure": {
                "score": scores["answer_structure"],
                "feedback": f"문법 정확도: {'상' if scores['answer_structure'] >= 15 else '중' if scores['answer_structure'] >= 10 else '하'}. 문장 구조와 시제 사용, 어휘 다양성에서 개선이 필요합니다."
            },
            "content_expression": {
                "score": scores["content_expression"],
                "feedback": f"표현력: {'상' if scores['content_expression'] >= 15 else '중' if scores['content_expression'] >= 10 else '하'}. 수식어와 접속어를 활용한 풍부한 표현 연습이 필요합니다."
            },
            "topic_delivery": {
                "score": scores["topic_delivery"],
                "feedback": f"전달력: {'상' if scores['topic_delivery'] >= 15 else '중' if scores['topic_delivery'] >= 10 else '하'}. 답변 길이와 내용의 지속성을 개선해야 합니다."
            },
            "overall_feedback": f"총 {total_score}점입니다. 전반적으로 {'중급' if total_score >= 60 else '초급'} 수준으로 평가되며, 특히 {'문법 정확성' if min(scores.values()) == scores['answer_structure'] else '표현력' if min(scores.values()) == scores['content_expression'] else '문제 이해력'}에 집중적인 학습이 필요합니다."
        }

    async def evaluate_response(self, question: str, user_answer: str) -> Dict[str, Any]:
        """전체 평가 프로세스 실행"""
        logger.info(f"답변 평가 시작: {user_answer[:50]}...")

        prompt = self.create_evaluation_prompt(question, user_answer)
        api_result = self.query_groq_api(prompt)

        if "error" in api_result:
            logger.error(f"API 호출 오류: {api_result['error']}")
            return self.generate_fallback_evaluation(user_answer)

        generated_text = api_result.get("generated_text", "")
        evaluation = self.parse_evaluation_result(generated_text)

        logger.info(f"평가 완료 - 점수: {evaluation['score']}, 등급: {evaluation['grade']}")
        return evaluation


# 전역 평가자 인스턴스
evaluator = OpicEvaluator()


# API 엔드포인트들

@app.get("/")
async def root():
    """API 상태 확인 엔드포인트"""
    return {
        "message": "Enhanced OPIc Test API is running",
        "version": "2.0.0",
        "features": ["Audio & Text Submission", "Practice & Exam Mode", "MongoDB Integration", "Detailed Evaluation"],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/topics")
async def get_topics():
    """사용 가능한 모든 주제 반환"""
    global database

    if database is None:
        if not await connect_to_mongodb():
            raise HTTPException(status_code=500, detail="데이터베이스 연결에 실패했습니다.")

    try:
        pipeline = [
            {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        topics = await database.questions.aggregate(pipeline).to_list(length=None)
        result = [{"topic": topic["_id"], "question_count": topic["count"]} for topic in topics]

        logger.info(f"주제 조회 성공: {len(result)}개 주제")
        return result

    except Exception as e:
        logger.error(f"주제 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"주제를 가져오는 중 오류가 발생했습니다: {str(e)}")


@app.get("/questions/{topic}")
async def get_questions_by_topic(topic: str, difficulty: Optional[str] = None, limit: Optional[int] = None):
    """주제별 질문 조회"""
    global database

    if database is None:
        if not await connect_to_mongodb():
            raise HTTPException(status_code=500, detail="데이터베이스 연결에 실패했습니다.")

    try:
        filter_query = {"topic": topic}
        if difficulty:
            filter_query["difficulty"] = difficulty

        cursor = database.questions.find(filter_query)
        if limit:
            cursor = cursor.limit(limit)

        questions = await cursor.to_list(length=None)

        if not questions:
            logger.warning(f"주제 '{topic}'에 대한 질문을 찾을 수 없습니다.")
            raise HTTPException(status_code=404, detail=f"주제 '{topic}'에 대한 질문을 찾을 수 없습니다.")

        # ObjectId를 문자열로 변환
        for question in questions:
            question["id"] = str(question["_id"])
            del question["_id"]

        logger.info(f"'{topic}' 주제의 질문 {len(questions)}개 조회 성공")
        return questions

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"질문 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"질문을 가져오는 중 오류가 발생했습니다: {str(e)}")


@app.post("/exam-session")
async def create_exam_session(session: ExamSession):
    """시험 세션 생성 - 주제별 문제 선택"""
    global database

    if database is None:
        if not await connect_to_mongodb():
            raise HTTPException(status_code=500, detail="데이터베이스 연결에 실패했습니다.")

    try:
        questions = await database.questions.find(
            {"topic": session.topic}
        ).limit(session.question_count).to_list(length=None)

        if len(questions) < session.question_count:
            raise HTTPException(
                status_code=400,
                detail=f"요청한 문제 수({session.question_count})보다 사용 가능한 문제가 적습니다. (사용 가능: {len(questions)})"
            )

        # 세션 정보 저장
        session_data = {
            "topic": session.topic,
            "question_count": session.question_count,
            "questions": [str(q["_id"]) for q in questions],
            "created_at": datetime.now(),
            "status": "active"
        }

        session_result = await database.exam_sessions.insert_one(session_data)
        session_id = str(session_result.inserted_id)

        # 질문들의 ObjectId를 문자열로 변환
        for question in questions:
            question["id"] = str(question["_id"])
            del question["_id"]

        logger.info(f"시험 세션 생성 성공: {session_id}")
        return {
            "session_id": session_id,
            "questions": questions,
            "topic": session.topic
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"시험 세션 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"시험 세션 생성 중 오류가 발생했습니다: {str(e)}")


@app.options("/evaluate-audio")
async def options_evaluate_audio():
    """CORS preflight 요청 처리"""
    return {"message": "OK"}


@app.post("/evaluate-audio")
async def evaluate_audio_response(
        audio: UploadFile = File(...),
        question_id: str = Form(...),
        mode: str = Form("practice")
):
    global database

    if database is None:
        if not await connect_to_mongodb():
            raise HTTPException(status_code=500, detail="데이터베이스 연결에 실패했습니다.")

    if not whisper_model:
        raise HTTPException(status_code=500, detail="음성 인식 모델이 로드되지 않았습니다.")

    temp_audio_path = None   # 🔹 미리 선언
    transcription = None     # 🔹 미리 선언

    try:
        # 질문 정보 가져오기
        question_doc = await database.questions.find_one({"_id": ObjectId(question_id)})
        if not question_doc:
            raise HTTPException(status_code=404, detail="질문을 찾을 수 없습니다.")

        # 음성 파일 임시 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        # Whisper로 음성 변환
        result = whisper_model.transcribe(temp_audio_path)
        transcription = result.get("text", "").strip()

        if not transcription:
            raise HTTPException(status_code=400, detail="음성에서 텍스트를 인식할 수 없습니다.")

        # AI 평가
        evaluation = await evaluator.evaluate_response(
            question_doc["question_text"], transcription
        )

        response = {
            "question_id": question_id,
            "question_text": question_doc["question_text"],
            "transcription": transcription,
            "user_answer": transcription,
            "grade": evaluation["grade"],
            "score": evaluation["score"],
            "problem_understanding": evaluation["problem_understanding"],
            "answer_structure": evaluation["answer_structure"],
            "content_expression": evaluation["content_expression"],
            "topic_delivery": evaluation["topic_delivery"],
            "overall_feedback": evaluation["overall_feedback"],
            "mode": mode,
            "timestamp": datetime.now().isoformat()
        }

        if mode != "practice":
            await database.evaluations.insert_one(response)

        logger.info(f"음성 평가 완료 - 점수: {evaluation['score']}")
        return jsonable_encoder(response)  # 🔹 안전하게 JSON 변환

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"음성 평가 오류: {e}")
        raise HTTPException(status_code=500, detail=f"음성 평가 중 오류가 발생했습니다: {str(e)}")
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.unlink(temp_audio_path)
            except Exception as e:
                logger.warning(f"임시 파일 삭제 실패: {e}")


@app.options("/evaluate-text")
async def options_evaluate_text():
    """CORS preflight 요청 처리"""
    return {"message": "OK"}


@app.post("/evaluate-text")
async def evaluate_text_response(submission: TextSubmission):
    """텍스트 답변 평가"""
    global database

    if database is None:
        if not await connect_to_mongodb():
            raise HTTPException(status_code=500, detail="데이터베이스 연결에 실패했습니다.")

    try:
        # 질문 정보 가져오기
        question_doc = await database.questions.find_one({"_id": ObjectId(submission.question_id)})
        if not question_doc:
            raise HTTPException(status_code=404, detail="질문을 찾을 수 없습니다.")

        # AI 평가
        evaluation = await evaluator.evaluate_response(question_doc["question_text"], submission.user_text)

        response = {
            "question_id": submission.question_id,
            "question_text": question_doc["question_text"],
            "user_answer": submission.user_text,
            "grade": evaluation["grade"],
            "score": evaluation["score"],
            "problem_understanding": evaluation["problem_understanding"],
            "answer_structure": evaluation["answer_structure"],
            "content_expression": evaluation["content_expression"],
            "topic_delivery": evaluation["topic_delivery"],
            "overall_feedback": evaluation["overall_feedback"],
            "mode": submission.mode,
            "timestamp": datetime.now().isoformat()
        }

        # 연습 모드가 아닌 경우 결과 저장
        if submission.mode != "practice":
            await database.evaluations.insert_one(response)

        logger.info(f"텍스트 평가 완료 - 점수: {evaluation['score']}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"텍스트 평가 오류: {e}")
        raise HTTPException(status_code=500, detail=f"텍스트 평가 중 오류가 발생했습니다: {str(e)}")


@app.get("/exam-results/{session_id}")
async def get_exam_results(session_id: str):
    """시험 세션 결과 조회"""
    global database

    if not database:
        if not await connect_to_mongodb():
            raise HTTPException(status_code=500, detail="데이터베이스 연결에 실패했습니다.")

    try:
        # 세션 정보 가져오기
        session = await database.exam_sessions.find_one({"_id": ObjectId(session_id)})
        if not session:
            raise HTTPException(status_code=404, detail="시험 세션을 찾을 수 없습니다.")

        # 해당 세션의 평가 결과들 가져오기
        evaluations = await database.evaluations.find({
            "question_id": {"$in": session["questions"]}
        }).to_list(length=None)

        # 평균 점수 계산
        if evaluations:
            avg_score = sum([eval["score"] for eval in evaluations]) / len(evaluations)
            avg_grade = sum([int(eval["grade"]) for eval in evaluations]) / len(evaluations)
        else:
            avg_score = 0
            avg_grade = 0

        return {
            "session_id": session_id,
            "topic": session["topic"],
            "total_questions": session["question_count"],
            "completed_questions": len(evaluations),
            "average_score": round(avg_score, 1),
            "average_grade": round(avg_grade, 1),
            "evaluations": evaluations,
            "created_at": session["created_at"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"시험 결과 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"시험 결과 조회 중 오류가 발생했습니다: {str(e)}")


@app.get("/health")
async def health_check():
    try:
        # 컬렉션에서 간단한 작업으로 연결 확인
        collection_names = await database.list_collection_names()

        return {
            "status": "healthy",
            "mongodb": {
                "status": "connected"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "mongodb": {
                "status": "error",
                "error": str(e)
            }
        }

    health_data = {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "whisper_model": "loaded" if whisper_model else "unavailable",
        "groq_api": "ready" if groq_client else "unavailable",
        "mongodb": {
            "status": db_status,
            "url": MONGODB_URL,
            "database": DATABASE_NAME
        },
        "timestamp": datetime.now().isoformat()
    }

    if db_error:
        health_data["mongodb"]["error"] = db_error

    return health_data


# 추가 디버깅 엔드포인트
@app.get("/debug/mongodb")
async def debug_mongodb():
    """MongoDB 연결 및 데이터 상태 디버깅"""
    global client, database

    debug_info = {
        "client_status": "connected" if client else "not_connected",
        "database_status": "available" if database else "not_available",
        "mongodb_url": MONGODB_URL,
        "database_name": DATABASE_NAME
    }

    try:
        if database is None:
            await connect_to_mongodb()

        if database is not None:
            # 데이터베이스 목록
            db_list = await client.list_database_names()
            debug_info["available_databases"] = db_list

            # 컬렉션 목록
            collections = await database.list_collection_names()
            debug_info["collections"] = collections

            # questions 컬렉션 통계
            if "questions" in collections:
                count = await database.questions.count_documents({})
                debug_info["questions_count"] = count

                # 주제별 통계
                pipeline = [
                    {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
                    {"$sort": {"_id": 1}}
                ]
                topics = await database.questions.aggregate(pipeline).to_list(length=None)
                debug_info["topics"] = topics

                # 샘플 문서
                if count > 0:
                    sample = await database.questions.find_one()
                    debug_info["sample_question"] = {
                        "id": str(sample["_id"]),
                        "topic": sample.get("topic"),
                        "difficulty": sample.get("difficulty"),
                        "question_preview": sample.get("question_text", "")[:100] + "..."
                    }
            else:
                debug_info["questions_collection"] = "not_found"

    except Exception as e:
        debug_info["error"] = str(e)
        debug_info["error_type"] = type(e).__name__

    return debug_info


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "Opic_test:app",  # 파일명에 맞게 수정하세요
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )