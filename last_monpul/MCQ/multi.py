import os
import re
import tempfile
import atexit
import traceback
from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
import pdfplumber
import docx
from werkzeug.utils import secure_filename
from fpdf import FPDF
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import easyocr

# Flask 앱 설정
app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['RESULTS_FOLDER'] = 'results/'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'txt', 'docx', 'png', 'jpg', 'jpeg', 'img'}

# 폴더 생성
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)

uploaded_files = []

def cleanup_files():
    for file_path in uploaded_files:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"정리됨: {file_path}")
        except Exception as e:
            print(f"파일 정리 실패 {file_path}: {e}")
    uploaded_files.clear()

atexit.register(cleanup_files)

# EasyOCR 리더 초기화
reader = easyocr.Reader(['ko', 'en'], gpu=True,
                        model_storage_directory='/model/user_network',
                        user_network_directory='/model/user_network')

# LangChain LLM 초기화
llm = ChatGroq(
    api_key="",
    model="llama-3.3-70b-versatile",
    temperature=0.0
)

prompt_template = PromptTemplate(
    input_variables=["context", "num_questions", "question_type"],
    template="""
당신은 사용자의 텍스트로부터 {question_type} 문제를 생성하는 AI 도우미입니다.

다음은 제공된 텍스트입니다:
{context}

총 {num_questions}개의 {question_type} 문제를 생성하세요.

- 객관식일 경우: 질문, 보기 A, B, C, D, E, 정답을 포함하세요.
- 주관식일 경우: 질문, 정답, 간단한 해설을 포함하세요.

형식 예시:
## 문제
질문: [질문 내용]
A) [선택지 A] (객관식만)
B) [선택지 B]
C) [선택지 C]
D) [선택지 D]
E) [선택지 E]
정답: [정답]
해설: [선택적 설명]
"""
)

problem_chain = LLMChain(llm=llm, prompt=prompt_template)

def cleanup_old_files(folder_path, max_age_hours=1):
    import time
    current_time = time.time()
    try:
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                if file_age > max_age_hours * 3600:
                    os.remove(file_path)
                    print(f"오래된 파일 삭제: {file_path}")
    except Exception as e:
        print(f"파일 정리 중 오류: {e}")

def make_safe_filename(filename):
    name, ext = os.path.splitext(filename)
    safe_name = re.sub(r'[^\w\s-]', '_', name)
    safe_name = re.sub(r'[-\s]+', '_', safe_name)
    safe_name = re.sub(r'_+', '_', safe_name).strip('_')
    if len(safe_name) > 50:
        safe_name = safe_name[:50]
    return safe_name + ext

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_from_image(file_path):
    result = reader.readtext(file_path, detail=0, paragraph=True)
    return '\n'.join(result)

def extract_text_from_file(file_path):
    if '.' not in file_path:
        print(f"[오류] 파일 경로에 확장자가 없습니다: {file_path}")
        return None  # 또는 raise ValueError("파일 확장자가 없습니다.")
    
    ext = file_path.rsplit('.', 1)[1].lower()
    
    try:
        if ext == 'pdf':
            with pdfplumber.open(file_path) as pdf:
                return ''.join([page.extract_text() for page in pdf.pages if page.extract_text()])
        elif ext == 'docx':
            doc = docx.Document(file_path)
            return ' '.join([para.text for para in doc.paragraphs])
        elif ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        elif ext in {'png', 'jpg', 'jpeg', 'img'}:
            return extract_text_from_image(file_path)
        else:
            print(f"[오류] 지원하지 않는 파일 확장자: .{ext}")
            return None
    except Exception as e:
        print(f"[오류] 텍스트 추출 실패: {e}")
        return None

def generate_problems(text, num_questions, question_type):
    return problem_chain.run({
        "context": text,
        "num_questions": num_questions,
        "question_type": question_type
    }).strip()

def separate_problems_and_answers(content, question_type):
    lines = content.split('\n')
    problems_only = []
    full_content = content
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('## 문제'):
            problems_only.append(lines[i])
            i += 1
            while i < len(lines):
                current_line = lines[i].strip()
                if current_line.startswith('정답:') or current_line.startswith('해설:'):
                    while i < len(lines) and not lines[i].strip().startswith('## 문제'):
                        i += 1
                    break
                problems_only.append(lines[i])
                i += 1
        else:
            i += 1
    return {
        'full': full_content,
        'problems_only': '\n'.join(problems_only)
    }

