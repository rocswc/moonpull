import os
import json
from pymongo import MongoClient

# MongoDB 연결
client = MongoClient("mongodb://192.168.0.44:27017/")
db = client["quiz"]  # 이게 DB 이름 (지금은 안 보이지만, 저장되면 나타남)
collection = db["korea"]   # 원하는 Collection 이름

# JSON 파일이 있는 폴더 경로
folder_path = 'json_lan_kr'

# 폴더 내 모든 JSON 파일 반복
for filename in os.listdir(folder_path):
    if filename.endswith('.json'):
        file_path = os.path.join(folder_path, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

            # 데이터가 리스트인지, 단일 객체인지에 따라 다르게 삽입
            if isinstance(data, list):
                collection.insert_many(data)
            else:
                collection.insert_one(data)

print(" 데이터 삽입 완료!")

# # 샘플 데이터 넣기
# sample_problem = {
#     "question": "2 + 2 = ?",
#     "options": ["3", "4", "5", "6"],
#     "answer": "4"
# }
#
# collection.insert_one(sample_problem)
# print("✅ 샘플 문제 저장 완료!")
