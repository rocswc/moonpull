import os
import json
import re

# 번호 이모지, 숫자 번호 매핑 함수
def emoji_to_number(emoji):
    mapping = {'①':1,'②':2,'③':3,'④':4,'⑤':5,'⑥':6,'⑦':7,'⑧':8,'⑨':9,'⑩':10}
    return mapping.get(emoji, None)

def extract_choices_with_numbers(text):
    parts = re.split(r'(?:^|\n)\s*([①-⑩1-9][\.\)]?)\s*', text)
    if parts and parts[0].strip() == '':
        parts = parts[1:]
    choices = {}
    # parts 길이가 홀수여야 번호-내용 쌍이 맞음
    if len(parts) % 2 != 0:
        print(f"Warning: unexpected choice text format:\n{text}\nparts: {parts}")
        return choices  # 빈 dict 반환, 무시

    for i in range(0, len(parts), 2):
        num = parts[i].rstrip('.)').strip()
        content = parts[i+1].strip()
        if num and content:
            choices[num] = content
        else:
            print(f"Warning: empty num or content in choices:\nnum: '{num}', content: '{content}'")
    return choices

def number_sort_key(num_str):
    # 번호(이모지 or 숫자) → 숫자로 변환해서 정렬 키 반환
    if not num_str:
        return 9999
    n = num_str[0]  # 첫 글자만 확인
    emoji_map = {'①':1,'②':2,'③':3,'④':4,'⑤':5,'⑥':6,'⑦':7,'⑧':8,'⑨':9,'⑩':10}
    if n in emoji_map:
        return emoji_map[n]
    try:
        return int(re.sub(r'\D', '', num_str))
    except:
        return 9999

def preprocess_single_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        sample = json.load(f)

    question_text = ""
    passage_text = ""
    correct_answers_raw = []
    wrong_answers_raw = []
    explanation_text = ""
    school = sample.get("raw_data_info", {}).get("school", "")
    grade = sample.get("raw_data_info", {}).get("grade", "")
    subject = sample.get("raw_data_info", {}).get("subject", "")

    for item in sample.get("learning_data_info", []):
        if item.get("class_name") == "문항":
            question_text = " ".join([x.get("text_description", "") for x in item.get("class_info_list", [])])
        elif item.get("class_name") == "지문":
            passage_text = " ".join([x.get("text_description", "") for x in item.get("class_info_list", [])])
        elif item.get("class_name") == "정답":
            for x in item.get("class_info_list", []):
                correct_answers_raw.append(x.get("text_description", ""))
        elif item.get("class_name") == "오답":
            for x in item.get("class_info_list", []):
                wrong_answers_raw.append(x.get("text_description", ""))
        elif item.get("class_name") == "해설":
            explanation_text = " ".join([x.get("text_description", "") for x in item.get("class_info_list", [])])

    # 정답 선택지 번호+내용 딕셔너리
    correct_choices_dict = {}
    for c in correct_answers_raw:
        correct_choices_dict.update(extract_choices_with_numbers(c))

    # 오답 선택지 번호+내용 딕셔너리
    wrong_choices_dict = {}
    for w in wrong_answers_raw:
        wrong_choices_dict.update(extract_choices_with_numbers(w))

    # 전체 선택지 번호 키값 통합
    all_choices_dict = {**correct_choices_dict, **wrong_choices_dict}

    # 번호 기준 정렬
    sorted_nums = sorted(all_choices_dict.keys(), key=number_sort_key)

    # 보기 리스트 번호 붙여서 생성
    final_choices = [f"{i+1}. {all_choices_dict[num]}" for i, num in enumerate(sorted_nums)]

    # 정답 번호에서 인덱스 찾아서 1-based 정답 리스트 생성
    correct_indexes = []
    for num in correct_choices_dict.keys():
        try:
            idx = sorted_nums.index(num)
            correct_indexes.append(idx + 1)
        except ValueError:
            pass

    return {
        "school": school,
        "grade": grade,
        "subject": subject,
        "question": question_text.strip(),
        "passage": passage_text.strip(),
        "choices": final_choices,
        "answer": correct_indexes,
        "explanation": explanation_text.strip()
    }

def preprocess_folder(input_folder, output_filepath):
    processed = []
    for filename in os.listdir(input_folder):
        if filename.endswith('.json'):
            fullpath = os.path.join(input_folder, filename)
            try:
                processed_data = preprocess_single_file(fullpath)
                processed.append(processed_data)
                print(f"Processed {filename}")
            except Exception as e:
                print(f"Failed to process {filename}: {e}")

    with open(output_filepath, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    print(f"All processed data saved to {output_filepath}")

if __name__ == "__main__":
    input_folder = "json_garbage"  # 폴더 경로
    output_file = "./kr.json"   # 결과 파일명
    preprocess_folder(input_folder, output_file)
