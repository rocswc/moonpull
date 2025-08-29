# Python 3.10 슬림 이미지
FROM python:3.10-slim

# 작업 디렉토리
WORKDIR /app

# 시스템 패키지 설치 (PDF, OCR 등 필수)
RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# 모델 디렉토리 생성
RUN mkdir -p /model/user_network

# requirements.txt 먼저 복사 후 설치
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 소스코드 전체 복사
COPY . .

# SSL 인증서 복사 (이 경로는 프로젝트 루트 기준)
COPY ../../certs/localhost.pem /app/certs/localhost.pem
COPY ../../certs/localhost-key.pem /app/certs/localhost-key.pem

# 포트 오픈
EXPOSE 5000

# 앱 실행
CMD ["python", "multi.py"]
