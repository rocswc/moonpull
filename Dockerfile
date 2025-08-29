# ======== 빌드 스테이지 ========
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# 프로젝트 전체 복사
COPY . .

# Maven 빌드 (테스트 생략)
RUN mvn clean package -DskipTests


# ======== 실행 스테이지 ========
FROM eclipse-temurin:17-jdk
WORKDIR /app

# 빌드된 JAR 복사
COPY --from=build /app/target/moonpull-0.0.1-SNAPSHOT.jar app.jar

# application.properties 복사 (src/main/resources에서 꺼냄)
COPY ./src/main/resources/application.properties /app/application.properties

# 인증서 디렉토리 복사 (있을 경우)
COPY ./project/certs /app/certs

# 443 포트 (HTTPS)
EXPOSE 443

# 애플리케이션 실행 - 외부 설정파일을 우선 적용
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=file:/app/application.properties"]
