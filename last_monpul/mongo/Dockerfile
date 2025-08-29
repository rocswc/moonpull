# Python 3.10 슬림 이미지
FROM python:3.10-slim

WORKDIR /app

# 시스템 패키지 설치 (SSL용)
RUN apt-get update && apt-get install -y \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 모델 및 인증서 디렉토리 생성
RUN mkdir -p /model/user_network
RUN mkdir -p /app/certs

# requirements.txt 복사 및 설치
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# 소스코드 복사
COPY app.py .
COPY ./.env /app/.env
COPY ../../project/certs/localhost.pem /app/certs/localhost.pem
COPY ../../project/certs/localhost-key.pem /app/certs/localhost-key.pem


# 포트 오픈
EXPOSE 5001

# 실행 명령
CMD ["python", "app.py"]
