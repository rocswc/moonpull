# Python 3.10-slim 기반
FROM python:3.10-slim

# 작업 디렉토리
WORKDIR /app

# 시스템 패키지 설치 (Whisper + SSL)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# certs 디렉토리 생성
RUN mkdir -p /app/certs

# requirements.txt 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 복사
COPY Opic_test.py .
COPY .env /app/.env

# 인증서 복사 (경로 확인 필요)
COPY ../../project/certs/localhost.pem /app/certs/localhost.pem
COPY ../../project/certs/localhost-key.pem /app/certs/localhost-key.pem

# 포트 열기
EXPOSE 8003

# 실행 명령
CMD ["uvicorn", "Opic_test:app", "--host", "0.0.0.0", "--port", "8003", \
     "--ssl-keyfile", "/app/certs/localhost-key.pem", \
     "--ssl-certfile", "/app/certs/localhost.pem", "--log-level", "info"]
