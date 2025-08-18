from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import random
import re

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["quiz"]
collection = db["korean"]

def extract_choices(choice_text):
    pattern = r"(?:^|\n)\s*(\d+[.)]|[①②③④⑤⑥⑦⑧⑨⑩])\s*"
    parts = re.split(pattern, choice_text)
    cleaned = []
    for i in range(1, len(parts)-1, 2):
        text = parts[i+1].strip().replace("\n", " ")
        if text:
            cleaned.append(text)
    return cleaned

def extract_texts(items, target_class_name):
    texts = []
    for item in items:
        if item.get("class_name") == target_class_name:
            for ci in item.get("class_info_list", []):
                text = ci.get("text_description", "").strip()
                if text:
                    texts.append(text)
    return texts

@app.route("/question")
def get_question():
    school = request.args.get("school")  # e.g., "중학교"
    grade = request.args.get("grade")    # e.g., "1학년"

    query = {
        "raw_data_info.school": school,
        "raw_data_info.grade": grade
    }

    question_list = list(collection.find(query))
    if not question_list:
        return jsonify({"error": "No question found"}), 404

    q = random.choice(question_list)
    ld = q.get("learning_data_info", [])

    passage_texts = extract_texts(ld, "지문")
    question_texts = extract_texts(ld, "문항")
    correct_texts_raw = extract_texts(ld, "정답")
    wrong_texts_raw = extract_texts(ld, "오답")
    explanation_texts = extract_texts(ld, "해설")

    # 선택지 분리
    correct_choices = []
    for txt in correct_texts_raw:
        extracted = extract_choices(txt)
        correct_choices.extend(extracted if extracted else [txt])

    wrong_choices = []
    for txt in wrong_texts_raw:
        extracted = extract_choices(txt)
        wrong_choices.extend(extracted if extracted else [txt])

    # 전체 보기 셔플
    all_choices = list(set(correct_choices + wrong_choices))  # 중복 제거
    random.shuffle(all_choices)

    # 정답 위치 인덱스 찾기 (1-based)
    correct_indexes = [i + 1 for i, ch in enumerate(all_choices) if ch in correct_choices]

    result = {
        "passage": " ".join(passage_texts),
        "question_text": " ".join(question_texts),
        "choices": all_choices,
        "correct_indexes": correct_indexes,
        "correct_answers": correct_choices,
        "explanation": " ".join(explanation_texts)
    }

    return jsonify(result)

# ✅ 총 문제 수 반환 API (별도 route)
@app.route("/api/admin/total-questions", methods=["GET"])
def get_total_questions():
    try:
        total = collection.count_documents({})
        return jsonify({"total_questions": total}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
