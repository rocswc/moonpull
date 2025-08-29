# ======== 빌드 스테이지 ========
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ======== 실행 스테이지 ========
FROM eclipse-temurin:17-jdk
WORKDIR /app

# JAR 파일 복사
COPY --from=build /app/target/moonpull-0.0.1-SNAPSHOT.jar app.jar

# 인증서 디렉토리 복사
COPY ./project/certs /app/certs

# 443 포트 (HTTPS) 열기
EXPOSE 443

# 🔐 keystore 파일 별도 복사 (이 줄이 추가됨!)
COPY ./backend-keystore.p12 /app/certs/backend-keystore.p12

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
