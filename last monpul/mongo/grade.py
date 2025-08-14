import json

# 변환할 JSON 파일 경로
input_file = "eng_task.json"
output_file = "eng.json"

# JSON 로드
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# 숫자 → "n학년" 변환
for item in data:
    if isinstance(item.get("grade"), int):
        item["grade"] = f"{item['grade']}학년"

# 변환된 JSON 저장
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"변환 완료: {output_file}")