def save_to_file(content, filename):
    path = os.path.join(app.config['RESULTS_FOLDER'], filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return path

def create_pdf(content, filename):
    pdf = FPDF()
    pdf.add_page()
    try:
        pdf.add_font('MalgunGothic', '', r'C:\Windows\Fonts\malgun.ttf', uni=True)
        pdf.set_font('MalgunGothic', size=12)
    except:
        try:
            pdf.add_font('AppleGothic', '', '/System/Library/Fonts/AppleGothic.ttf', uni=True)
            pdf.set_font('AppleGothic', size=12)
        except:
            pdf.set_font('Arial', size=12)
    for section in content.split("##"):
        if section.strip():
            try:
                pdf.multi_cell(0, 10, section.strip())
                pdf.ln(5)
            except:
                ascii_content = section.encode('ascii', 'ignore').decode('ascii')
                pdf.multi_cell(0, 10, ascii_content)
                pdf.ln(5)
    path = os.path.join(app.config['RESULTS_FOLDER'], filename)
    pdf.output(path)
    return path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    try:
        cleanup_old_files(app.config['UPLOAD_FOLDER'], max_age_hours=1)
        cleanup_old_files(app.config['RESULTS_FOLDER'], max_age_hours=1)

        if 'file' not in request.files:
            return jsonify({"error": "파일이 업로드되지 않았습니다."}), 400

        file = request.files['file']
        if not file or not allowed_file(file.filename):
            return jsonify({"error": "파일 형식이 잘못되었거나 업로드에 실패했습니다."}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        uploaded_files.append(file_path)

        text = extract_text_from_file(file_path)
        if not text or text.strip() == '':
            os.remove(file_path)
            uploaded_files.remove(file_path)
            return jsonify({"error": "텍스트 추출에 실패했습니다."}), 400

        num_questions = int(request.form['num_questions'])
        question_type = request.form['question_type']

        result_text = generate_problems(text, num_questions, question_type)
        separated_results = separate_problems_and_answers(result_text, question_type)

        safe_base_name = make_safe_filename(filename.rsplit('.', 1)[0])

        problems_only_txt = f"{question_type}_problems_only_{safe_base_name}.txt"
        problems_only_pdf = f"{question_type}_problems_only_{safe_base_name}.pdf"
        save_to_file(separated_results['problems_only'], problems_only_txt)
        create_pdf(separated_results['problems_only'], problems_only_pdf)

        full_txt = f"{question_type}_full_answers_{safe_base_name}.txt"
        full_pdf = f"{question_type}_full_answers_{safe_base_name}.pdf"
        save_to_file(separated_results['full'], full_txt)
        create_pdf(separated_results['full'], full_pdf)

        os.remove(file_path)
        uploaded_files.remove(file_path)

        return jsonify({
            "success": True,
            "results": separated_results,
            "files": {
                'problems_only_txt': problems_only_txt,
                'problems_only_pdf': problems_only_pdf,
                'full_txt': full_txt,
                'full_pdf': full_pdf
            },
            "message": f"{num_questions}개의 {question_type} 문제가 성공적으로 생성되었습니다."
        })

    except Exception as e:
        print("==== 오류 발생 ====")
        traceback.print_exc()
        print("===================")
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
                if file_path in uploaded_files:
                    uploaded_files.remove(file_path)
            except Exception as cleanup_error:
                print("파일 정리 중 오류:")
                traceback.print_exc()
        return jsonify({"error": f"문제 생성 중 오류가 발생했습니다: {str(e)}"}), 500

@app.route('/api/download/<filename>')
def download_file(filename):
    try:
        path = os.path.join(app.config['RESULTS_FOLDER'], filename)
        if not os.path.exists(path):
            return jsonify({"error": "파일을 찾을 수 없습니다."}), 404
        return send_file(path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"파일 다운로드 중 오류가 발생했습니다: {str(e)}"}), 500

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "API가 정상적으로 작동중입니다."})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
